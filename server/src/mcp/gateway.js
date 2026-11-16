import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { db } from '../storage/db.js';

class McpGateway {
  constructor() {
    this.activeClients = new Map(); // serverId -> { client, transport, tools }
    this.init();
  }

  async init() {
    console.log('[MCP Gateway] Initializing MCP servers...');
    const servers = db.data.mcpServers || [];
    for (const server of servers) {
      if (server.enabled && server.type === 'stdio') {
        try {
          await this.connectServer(server);
        } catch (err) {
          console.warn(`[MCP Gateway] Could not connect server "${server.name}":`, err.message);
          this.updateServerStatus(server.id, 'error', err.message);
        }
      }
    }
  }

  async connectServer(serverConfig) {
    if (serverConfig.type === 'builtin') {
      return;
    }

    if (this.activeClients.has(serverConfig.id)) {
      await this.disconnectServer(serverConfig.id);
    }

    console.log(`[MCP Gateway] Connecting to stdio server "${serverConfig.name}" (${serverConfig.command})...`);

    const transport = new StdioClientTransport({
      command: serverConfig.command,
      args: serverConfig.args || [],
      env: { ...process.env, ...(serverConfig.env || {}) }
    });

    const client = new Client(
      {
        name: 'kortex-workspace',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    await client.connect(transport);
    const toolsResponse = await client.listTools();
    const tools = (toolsResponse.tools || []).map((t) => ({
      name: `${serverConfig.id}__${t.name}`,
      originalName: t.name,
      serverId: serverConfig.id,
      description: t.description || '',
      parameters: t.inputSchema || { type: 'object', properties: {} },
      isSensitive: this.detectSensitivity(t.name, t.description)
    }));

    this.activeClients.set(serverConfig.id, { client, transport, tools });
    this.updateServerStatus(serverConfig.id, 'connected', null, tools);

    console.log(`[MCP Gateway] Server "${serverConfig.name}" connected with ${tools.length} tools.`);
  }

  async disconnectServer(serverId) {
    const entry = this.activeClients.get(serverId);
    if (entry) {
      try {
        await entry.transport.close();
      } catch (e) {
        console.warn(`[MCP Gateway] Error closing transport for ${serverId}:`, e.message);
      }
      this.activeClients.delete(serverId);
    }
    this.updateServerStatus(serverId, 'disconnected');
  }

  updateServerStatus(serverId, status, error = null, tools = null) {
    const sIdx = db.data.mcpServers.findIndex((s) => s.id === serverId);
    if (sIdx !== -1) {
      db.data.mcpServers[sIdx].status = status;
      db.data.mcpServers[sIdx].lastError = error;
      db.data.mcpServers[sIdx].lastConnected = status === 'connected' ? new Date().toISOString() : db.data.mcpServers[sIdx].lastConnected;
      if (tools) {
        db.data.mcpServers[sIdx].tools = tools;
      }
      db.save();
    }
  }

  detectSensitivity(toolName, description = '') {
    const text = `${toolName} ${description}`.toLowerCase();
    const sensitiveWords = [
      'delete', 'remove', 'drop', 'write', 'update', 'create', 'send', 'post',
      'execute', 'kill', 'modify', 'push', 'commit', 'patch', 'publish', 'email', 'order'
    ];
    return sensitiveWords.some((word) => text.includes(word));
  }

  // Returns all available tools across built-in workspace and active MCP servers
  getAllTools() {
    const tools = [];

    // 1. Built-in Kortex Core tools
    const coreServer = (db.data.mcpServers || []).find((s) => s.id === 'mcp-kortex-core');
    if (coreServer && coreServer.enabled) {
      tools.push(...(coreServer.tools || []).map((t) => ({ ...t, serverId: 'mcp-kortex-core' })));
    }

    // 2. Active external MCP servers
    for (const [serverId, entry] of this.activeClients.entries()) {
      tools.push(...entry.tools);
    }

    return tools;
  }

  // Execute a tool safely
  async callTool(toolName, args = {}) {
    console.log(`[MCP Gateway] Executing tool: ${toolName}`, args);

    // 1. Handle Built-in Tools
    if (!toolName.includes('__')) {
      return await this.executeBuiltinTool(toolName, args);
    }

    // 2. Handle External MCP Tools
    const [serverId, originalToolName] = toolName.split('__');
    const entry = this.activeClients.get(serverId);
    if (!entry) {
      throw new Error(`MCP-сервер "${serverId}" не подключен.`);
    }

    try {
      const result = await entry.client.callTool({
        name: originalToolName,
        arguments: args
      });
      return result;
    } catch (err) {
      console.error(`[MCP Gateway] Error executing ${toolName}:`, err.message);
      throw new Error(`Ошибка выполнения инструмента MCP: ${err.message}`);
    }
  }

  async executeBuiltinTool(toolName, args) {
    switch (toolName) {
      case 'get_current_time': {
        const now = new Date();
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                iso: now.toISOString(),
                date: now.toLocaleDateString('ru-RU'),
                time: now.toLocaleTimeString('ru-RU'),
                dayOfWeek: days[now.getDay()],
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              })
            }
          ]
        };
      }

      case 'search_workspace': {
        const q = (args.query || '').toLowerCase();
        const matchedTasks = (db.data.tasks || []).filter(
          (t) => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
        );
        const matchedProjects = (db.data.projects || []).filter(
          (p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
        );
        const matchedMemories = (db.data.memories || []).filter(
          (m) => m.title.toLowerCase().includes(q) || (m.content || '').toLowerCase().includes(q)
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                tasks: matchedTasks,
                projects: matchedProjects,
                memories: matchedMemories
              }, null, 2)
            }
          ]
        };
      }

      case 'create_task': {
        const newTask = {
          id: `task-${Date.now()}`,
          title: args.title,
          description: args.description || '',
          priority: args.priority || 'medium',
          dueDate: args.dueDate || new Date().toISOString().split('T')[0],
          projectId: args.projectId || null,
          completed: false,
          createdAt: new Date().toISOString()
        };
        db.data.tasks.unshift(newTask);
        db.save();

        // Log to activity
        db.data.activity.unshift({
          id: `act-${Date.now()}`,
          type: 'task',
          action: 'Создана задача через ассистента',
          target: args.title,
          details: `Приоритет: ${newTask.priority}, срок: ${newTask.dueDate}`,
          status: 'success',
          timestamp: new Date().toISOString()
        });
        db.save();

        return {
          content: [
            {
              type: 'text',
              text: `Задача "${newTask.title}" успешно создана с приоритетом "${newTask.priority}" на ${newTask.dueDate}.`
            }
          ]
        };
      }

      case 'save_memory': {
        const newMemory = {
          id: `mem-${Date.now()}`,
          title: args.title,
          content: args.content,
          category: args.category || 'context',
          projectId: args.projectId || null,
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.data.memories.unshift(newMemory);
        db.save();

        // Log to activity
        db.data.activity.unshift({
          id: `act-${Date.now()}`,
          type: 'memory',
          action: 'Сохранено воспоминание в память',
          target: args.title,
          details: args.content.slice(0, 80),
          status: 'success',
          timestamp: new Date().toISOString()
        });
        db.save();

        return {
          content: [
            {
              type: 'text',
              text: `Информация успешно сохранена в память ассистента: "${newMemory.title}".`
            }
          ]
        };
      }

      default:
        throw new Error(`Неизвестный встроенный инструмент: ${toolName}`);
    }
  }
}

export const mcpGateway = new McpGateway();

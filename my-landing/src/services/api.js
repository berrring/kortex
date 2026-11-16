const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.ownerToken = localStorage.getItem('kortex_owner_token') || '';
    this.isServerOnline = false;
  }

  setOwnerToken(token) {
    this.ownerToken = token;
    if (token) {
      localStorage.setItem('kortex_owner_token', token);
    } else {
      localStorage.removeItem('kortex_owner_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.ownerToken) {
      headers['X-Owner-Token'] = this.ownerToken;
    }
    return headers;
  }

  async health() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        this.isServerOnline = true;
        return await res.json();
      }
    } catch {
      this.isServerOnline = false;
    }
    return { status: 'offline', mode: 'local' };
  }

  // --- Chat & Conversations ---
  async getConversations() {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.conversations;
      }
    } catch (err) {
      console.warn('[API] Server unreachable, fallback to localStorage conversations', err.message);
    }
    // Fallback
    try {
      return JSON.parse(localStorage.getItem('kortex_conversations') || '[]');
    } catch {
      return [];
    }
  }

  async createConversation(title = 'Новый диалог') {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        const data = await res.json();
        return data.conversation;
      }
    } catch (err) {
      console.warn('[API] Server unreachable, creating local conversation');
    }
    // Fallback local
    const newConv = {
      id: `conv-${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    const list = await this.getConversations();
    list.unshift(newConv);
    localStorage.setItem('kortex_conversations', JSON.stringify(list));
    return newConv;
  }

  async getConversation(id) {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${id}`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.conversation;
      }
    } catch (err) {}
    const list = await this.getConversations();
    return list.find((c) => c.id === id) || null;
  }

  async updateConversation(id, body) {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        return data.conversation;
      }
    } catch (err) {}
    const list = await this.getConversations();
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...body, updatedAt: new Date().toISOString() };
      localStorage.setItem('kortex_conversations', JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  async deleteConversation(id) {
    try {
      await fetch(`${API_BASE}/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (err) {}
    const list = await this.getConversations();
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem('kortex_conversations', JSON.stringify(filtered));
    return true;
  }

  // --- Real AI Streaming ---
  async streamChat({ messages, conversationId, projectId, onChunk, onToolCall, onApprovalRequired, onDone, onError, abortSignal }) {
    try {
      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ messages, conversationId, projectId }),
        signal: abortSignal
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Ошибка сервера (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const event = JSON.parse(trimmed.slice(6));
              if (event.type === 'chunk') onChunk(event.chunk);
              if (event.type === 'tool_call') onToolCall(event);
              if (event.type === 'approval_required') onApprovalRequired(event);
              if (event.type === 'done') onDone(event.content);
              if (event.type === 'error') onError(event.error);
            } catch (pErr) {}
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        onDone();
        return;
      }
      onError(err);
    }
  }

  async approveTool({ toolCallId, toolName, arguments: toolArgs, conversationId, approved }) {
    const res = await fetch(`${API_BASE}/chat/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ toolCallId, toolName, arguments: toolArgs, conversationId, approved })
    });
    return await res.json();
  }

  // --- MCP Servers & Tools ---
  async getMcpServers() {
    try {
      const res = await fetch(`${API_BASE}/mcp/servers`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.servers;
      }
    } catch (err) {}
    return [];
  }

  async addMcpServer(serverData) {
    const res = await fetch(`${API_BASE}/mcp/servers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(serverData)
    });
    return await res.json();
  }

  async connectMcpServer(id) {
    const res = await fetch(`${API_BASE}/mcp/servers/${id}/connect`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return await res.json();
  }

  async disconnectMcpServer(id) {
    const res = await fetch(`${API_BASE}/mcp/servers/${id}/disconnect`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return await res.json();
  }

  async deleteMcpServer(id) {
    const res = await fetch(`${API_BASE}/mcp/servers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return await res.json();
  }

  async getMcpTools() {
    try {
      const res = await fetch(`${API_BASE}/mcp/tools`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.tools;
      }
    } catch (err) {}
    return [];
  }

  async callMcpTool(toolName, args = {}) {
    const res = await fetch(`${API_BASE}/mcp/call`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ toolName, arguments: args })
    });
    return await res.json();
  }

  // --- Projects ---
  async getProjects() {
    try {
      const res = await fetch(`${API_BASE}/projects`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.projects;
      }
    } catch (err) {}
    try {
      return JSON.parse(localStorage.getItem('kortex_projects') || '[]');
    } catch {
      return [];
    }
  }

  async createProject(project) {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const data = await res.json();
        return data.project;
      }
    } catch (err) {}
    const newProj = {
      id: `proj-${Date.now()}`,
      ...project,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const list = await this.getProjects();
    list.unshift(newProj);
    localStorage.setItem('kortex_projects', JSON.stringify(list));
    return newProj;
  }

  async updateProject(id, project) {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const data = await res.json();
        return data.project;
      }
    } catch (err) {}
    const list = await this.getProjects();
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...project, updatedAt: new Date().toISOString() };
      localStorage.setItem('kortex_projects', JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  async deleteProject(id) {
    try {
      await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (err) {}
    const list = await this.getProjects();
    const filtered = list.filter((p) => p.id !== id);
    localStorage.setItem('kortex_projects', JSON.stringify(filtered));
    return true;
  }

  // --- Tasks ---
  async getTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.tasks;
      }
    } catch (err) {}
    try {
      return JSON.parse(localStorage.getItem('kortex_tasks') || '[]');
    } catch {
      return [];
    }
  }

  async createTask(task) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(task)
      });
      if (res.ok) {
        const data = await res.json();
        return data.task;
      }
    } catch (err) {}
    const newTask = {
      id: `task-${Date.now()}`,
      ...task,
      completed: false,
      createdAt: new Date().toISOString()
    };
    const list = await this.getTasks();
    list.unshift(newTask);
    localStorage.setItem('kortex_tasks', JSON.stringify(list));
    return newTask;
  }

  async updateTask(id, task) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(task)
      });
      if (res.ok) {
        const data = await res.json();
        return data.task;
      }
    } catch (err) {}
    const list = await this.getTasks();
    const idx = list.findIndex((t) => t.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...task };
      localStorage.setItem('kortex_tasks', JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  async deleteTask(id) {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (err) {}
    const list = await this.getTasks();
    const filtered = list.filter((t) => t.id !== id);
    localStorage.setItem('kortex_tasks', JSON.stringify(filtered));
    return true;
  }

  // --- Memory ---
  async getMemories() {
    try {
      const res = await fetch(`${API_BASE}/memory`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.memories;
      }
    } catch (err) {}
    try {
      return JSON.parse(localStorage.getItem('kortex_memories') || '[]');
    } catch {
      return [];
    }
  }

  async createMemory(memory) {
    try {
      const res = await fetch(`${API_BASE}/memory`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(memory)
      });
      if (res.ok) {
        const data = await res.json();
        return data.memory;
      }
    } catch (err) {}
    const newMem = {
      id: `mem-${Date.now()}`,
      ...memory,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const list = await this.getMemories();
    list.unshift(newMem);
    localStorage.setItem('kortex_memories', JSON.stringify(list));
    return newMem;
  }

  async updateMemory(id, memory) {
    try {
      const res = await fetch(`${API_BASE}/memory/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(memory)
      });
      if (res.ok) {
        const data = await res.json();
        return data.memory;
      }
    } catch (err) {}
    const list = await this.getMemories();
    const idx = list.findIndex((m) => m.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...memory, updatedAt: new Date().toISOString() };
      localStorage.setItem('kortex_memories', JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  async deleteMemory(id) {
    try {
      await fetch(`${API_BASE}/memory/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (err) {}
    const list = await this.getMemories();
    const filtered = list.filter((m) => m.id !== id);
    localStorage.setItem('kortex_memories', JSON.stringify(filtered));
    return true;
  }

  // --- Activity ---
  async getActivity() {
    try {
      const res = await fetch(`${API_BASE}/activity`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.activity;
      }
    } catch (err) {}
    try {
      return JSON.parse(localStorage.getItem('kortex_v1_activities') || '[]');
    } catch {
      return [];
    }
  }

  async clearActivity() {
    try {
      await fetch(`${API_BASE}/activity`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (err) {}
    localStorage.removeItem('kortex_v1_activities');
    return true;
  }

  // --- Settings ---
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.settings;
      }
    } catch (err) {}
    return {
      aiProvider: 'openai',
      aiBaseUrl: 'https://api.openai.com/v1',
      aiModel: 'gpt-4o-mini',
      hasApiKey: false,
      voiceSpeed: 1.0,
      autoVoiceResponse: false,
      theme: 'dark',
      memoryEnabled: true
    };
  }

  async saveSettings(settings) {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await res.json();
        return data.settings;
      }
    } catch (err) {}
    return settings;
  }
}

export const api = new ApiClient();

import express from 'express';
import { db } from '../storage/db.js';
import { mcpGateway } from '../mcp/gateway.js';

export const mcpRouter = express.Router();

// List all MCP servers
mcpRouter.get('/servers', (req, res) => {
  res.json({ servers: db.data.mcpServers || [] });
});

// Register new MCP server
mcpRouter.post('/servers', async (req, res) => {
  const { name, command, args = [], env = {}, description = '' } = req.body;
  if (!name || !command) {
    return res.status(400).json({ error: 'Поля "name" и "command" обязательны.' });
  }

  const newServer = {
    id: `mcp-${Date.now()}`,
    name,
    description,
    type: 'stdio',
    command,
    args,
    env,
    enabled: true,
    status: 'connecting',
    lastConnected: null,
    tools: []
  };

  db.data.mcpServers.push(newServer);
  db.save();

  try {
    await mcpGateway.connectServer(newServer);
    res.json({ server: newServer, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message, server: newServer });
  }
});

// Reconnect an MCP server
mcpRouter.post('/servers/:id/connect', async (req, res) => {
  const server = (db.data.mcpServers || []).find((s) => s.id === req.params.id);
  if (!server) {
    return res.status(404).json({ error: 'Сервер не найден' });
  }
  try {
    server.enabled = true;
    await mcpGateway.connectServer(server);
    res.json({ success: true, server });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disconnect an MCP server
mcpRouter.post('/servers/:id/disconnect', async (req, res) => {
  const server = (db.data.mcpServers || []).find((s) => s.id === req.params.id);
  if (!server) {
    return res.status(404).json({ error: 'Сервер не найден' });
  }
  server.enabled = false;
  await mcpGateway.disconnectServer(server.id);
  res.json({ success: true, server });
});

// Delete MCP server
mcpRouter.delete('/servers/:id', async (req, res) => {
  if (req.params.id === 'mcp-kortex-core') {
    return res.status(400).json({ error: 'Встроенный сервер Kortex Core нельзя удалить.' });
  }
  await mcpGateway.disconnectServer(req.params.id);
  db.data.mcpServers = (db.data.mcpServers || []).filter((s) => s.id !== req.params.id);
  db.save();
  res.json({ success: true });
});

// List all available tools across all servers
mcpRouter.get('/tools', (req, res) => {
  const tools = mcpGateway.getAllTools();
  res.json({ tools });
});

// Directly execute an MCP tool (for testing from the UI)
mcpRouter.post('/call', async (req, res) => {
  const { toolName, arguments: toolArgs = {} } = req.body;
  if (!toolName) {
    return res.status(400).json({ error: 'Параметр "toolName" обязателен.' });
  }
  try {
    const result = await mcpGateway.callTool(toolName, toolArgs);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

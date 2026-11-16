import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './storage/db.js';
import { mcpGateway } from './mcp/gateway.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { mcpRouter } from './routes/mcp.js';
import { projectsRouter } from './routes/projects.js';
import { tasksRouter } from './routes/tasks.js';
import { memoryRouter } from './routes/memory.js';
import { activityRouter } from './routes/activity.js';
import { settingsRouter } from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for local development
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Single-Owner authentication middleware
app.use('/api', (req, res, next) => {
  // Always permit public auth check and health check
  if (req.path === '/auth/status' || req.path === '/auth/verify' || req.path === '/health') {
    return next();
  }

  const configuredToken = db.secrets.ownerToken || process.env.OWNER_TOKEN;
  if (!configuredToken) {
    // Development mode: open for local owner
    return next();
  }

  const token = req.headers['x-owner-token'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token === configuredToken) {
    return next();
  }

  return res.status(401).json({
    error: 'UNAUTHORIZED_OWNER_ACCESS',
    message: 'Требуется токен владельца Kortex'
  });
});

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/mcp', mcpRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/activity', activityRouter);
app.use('/api/settings', settingsRouter);

// System health endpoint
app.get('/api/health', (req, res) => {
  const configuredToken = db.secrets.ownerToken || process.env.OWNER_TOKEN;
  const hasKey = Boolean(db.secrets.apiKey || process.env.AI_API_KEY);
  const activeMcp = (db.data.mcpServers || []).filter((s) => s.status === 'connected').length;

  res.json({
    status: 'ok',
    app: 'Kortex Personal AI Workspace & MCP Bridge',
    mode: configuredToken ? 'protected' : 'development',
    aiConfigured: hasKey,
    activeMcpServers: activeMcp,
    timestamp: new Date().toISOString()
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Kortex Backend & MCP Bridge running on http://localhost:${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Mode: ${db.secrets.ownerToken ? 'Protected (Owner Token)' : 'Local Development'}`);
  console.log(`====================================================`);
});

// Clean shutdown for MCP child processes
const cleanup = async () => {
  console.log('\n[Kortex Server] Shutting down gracefully...');
  for (const [id] of mcpGateway.activeClients) {
    await mcpGateway.disconnectServer(id);
  }
  server.close(() => {
    console.log('[Kortex Server] Closed.');
    process.exit(0);
  });
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

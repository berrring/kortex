import express from 'express';
import { db } from '../storage/db.js';
import { aiProvider } from '../ai/provider.js';
import { mcpGateway } from '../mcp/gateway.js';

export const chatRouter = express.Router();

// Get all conversations
chatRouter.get('/conversations', (req, res) => {
  const convs = (db.data.conversations || []).map((c) => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    messageCount: (c.messages || []).length,
    lastMessage: c.messages?.[c.messages.length - 1]?.content?.slice(0, 80) || ''
  }));
  res.json({ conversations: convs });
});

// Create new conversation
chatRouter.post('/conversations', (req, res) => {
  const { title = 'Новый диалог' } = req.body;
  const newConv = {
    id: `conv-${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  db.data.conversations.unshift(newConv);
  db.save();
  res.json({ conversation: newConv });
});

// Get conversation messages
chatRouter.get('/conversations/:id', (req, res) => {
  const conv = (db.data.conversations || []).find((c) => c.id === req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Диалог не найден' });
  }
  res.json({ conversation: conv });
});

// Update conversation (e.g. rename or append messages)
chatRouter.put('/conversations/:id', (req, res) => {
  const conv = (db.data.conversations || []).find((c) => c.id === req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Диалог не найден' });
  }
  if (req.body.title !== undefined) conv.title = req.body.title;
  if (req.body.messages !== undefined) conv.messages = req.body.messages;
  conv.updatedAt = new Date().toISOString();
  db.save();
  res.json({ conversation: conv });
});

// Delete conversation
chatRouter.delete('/conversations/:id', (req, res) => {
  db.data.conversations = (db.data.conversations || []).filter((c) => c.id !== req.params.id);
  db.save();
  res.json({ success: true });
});

// Stream chat completion with SSE
chatRouter.post('/stream', async (req, res) => {
  const { messages = [], conversationId, projectId } = req.body;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  let assistantContent = '';

  await aiProvider.streamChat({
    messages,
    projectId,
    onChunk: (chunk) => {
      assistantContent += chunk;
      sendEvent('chunk', { chunk });
    },
    onToolCall: (data) => {
      sendEvent('tool_call', data);
    },
    onApprovalRequired: (data) => {
      sendEvent('approval_required', data);
    },
    onDone: () => {
      // Save completed assistant message if conversationId provided
      if (conversationId && assistantContent) {
        const conv = (db.data.conversations || []).find((c) => c.id === conversationId);
        if (conv) {
          conv.messages.push({
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString()
          });
          conv.updatedAt = new Date().toISOString();
          db.save();
        }
      }
      sendEvent('done', { content: assistantContent });
      res.end();
    },
    onError: (err) => {
      sendEvent('error', { error: err });
      res.end();
    }
  });
});

// Approve sensitive tool execution and continue
chatRouter.post('/approve', async (req, res) => {
  const { toolCallId, toolName, arguments: toolArgs, conversationId, messages = [], approved } = req.body;

  if (!approved) {
    return res.json({
      rejected: true,
      message: `Пользователь отклонил выполнение действия: ${toolName}`
    });
  }

  try {
    const result = await mcpGateway.callTool(toolName, toolArgs);
    const toolResultText = typeof result === 'string' ? result : JSON.stringify(result);

    // Log to activity
    db.data.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'approval',
      action: `Одобрено действие: ${toolName}`,
      target: toolName,
      details: JSON.stringify(toolArgs),
      status: 'success',
      timestamp: new Date().toISOString()
    });
    db.save();

    res.json({
      success: true,
      toolCallId,
      result: toolResultText
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

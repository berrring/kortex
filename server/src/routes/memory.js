import express from 'express';
import { db } from '../storage/db.js';

export const memoryRouter = express.Router();

memoryRouter.get('/', (req, res) => {
  res.json({ memories: db.data.memories || [] });
});

memoryRouter.post('/', (req, res) => {
  const { title, content, category = 'context', projectId = null } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Заголовок и содержимое обязательны' });
  }

  const newMemory = {
    id: `mem-${Date.now()}`,
    title,
    content,
    category,
    projectId,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.data.memories.unshift(newMemory);
  db.save();

  db.data.activity.unshift({
    id: `act-${Date.now()}`,
    type: 'memory',
    action: 'Добавлено воспоминание',
    target: title,
    details: content.slice(0, 100),
    status: 'success',
    timestamp: new Date().toISOString()
  });
  db.save();

  res.json({ memory: newMemory });
});

memoryRouter.put('/:id', (req, res) => {
  const memory = (db.data.memories || []).find((m) => m.id === req.params.id);
  if (!memory) return res.status(404).json({ error: 'Запись памяти не найдена' });

  if (req.body.title !== undefined) memory.title = req.body.title;
  if (req.body.content !== undefined) memory.content = req.body.content;
  if (req.body.category !== undefined) memory.category = req.body.category;
  if (req.body.projectId !== undefined) memory.projectId = req.body.projectId;
  if (req.body.enabled !== undefined) memory.enabled = req.body.enabled;
  memory.updatedAt = new Date().toISOString();
  db.save();

  res.json({ memory });
});

memoryRouter.delete('/:id', (req, res) => {
  db.data.memories = (db.data.memories || []).filter((m) => m.id !== req.params.id);
  db.save();
  res.json({ success: true });
});

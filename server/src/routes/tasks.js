import express from 'express';
import { db } from '../storage/db.js';

export const tasksRouter = express.Router();

tasksRouter.get('/', (req, res) => {
  res.json({ tasks: db.data.tasks || [] });
});

tasksRouter.post('/', (req, res) => {
  const { title, description = '', priority = 'medium', dueDate = '', projectId = null } = req.body;
  if (!title) return res.status(400).json({ error: 'Название задачи обязательно' });

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description,
    priority,
    dueDate,
    projectId,
    completed: false,
    createdAt: new Date().toISOString()
  };
  db.data.tasks.unshift(newTask);
  db.save();

  db.data.activity.unshift({
    id: `act-${Date.now()}`,
    type: 'task',
    action: 'Создана задача',
    target: title,
    details: `Приоритет: ${priority}`,
    status: 'success',
    timestamp: new Date().toISOString()
  });
  db.save();

  res.json({ task: newTask });
});

tasksRouter.put('/:id', (req, res) => {
  const task = (db.data.tasks || []).find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });

  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.description !== undefined) task.description = req.body.description;
  if (req.body.priority !== undefined) task.priority = req.body.priority;
  if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
  if (req.body.projectId !== undefined) task.projectId = req.body.projectId;
  if (req.body.completed !== undefined) task.completed = req.body.completed;
  db.save();

  res.json({ task });
});

tasksRouter.delete('/:id', (req, res) => {
  db.data.tasks = (db.data.tasks || []).filter((t) => t.id !== req.params.id);
  db.save();
  res.json({ success: true });
});

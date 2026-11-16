import express from 'express';
import { db } from '../storage/db.js';

export const projectsRouter = express.Router();

projectsRouter.get('/', (req, res) => {
  res.json({ projects: db.data.projects || [] });
});

projectsRouter.post('/', (req, res) => {
  const { name, description = '', notes = '', color = 'indigo' } = req.body;
  if (!name) return res.status(400).json({ error: 'Имя проекта обязательно' });

  const newProject = {
    id: `proj-${Date.now()}`,
    name,
    description,
    notes,
    color,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.data.projects.unshift(newProject);
  db.save();

  db.data.activity.unshift({
    id: `act-${Date.now()}`,
    type: 'project',
    action: 'Создан проект',
    target: name,
    details: description,
    status: 'success',
    timestamp: new Date().toISOString()
  });
  db.save();

  res.json({ project: newProject });
});

projectsRouter.put('/:id', (req, res) => {
  const project = (db.data.projects || []).find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Проект не найден' });

  if (req.body.name !== undefined) project.name = req.body.name;
  if (req.body.description !== undefined) project.description = req.body.description;
  if (req.body.notes !== undefined) project.notes = req.body.notes;
  if (req.body.status !== undefined) project.status = req.body.status;
  if (req.body.color !== undefined) project.color = req.body.color;
  project.updatedAt = new Date().toISOString();
  db.save();

  res.json({ project });
});

projectsRouter.delete('/:id', (req, res) => {
  db.data.projects = (db.data.projects || []).filter((p) => p.id !== req.params.id);
  db.save();
  res.json({ success: true });
});

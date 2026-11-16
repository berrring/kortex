import express from 'express';
import { db } from '../storage/db.js';

export const activityRouter = express.Router();

activityRouter.get('/', (req, res) => {
  res.json({ activity: db.data.activity || [] });
});

activityRouter.post('/', (req, res) => {
  const { type = 'user', action, target = '', details = '', status = 'success' } = req.body;
  const newActivity = {
    id: `act-${Date.now()}`,
    type,
    action,
    target,
    details,
    status,
    timestamp: new Date().toISOString()
  };
  db.data.activity.unshift(newActivity);
  db.save();
  res.json({ activity: newActivity });
});

activityRouter.delete('/', (req, res) => {
  db.data.activity = [];
  db.save();
  res.json({ success: true });
});

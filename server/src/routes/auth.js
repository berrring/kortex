import express from 'express';
import { db } from '../storage/db.js';

export const authRouter = express.Router();

// Verify owner access token
authRouter.post('/verify', (req, res) => {
  const configuredToken = db.secrets.ownerToken || process.env.OWNER_TOKEN;

  // In local development or if no token is configured, access is granted automatically
  if (!configuredToken) {
    return res.json({
      authenticated: true,
      mode: 'development',
      message: 'Режим локальной разработки (без пароля)'
    });
  }

  const { token } = req.body;
  if (token === configuredToken) {
    return res.json({
      authenticated: true,
      mode: 'owner',
      message: 'Доступ владельца подтвержден'
    });
  }

  res.status(401).json({
    authenticated: false,
    error: 'Неверный токен доступа владельца'
  });
});

// Check auth status
authRouter.get('/status', (req, res) => {
  const configuredToken = db.secrets.ownerToken || process.env.OWNER_TOKEN;
  res.json({
    protectionEnabled: Boolean(configuredToken),
    mode: configuredToken ? 'protected' : 'development'
  });
});

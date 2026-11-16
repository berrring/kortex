import express from 'express';
import { db } from '../storage/db.js';

export const settingsRouter = express.Router();

// Get public settings
settingsRouter.get('/', (req, res) => {
  res.json({ settings: db.getPublicSettings() });
});

// Update settings (AI provider, voice, etc.)
settingsRouter.post('/', (req, res) => {
  const {
    aiProvider,
    aiBaseUrl,
    aiModel,
    aiApiKey, // strictly stored in server secrets, never echoed back
    voiceSpeed,
    autoVoiceResponse,
    theme,
    memoryEnabled,
    ownerToken
  } = req.body;

  if (aiProvider !== undefined) db.data.settings.aiProvider = aiProvider;
  if (aiBaseUrl !== undefined) db.data.settings.aiBaseUrl = aiBaseUrl;
  if (aiModel !== undefined) db.data.settings.aiModel = aiModel;
  if (voiceSpeed !== undefined) db.data.settings.voiceSpeed = voiceSpeed;
  if (autoVoiceResponse !== undefined) db.data.settings.autoVoiceResponse = autoVoiceResponse;
  if (theme !== undefined) db.data.settings.theme = theme;
  if (memoryEnabled !== undefined) db.data.settings.memoryEnabled = memoryEnabled;

  const updatedSecrets = {};
  if (aiApiKey !== undefined) updatedSecrets.apiKey = aiApiKey;
  if (ownerToken !== undefined) {
    updatedSecrets.ownerToken = ownerToken;
    db.data.settings.ownerTokenEnabled = Boolean(ownerToken);
  }

  db.save();
  if (Object.keys(updatedSecrets).length > 0) {
    db.saveSecrets(updatedSecrets);
  }

  res.json({
    success: true,
    settings: db.getPublicSettings()
  });
});

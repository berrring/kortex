import { storage } from './storage';

const STORAGE_KEY = 'settings';

export const DEFAULT_SETTINGS = {
  profileName: 'Менеджер процессов',
  profileEmail: 'demo@kortex.local',
  workspaceName: 'Моя рабочая область',
  themePreference: 'system', // 'light' | 'dark' | 'system'
  autoSaveDrafts: true,
  createdAt: new Date().toISOString(),
};

export const settingsRepository = {
  getSettings() {
    const saved = storage.get(STORAGE_KEY, null);
    if (!saved) {
      storage.set(STORAGE_KEY, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...saved };
  },

  updateSettings(updates) {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEY, updated);
    return updated;
  },

  resetSettings() {
    storage.set(STORAGE_KEY, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },
};

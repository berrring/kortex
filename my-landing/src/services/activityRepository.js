import { storage } from './storage';

const STORAGE_KEY = 'activities';
const MAX_ACTIVITIES = 100;

export const activityRepository = {
  getActivities() {
    const list = storage.get(STORAGE_KEY, []);
    return Array.isArray(list) ? list : [];
  },

  logActivity({ action, targetType = 'workflow', targetId, targetName, details = '' }) {
    const activities = this.getActivities();
    const newEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      action, // 'created' | 'updated' | 'deleted' | 'duplicated' | 'imported'
      targetType,
      targetId: targetId || null,
      targetName: targetName || 'Сценарий',
      details,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...activities].slice(0, MAX_ACTIVITIES);
    storage.set(STORAGE_KEY, updated);
    return newEntry;
  },

  clearActivities() {
    storage.set(STORAGE_KEY, []);
    return true;
  },
};

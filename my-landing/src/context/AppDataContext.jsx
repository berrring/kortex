import { createContext, useState, useCallback } from 'react';
import { workflowRepository } from '../services/workflowRepository';
import { activityRepository } from '../services/activityRepository';
import { settingsRepository } from '../services/settingsRepository';

export const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const [workflows, setWorkflows] = useState(() => workflowRepository.getWorkflows());
  const [activities, setActivities] = useState(() => activityRepository.getActivities());
  const [settings, setSettings] = useState(() => settingsRepository.getSettings());
  const [toasts, setToasts] = useState([]);

  const reloadWorkflows = useCallback(() => {
    const list = workflowRepository.getWorkflows();
    setWorkflows(list);
  }, []);

  const reloadActivities = useCallback(() => {
    const list = activityRepository.getActivities();
    setActivities(list);
  }, []);

  const reloadSettings = useCallback(() => {
    const s = settingsRepository.getSettings();
    setSettings(s);
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateSettings = useCallback((updates) => {
    const updated = settingsRepository.updateSettings(updates);
    setSettings(updated);
    return updated;
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        workflows,
        activities,
        settings,
        reloadWorkflows,
        reloadActivities,
        reloadSettings,
        updateSettings,
        showToast,
        toasts,
        removeToast,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export { useAppData } from '../hooks/useAppData';



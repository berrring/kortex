import { storage } from './storage';
import { activityRepository } from './activityRepository';
import { STARTER_TEMPLATES } from '../data/starterTemplates';

const STORAGE_KEY = 'workflows';
const INITIAL_SEEDED_KEY = 'seeded_initial_ru_v2';

function generateId(prefix = 'wf') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Начальные демонстрационные сценарии из понятных шаблонов
function getInitialSeedWorkflows() {
  const seedTemplate1 = STARTER_TEMPLATES[0]; // Обработка новых заявок
  const seedTemplate2 = STARTER_TEMPLATES[1]; // Знакомство с новым клиентом

  return [
    {
      id: 'wf_demo_lead_intake',
      name: seedTemplate1.name,
      description: seedTemplate1.description,
      status: 'active',
      category: seedTemplate1.category,
      tags: seedTemplate1.tags,
      steps: seedTemplate1.steps.map((s, idx) => ({ ...s, id: `step_${idx + 1}` })),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'wf_demo_customer_onboarding',
      name: seedTemplate2.name,
      description: seedTemplate2.description,
      status: 'draft',
      category: seedTemplate2.category,
      tags: seedTemplate2.tags,
      steps: seedTemplate2.steps.map((s, idx) => ({ ...s, id: `step_${idx + 1}` })),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];
}

export const workflowRepository = {
  getWorkflows() {
    const isSeeded = storage.get(INITIAL_SEEDED_KEY, false);
    let workflows = storage.get(STORAGE_KEY, null);

    // Если данные пусты или не были инициализированы новой русской версией
    if ((workflows === null || !isSeeded) && (!workflows || workflows.length === 0)) {
      const initial = getInitialSeedWorkflows();
      storage.set(STORAGE_KEY, initial);
      storage.set(INITIAL_SEEDED_KEY, true);
      initial.forEach((w) => {
        activityRepository.logActivity({
          action: 'created',
          targetId: w.id,
          targetName: w.name,
          details: 'Создан демонстрационный сценарий для быстрого старта.',
        });
      });
      return initial;
    }

    return Array.isArray(workflows) ? workflows : [];
  },

  getWorkflowById(id) {
    const list = this.getWorkflows();
    return list.find((w) => w.id === id) || null;
  },

  createWorkflow(data) {
    const workflows = this.getWorkflows();
    const now = new Date().toISOString();
    const newWorkflow = {
      id: generateId('wf'),
      name: data.name?.trim() || 'Новый сценарий',
      description: data.description?.trim() || '',
      status: data.status || 'draft',
      category: data.category || 'Повседневные задачи',
      tags: Array.isArray(data.tags) ? data.tags : ['Новый'],
      steps: Array.isArray(data.steps) ? data.steps : [],
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newWorkflow, ...workflows];
    storage.set(STORAGE_KEY, updatedList);

    activityRepository.logActivity({
      action: 'created',
      targetId: newWorkflow.id,
      targetName: newWorkflow.name,
      details: `Создан сценарий из ${newWorkflow.steps.length} шага(ов).`,
    });

    return newWorkflow;
  },

  createFromTemplate(template) {
    return this.createWorkflow({
      name: template.name,
      description: template.description,
      status: 'draft',
      category: template.category,
      tags: template.tags,
      steps: template.steps.map((step, idx) => ({
        ...step,
        id: `step_${Date.now()}_${idx + 1}`,
      })),
    });
  },

  updateWorkflow(id, updates) {
    const workflows = this.getWorkflows();
    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) return null;

    const current = workflows[index];
    const updated = {
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };

    workflows[index] = updated;
    storage.set(STORAGE_KEY, workflows);

    activityRepository.logActivity({
      action: 'updated',
      targetId: updated.id,
      targetName: updated.name,
      details: `Сохранены изменения в сценарии (${updated.steps.length} шага(ов)).`,
    });

    return updated;
  },

  duplicateWorkflow(id) {
    const target = this.getWorkflowById(id);
    if (!target) return null;

    const cloned = {
      ...target,
      id: generateId('wf_copy'),
      name: `${target.name} (Копия)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: target.steps.map((s, idx) => ({
        ...s,
        id: `step_${Date.now()}_${idx}`,
      })),
    };

    const workflows = this.getWorkflows();
    storage.set(STORAGE_KEY, [cloned, ...workflows]);

    activityRepository.logActivity({
      action: 'duplicated',
      targetId: cloned.id,
      targetName: cloned.name,
      details: `Создана копия сценария «${target.name}».`,
    });

    return cloned;
  },

  deleteWorkflow(id) {
    const workflows = this.getWorkflows();
    const target = workflows.find((w) => w.id === id);
    if (!target) return false;

    const filtered = workflows.filter((w) => w.id !== id);
    storage.set(STORAGE_KEY, filtered);

    activityRepository.logActivity({
      action: 'deleted',
      targetId: id,
      targetName: target.name,
      details: 'Сценарий удален из рабочей области.',
    });

    return true;
  },

  exportWorkflowsAsJSON() {
    const workflows = this.getWorkflows();
    const payload = {
      schema: 'kortex_workflow_export_v1',
      version: 1,
      exportedAt: new Date().toISOString(),
      workspace: 'Локальная рабочая область',
      count: workflows.length,
      workflows,
    };
    return JSON.stringify(payload, null, 2);
  },

  importWorkflowsFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || (!Array.isArray(data) && !Array.isArray(data.workflows))) {
        throw new Error('Неверный формат файла. Ожидается JSON с массивом сценариев.');
      }

      const importedWorkflows = Array.isArray(data) ? data : data.workflows;
      if (importedWorkflows.length === 0) {
        throw new Error('Выбранный файл не содержит сценариев для импорта.');
      }

      const validatedList = importedWorkflows.map((item, i) => {
        if (!item.name) {
          throw new Error(`В сценарии #${i + 1} отсутствует обязательное название.`);
        }
        return {
          id: generateId('wf_imported'),
          name: String(item.name).trim(),
          description: String(item.description || '').trim(),
          status: item.status === 'active' ? 'active' : 'draft',
          category: item.category || 'Загруженные сценарии',
          tags: Array.isArray(item.tags) ? item.tags : ['Импорт'],
          steps: Array.isArray(item.steps) ? item.steps : [],
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      const current = this.getWorkflows();
      const combined = [...validatedList, ...current];
      storage.set(STORAGE_KEY, combined);

      activityRepository.logActivity({
        action: 'imported',
        targetName: `${validatedList.length} сценариев`,
        details: `Успешно загружено ${validatedList.length} сценариев из файла резервной копии.`,
      });

      return { success: true, count: validatedList.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  clearAllData() {
    storage.set(STORAGE_KEY, []);
    storage.set(INITIAL_SEEDED_KEY, true);
    activityRepository.clearActivities();
    return true;
  },
};

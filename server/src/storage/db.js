import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'kortex-db.json');
const SECRETS_FILE = path.join(DATA_DIR, 'secrets.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_DB = {
  projects: [
    {
      id: 'proj-1',
      name: 'Разработка Kortex AI',
      description: 'Создание персонального AI-ассистента и интеграция MCP-протокола',
      notes: 'Ключевые приоритеты: автономность, безопасность ключей, работа с задачами и заметками.',
      status: 'active',
      color: 'indigo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'proj-2',
      name: 'Учеба и исследования',
      description: 'Изучение архитектур агентных систем и протокола Model Context Protocol',
      notes: 'Материалы: спецификация MCP, документация Anthropic, локальные модели через Ollama.',
      status: 'active',
      color: 'emerald',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Подключить локальный MCP сервер файловой системы',
      description: 'Проверить работу stdio-транспорта в MCP Gateway',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      projectId: 'proj-1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Протестировать голосовой ввод на русском языке',
      description: 'Проверить точность распознавания Web Speech API в Chrome/Edge',
      completed: true,
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      projectId: 'proj-1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: 'Настроить переменные окружения для AI провайдера',
      description: 'Указать API-ключ в server/.env или в интерфейсе настроек',
      completed: false,
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      projectId: 'proj-1',
      createdAt: new Date().toISOString()
    }
  ],
  memories: [
    {
      id: 'mem-1',
      title: 'Предпочтительный язык общения',
      content: 'Отвечать преимущественно на естественном русском языке, лаконично и структурировано.',
      category: 'preferences',
      projectId: null,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mem-2',
      title: 'Стек разработки проекта',
      content: 'Проект Kortex использует Node.js для сервера, React 19 + Vite для клиента и @modelcontextprotocol/sdk для расширений.',
      category: 'context',
      projectId: 'proj-1',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  conversations: [
    {
      id: 'conv-default',
      title: 'Первое знакомство с Kortex',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'Привет! Я Kortex — ваш персональный AI-ассистент и мост к подключенным приложениям через протокол MCP. Чем я могу помочь сегодня?',
          timestamp: new Date().toISOString()
        }
      ]
    }
  ],
  activity: [
    {
      id: 'act-1',
      type: 'system',
      action: 'Инициализация рабочей области',
      target: 'Kortex Core',
      details: 'Рабочее пространство создано в автономном режиме.',
      status: 'success',
      timestamp: new Date().toISOString()
    }
  ],
  settings: {
    aiProvider: process.env.AI_PROVIDER || 'openai',
    aiBaseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
    voiceSpeed: 1.0,
    autoVoiceResponse: false,
    theme: 'dark',
    memoryEnabled: true,
    ownerTokenEnabled: false
  },
  mcpServers: [
    {
      id: 'mcp-kortex-core',
      name: 'Kortex Встроенные инструменты',
      description: 'Управление задачами, заметками, поиском по проектам и временем',
      type: 'builtin',
      enabled: true,
      status: 'connected',
      lastConnected: new Date().toISOString(),
      tools: [
        {
          name: 'get_current_time',
          description: 'Получить текущее системное время, дату и день недели',
          parameters: { type: 'object', properties: {} },
          isSensitive: false
        },
        {
          name: 'search_workspace',
          description: 'Поиск по задачам, проектам и сохраненным заметкам памяти',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Поисковый запрос' }
            },
            required: ['query']
          },
          isSensitive: false
        },
        {
          name: 'create_task',
          description: 'Создать новую задачу в списке дел',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Название задачи' },
              description: { type: 'string', description: 'Подробности задачи' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Приоритет задачи' },
              dueDate: { type: 'string', description: 'Срок выполнения (ГГГГ-ММ-ДД)' }
            },
            required: ['title']
          },
          isSensitive: true
        },
        {
          name: 'save_memory',
          description: 'Сохранить полезную информацию в долговременную память ассистента',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Краткий заголовок факта или правила' },
              content: { type: 'string', description: 'Содержимое для запоминания' },
              category: { type: 'string', enum: ['preferences', 'context', 'facts', 'goals'] }
            },
            required: ['title', 'content']
          },
          isSensitive: true
        }
      ]
    }
  ]
};

class Database {
  constructor() {
    this.data = this.load();
    this.secrets = this.loadSecrets();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return { ...DEFAULT_DB, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('[DB] Failed to load DB file, using defaults:', err.message);
    }
    this.save(DEFAULT_DB);
    return DEFAULT_DB;
  }

  save(data = this.data) {
    try {
      this.data = data;
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to write DB file:', err.message);
    }
  }

  loadSecrets() {
    try {
      if (fs.existsSync(SECRETS_FILE)) {
        return JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8'));
      }
    } catch (err) {
      console.warn('[DB] Failed to load secrets file:', err.message);
    }
    return {
      apiKey: process.env.AI_API_KEY || '',
      ownerToken: process.env.OWNER_TOKEN || ''
    };
  }

  saveSecrets(secrets) {
    try {
      this.secrets = { ...this.secrets, ...secrets };
      fs.writeFileSync(SECRETS_FILE, JSON.stringify(this.secrets, null, 2), { encoding: 'utf-8', mode: 0o600 });
    } catch (err) {
      console.error('[DB] Failed to write secrets file:', err.message);
    }
  }

  getPublicSettings() {
    return {
      ...this.data.settings,
      hasApiKey: Boolean(this.secrets.apiKey || process.env.AI_API_KEY),
      ownerTokenSet: Boolean(this.secrets.ownerToken || process.env.OWNER_TOKEN),
      aiProvider: this.data.settings.aiProvider,
      aiModel: this.data.settings.aiModel,
      aiBaseUrl: this.data.settings.aiBaseUrl
    };
  }
}

export const db = new Database();

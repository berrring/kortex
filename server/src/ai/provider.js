import { db } from '../storage/db.js';
import { mcpGateway } from '../mcp/gateway.js';

export class AiProvider {
  buildSystemPrompt(projectId = null) {
    let prompt = `Вы — Kortex, персональный AI-ассистент и командный центр пользователя.
Вы помогаете управлять личными проектами, задачами, заметками и подключенными сервисами через протокол MCP (Model Context Protocol).

КЛЮЧЕВЫЕ ПРАВИЛА:
1. Отвечайте на естественном русском языке (если пользователь не обратился на другом).
2. Будьте лаконичны, точны, структурированы. Используйте Markdown для списков и кода.
3. НИКОГДА не выдумывайте письма, события календаря, задачи или файлы, которых нет в системе.
4. Если у вас есть подходящий инструмент для решения вопроса (например, получение текущего времени, поиск по задачам, создание задачи, сохранение в память), вызывайте его.
5. Если нужный сервис не подключен или инструмент завершился с ошибкой, честно и вежливо сообщите об этом.
6. Вы действуете только в интересах владельца и запрашиваете подтверждение для действий с изменением данных.
`;

    // Inject active memories if enabled
    if (db.data.settings.memoryEnabled) {
      const activeMemories = (db.data.memories || []).filter((m) => m.enabled);
      if (activeMemories.length > 0) {
        prompt += `\nДОЛГОВРЕМЕННАЯ ПАМЯТЬ АССИСТЕНТА:\n`;
        activeMemories.forEach((m) => {
          prompt += `- [${m.category}] ${m.title}: ${m.content}\n`;
        });
      }
    }

    // Inject project context if passed
    if (projectId) {
      const project = (db.data.projects || []).find((p) => p.id === projectId);
      if (project) {
        prompt += `\nТЕКУЩИЙ КОНТЕКСТ ПРОЕКТА "${project.name}":\n`;
        prompt += `Описание: ${project.description}\n`;
        if (project.notes) prompt += `Заметки: ${project.notes}\n`;
        const projectTasks = (db.data.tasks || []).filter((t) => t.projectId === projectId);
        if (projectTasks.length > 0) {
          prompt += `Связанные задачи (${projectTasks.length}):\n`;
          projectTasks.forEach((t) => {
            prompt += `  * [${t.completed ? 'x' : ' '}] ${t.title} (${t.priority})\n`;
          });
        }
      }
    }

    return prompt;
  }

  getToolsSchema() {
    const tools = mcpGateway.getAllTools();
    return tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));
  }

  async streamChat({ messages, projectId = null, onChunk, onToolCall, onApprovalRequired, onDone, onError }) {
    const settings = db.data.settings;
    const apiKey = db.secrets.apiKey || process.env.AI_API_KEY;
    const provider = settings.aiProvider || 'openai';
    const baseUrl = (settings.aiBaseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = settings.aiModel || 'gpt-4o-mini';

    // Check if configured (for local Ollama, an API key is not strictly required)
    const isOllama = provider === 'ollama' || baseUrl.includes('localhost:11434');
    if (!apiKey && !isOllama) {
      onError({
        code: 'AI_PROVIDER_NOT_CONFIGURED',
        message: 'AI-провайдер не настроен. Укажите API-ключ в разделе "Настройки" или настройте локальную модель (Ollama).'
      });
      return;
    }

    const systemPrompt = this.buildSystemPrompt(projectId);
    const tools = this.getToolsSchema();

    // Prepare message payload
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content || '',
        ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
        ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {})
      }))
    ];

    const payload = {
      model,
      messages: formattedMessages,
      stream: true
    };

    if (tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = 'auto';
    }

    try {
      const url = `${baseUrl}/chat/completions`;
      const headers = {
        'Content-Type': 'application/json'
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      console.log(`[AI Provider] Sending chat request to ${url} (model: ${model})...`);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errText = '';
        try {
          const errJson = await response.json();
          errText = errJson.error?.message || JSON.stringify(errJson);
        } catch {
          errText = await response.text();
        }
        throw new Error(`Ошибка AI-провайдера (${response.status}): ${errText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedToolCalls = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep trailing incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const choice = data.choices?.[0];
              if (!choice) continue;

              const delta = choice.delta;
              if (delta?.content) {
                onChunk(delta.content);
              }

              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index ?? 0;
                  if (!accumulatedToolCalls[idx]) {
                    accumulatedToolCalls[idx] = {
                      id: tc.id || `call_${Date.now()}_${idx}`,
                      type: 'function',
                      function: {
                        name: tc.function?.name || '',
                        arguments: tc.function?.arguments || ''
                      }
                    };
                  } else {
                    if (tc.function?.name) {
                      accumulatedToolCalls[idx].function.name += tc.function.name;
                    }
                    if (tc.function?.arguments) {
                      accumulatedToolCalls[idx].function.arguments += tc.function.arguments;
                    }
                  }
                }
              }
            } catch (parseErr) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      // Check if any tool calls were accumulated
      if (accumulatedToolCalls.length > 0) {
        for (const tc of accumulatedToolCalls) {
          let parsedArgs = {};
          try {
            parsedArgs = JSON.parse(tc.function.arguments || '{}');
          } catch {
            parsedArgs = { raw: tc.function.arguments };
          }

          const toolName = tc.function.name;
          const allTools = mcpGateway.getAllTools();
          const toolMeta = allTools.find((t) => t.name === toolName);
          const isSensitive = toolMeta ? toolMeta.isSensitive : true;

          if (isSensitive) {
            // Require Human-In-The-Loop approval
            onApprovalRequired({
              toolCallId: tc.id,
              toolName,
              toolDescription: toolMeta?.description || '',
              arguments: parsedArgs
            });
            return; // Wait for user approval
          } else {
            // Auto-execute read-only tool
            onToolCall({
              toolCallId: tc.id,
              toolName,
              arguments: parsedArgs,
              status: 'running'
            });

            try {
              const result = await mcpGateway.callTool(toolName, parsedArgs);
              const toolResultText = typeof result === 'string' ? result : JSON.stringify(result);

              onToolCall({
                toolCallId: tc.id,
                toolName,
                arguments: parsedArgs,
                status: 'completed',
                result: toolResultText
              });

              // Continue the conversation loop with the tool response
              const nextMessages = [
                ...messages,
                {
                  role: 'assistant',
                  content: null,
                  tool_calls: [tc]
                },
                {
                  role: 'tool',
                  tool_call_id: tc.id,
                  content: toolResultText
                }
              ];

              // Recursively stream the follow-up completion
              return await this.streamChat({
                messages: nextMessages,
                projectId,
                onChunk,
                onToolCall,
                onApprovalRequired,
                onDone,
                onError
              });
            } catch (toolErr) {
              onToolCall({
                toolCallId: tc.id,
                toolName,
                arguments: parsedArgs,
                status: 'error',
                error: toolErr.message
              });
              onChunk(`\n\n*(Ошибка при обращении к инструменту ${toolName}: ${toolErr.message})*`);
            }
          }
        }
      }

      onDone();
    } catch (err) {
      console.error('[AI Provider] Error in streamChat:', err.message);
      onError({ code: 'API_ERROR', message: err.message });
    }
  }
}

export const aiProvider = new AiProvider();

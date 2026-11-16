import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppDataProvider } from './context/AppDataContext';

// Layout
import { WorkspaceLayout } from './layouts/WorkspaceLayout';

// Workspace Pages
import { AssistantPage } from './pages/workspace/AssistantPage';
import { ChatsPage } from './pages/workspace/ChatsPage';
import { ProjectsPage } from './pages/workspace/ProjectsPage';
import { ProjectDetailPage } from './pages/workspace/ProjectDetailPage';
import { TasksPage } from './pages/workspace/TasksPage';
import { ConnectionsPage } from './pages/workspace/ConnectionsPage';
import { MemoryPage } from './pages/workspace/MemoryPage';
import { ActivityPage } from './pages/workspace/ActivityPage';
import { SettingsPage } from './pages/workspace/SettingsPage';
import { WorkflowsPage } from './pages/workspace/WorkflowsPage';
import { WorkflowEditorPage } from './pages/workspace/WorkflowEditorPage';
import { TemplatesPage } from './pages/workspace/TemplatesPage';

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            {/* Personal AI Workspace Layout */}
            <Route path="/" element={<WorkspaceLayout />}>
              {/* Primary AI Assistant Screen */}
              <Route index element={<AssistantPage />} />
              <Route path="assistant" element={<Navigate to="/" replace />} />

              {/* Core Personal Productivity & Context */}
              <Route path="chats" element={<ChatsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="tasks" element={<TasksPage />} />

              {/* MCP Bridge & App Integrations */}
              <Route path="connections" element={<ConnectionsPage />} />

              {/* Personal Memory & History */}
              <Route path="memory" element={<MemoryPage />} />
              <Route path="activity" element={<ActivityPage />} />

              {/* Settings */}
              <Route path="settings" element={<SettingsPage />} />

              {/* Advanced Workflows Automation */}
              <Route path="workflows" element={<WorkflowsPage />} />
              <Route path="workflows/:id" element={<WorkflowEditorPage />} />
              <Route path="workflows/templates" element={<TemplatesPage />} />

              {/* Legacy dashboard redirects for seamless continuity */}
              <Route path="app" element={<Navigate to="/" replace />} />
              <Route path="app/workflows" element={<Navigate to="/workflows" replace />} />
              <Route path="app/workflows/:id" element={<WorkflowEditorPage />} />
              <Route path="app/templates" element={<Navigate to="/workflows/templates" replace />} />
              <Route path="app/integrations" element={<Navigate to="/connections" replace />} />
              <Route path="app/activity" element={<Navigate to="/activity" replace />} />
              <Route path="app/settings" element={<Navigate to="/settings" replace />} />
            </Route>

            {/* Fallback to primary screen */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </ThemeProvider>
  );
}

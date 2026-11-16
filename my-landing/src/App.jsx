import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppDataProvider } from './context/AppDataContext';

// Layouts
import { MarketingLayout } from './layouts/MarketingLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Marketing Pages
import { HomePage } from './pages/marketing/HomePage';
import { FeaturesPage } from './pages/marketing/FeaturesPage';
import { HowItWorksPage } from './pages/marketing/HowItWorksPage';
import { PricingPage } from './pages/marketing/PricingPage';
import { FaqPage } from './pages/marketing/FaqPage';
import { ContactPage } from './pages/marketing/ContactPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { WorkflowsPage } from './pages/dashboard/WorkflowsPage';
import { WorkflowEditorPage } from './pages/dashboard/WorkflowEditorPage';
import { TemplatesPage } from './pages/dashboard/TemplatesPage';
import { IntegrationsPage } from './pages/dashboard/IntegrationsPage';
import { ActivityPage } from './pages/dashboard/ActivityPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing Website */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Authentication Interfaces */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Application Dashboard */}
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="workflows" element={<WorkflowsPage />} />
              <Route path="workflows/:id" element={<WorkflowEditorPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </ThemeProvider>
  );
}

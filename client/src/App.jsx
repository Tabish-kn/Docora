import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { ToastProvider } from './context/ToastContext';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import DocumentList from './components/documents/DocumentList';
import FolderView from './components/documents/FolderView';
import TextEditor from './TextEditor';
import AnalyticsView from './components/analytics/AnalyticsView';
import SettingsView from './components/settings/SettingsView';
import AIAssistantView from './components/editor/AIAssistantView';
import TemplatesView from './components/templates/TemplatesView';
import ActivityView from './components/activity/ActivityView';
import SearchView from './components/search/SearchView';
import PublicShareView from './components/documents/PublicShareView';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* Standalone Full-Screen Text Editor route (preserves existing route contract) */}
                <Route path="/documents/:id" element={<TextEditor />} />

                {/* Public share access */}
                <Route path="/share/:token" element={<PublicShareView />} />

                {/* Master App Layout Shell */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/documents" element={<DocumentList filterType="all" />} />
                  <Route path="/shared" element={<DocumentList filterType="shared" />} />
                  <Route path="/recent" element={<DocumentList filterType="all" />} />
                  <Route path="/starred" element={<DocumentList filterType="starred" />} />
                  <Route path="/trash" element={<DocumentList filterType="trash" />} />
                  <Route path="/archive" element={<DocumentList filterType="trash" />} />
                  <Route path="/folders" element={<FolderView />} />
                  <Route path="/projects" element={<FolderView />} />
                  <Route path="/templates" element={<TemplatesView />} />
                  <Route path="/activity" element={<ActivityView />} />
                  <Route path="/analytics" element={<AnalyticsView />} />
                  <Route path="/ai-assistant" element={<AIAssistantView />} />
                  <Route path="/search" element={<SearchView />} />

                  {/* Settings routes */}
                  <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
                  <Route path="/settings/profile" element={<SettingsView initialTab="profile" />} />
                  <Route path="/settings/security" element={<SettingsView initialTab="security" />} />
                  <Route path="/settings/preferences" element={<SettingsView initialTab="preferences" />} />
                  <Route path="/settings/workspace" element={<SettingsView initialTab="workspace" />} />
                  <Route path="/settings/billing" element={<SettingsView initialTab="billing" />} />
                  <Route path="/team" element={<SettingsView initialTab="workspace" />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </ToastProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useRole } from './RoleContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignWizard from './pages/CampaignWizard';
import Contacts from './pages/Contacts';
import AddContact from './pages/AddContact';
import ContactIntegration from './pages/ContactIntegration';
import Templates from './pages/Templates';
import Reports from './pages/Reports';
import Groups from './pages/Groups';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OtpValidation from './pages/auth/OtpValidation';
import WorkspaceSelection from './pages/auth/WorkspaceSelection';


const AppContent = () => {
  const location = useLocation();
  const { token, selectedWorkspace, logout } = useRole();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Routes that don't need the sidebar/header layout
  const isAuthRoute = location.pathname.startsWith('/auth');

  if (!token && !isAuthRoute) {
    return <Navigate to="/auth/login" replace />;
  }

  // If authenticated but no workspace selected, force workspace selection
  if (token && !selectedWorkspace && !isAuthRoute) {
    return <Navigate to="/auth/workspaces" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-background-dark overflow-hidden text-slate-900 dark:text-white font-display theme-transition">
      {!isAuthRoute && (
        <>
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <Sidebar onLogout={logout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
      )}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {!isAuthRoute && <Header onMenuClick={() => setIsSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/workspaces" element={<WorkspaceSelection onSelect={() => { }} />} />

            {/* Main App Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/new" element={<CampaignWizard />} />
            <Route path="/campaigns/edit/:id" element={<CampaignWizard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/add" element={<AddContact />} />
            <Route path="/contacts/integrations" element={<ContactIntegration />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings/*" element={<Settings />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

import { RoleProvider } from './RoleContext';

const App = () => {
  return (
    <RoleProvider>
      <Router>
        <AppContent />
      </Router>
    </RoleProvider>
  );
};

export default App;

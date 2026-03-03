
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OtpValidation from './pages/auth/OtpValidation';
import WorkspaceSelection from './pages/auth/WorkspaceSelection';

const AppContent = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Routes that don't need the sidebar/header layout
  const isAuthRoute = location.pathname.startsWith('/auth');

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated && !isAuthRoute) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-background-dark overflow-hidden text-slate-900 dark:text-white font-display theme-transition">
      {!isAuthRoute && <Sidebar onLogout={handleLogout} />}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {!isAuthRoute && <Header />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login onAuth={() => setIsAuthenticated(true)} />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/otp" element={<OtpValidation onVerify={() => setIsAuthenticated(true)} />} />
            <Route path="/auth/workspaces" element={<WorkspaceSelection onSelect={() => setIsAuthenticated(true)} />} />

            {/* Main App Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/new" element={<CampaignWizard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/add" element={<AddContact />} />
            <Route path="/contacts/integrations" element={<ContactIntegration />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings/*" element={<Settings />} />
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

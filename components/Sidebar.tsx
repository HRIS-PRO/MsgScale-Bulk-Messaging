
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../RoleContext';
import { Role } from '../types';

interface SidebarProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, onClose }) => {
  const location = useLocation();
  const { role, user } = useRole();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Campaigns', path: '/campaigns', icon: 'campaign' },
    { label: 'Contacts', path: '/contacts', icon: 'person' },
    { label: 'Groups', path: '/groups', icon: 'groups' },
    { label: 'Templates', path: '/templates', icon: 'description' },
    { label: 'Reports', path: '/reports', icon: 'bar_chart' },
  ];

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      <aside className={`fixed md:relative flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shrink-0 z-50 md:z-20 h-screen transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '28px' }}>hub</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-tight dark:text-white">MsgScale</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise Workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive(item.path)
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-hover hover:text-primary dark:hover:text-white'
                }`}
            >
              <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill' : ''}`}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {role !== 'User' && (
            <Link
              to="/settings"
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-4 ${isActive('/settings')
                ? 'bg-primary text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-hover hover:text-primary dark:hover:text-white'
                }`}
            >
              <span className={`material-symbols-outlined ${isActive('/settings') ? 'fill' : ''}`}>settings</span>
              <span className="text-sm font-medium">Settings</span>
            </Link>
          )}

          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-[10px] shadow-inner uppercase italic">
                  {user?.employee?.firstName?.[0] || user?.email?.[0] || 'U'}{user?.employee?.surname?.[0] || user?.email?.[1] || ''}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 border-white dark:border-background-dark"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-black dark:text-white truncate italic tracking-tight">
                  {user?.employee ? `${user.employee.firstName} ${user.employee.surname}` : user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-0.5">{role}</p>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background-dark/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsLogoutModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] shadow-2xl overflow-hidden animate-[zoomIn_0.2s_ease-out] p-8 text-center space-y-6">
            <div className="size-20 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center border border-red-500/20 shadow-xl">
              <span className="material-symbols-outlined text-4xl">logout</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase tracking-widest text-sm">Sign Out?</h3>
              <p className="text-slate-500 font-medium italic">Are you sure you want to end your session? You'll need to log back in to access your workspaces.</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-background-dark transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-red-600 hover:translate-y-[-2px] transition-all"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

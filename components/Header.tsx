
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../RoleContext';

const Header = () => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const { selectedWorkspace, workspaces, selectWorkspace, role } = useRole();

  const navigate = useNavigate();

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleWorkspaceChange = (ws: any) => {
    selectWorkspace(ws);
    setIsWorkspaceOpen(false);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark z-30 shrink-0 theme-transition">
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2 rounded-lg border-0 ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow sm:text-sm"
            placeholder="Search campaigns, contacts, or templates..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-6">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-all"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-symbols-outlined">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-background-dark"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        <div className="relative">
          <button
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {selectedWorkspace?.title || 'Select Workspace'}
            </span>
            <span className={`material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {isWorkspaceOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-[fadeIn_0.2s_ease-out]">
              <div className="py-1">
                <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Switch Workspace</div>

                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleWorkspaceChange(ws)}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors text-left ${selectedWorkspace?.id === ws.id
                      ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold italic'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <span>{ws.title}</span>
                    {selectedWorkspace?.id === ws.id && (
                      <span className="material-symbols-outlined text-green-500 text-sm font-black">check</span>
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                {['Admin', 'Manager', 'Editor'].includes(role || '') && (
                  <button
                    onClick={() => navigate('/auth/workspaces')}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors w-full text-left font-bold"
                  >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Create Workspace
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

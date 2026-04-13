
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../RoleContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const { selectedWorkspace, workspaces, selectWorkspace, role, token } = useRole();
  const [anniversaries, setAnniversaries] = useState<{ inThreeDays: any[], upcoming: any[] }>({ inThreeDays: [], upcoming: [] });
  const [isFetchingAnniversaries, setIsFetchingAnniversaries] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedWorkspace?.id && token) {
      fetchAnniversaries();
    }
  }, [selectedWorkspace?.id, token]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAnniversaries = async () => {
    setIsFetchingAnniversaries(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace!.id}/anniversaries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAnniversaries(await response.json());
      }
    } catch (err) {
      console.error("Failed to fetch anniversaries", err);
    } finally {
      setIsFetchingAnniversaries(false);
    }
  };

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

  const totalNotifications = anniversaries.inThreeDays.length + (anniversaries.inThreeDays.length > 0 ? 1 : 0);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark z-30 shrink-0 theme-transition">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-all"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="flex-1 max-w-lg hidden sm:block">
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

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 size-4 bg-red-500 text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white dark:border-background-dark">
                {totalNotifications}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-[fadeIn_0.2s_ease-out]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                <button 
                  onClick={fetchAnniversaries}
                  className={`text-slate-400 hover:text-primary transition-colors ${isFetchingAnniversaries ? 'animate-spin' : ''}`}
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {anniversaries.inThreeDays.length > 0 && (
                  <div className="p-3 bg-primary/5 dark:bg-primary/10 border-b border-primary/10">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary font-black">celebration</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Upcoming Events Summary</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                          <b>{anniversaries.inThreeDays.length}</b> contacts have {anniversaries.inThreeDays.length === 1 ? 'a birthday or anniversary' : 'birthdays or anniversaries'} in 3 days!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {anniversaries.inThreeDays.length === 0 && anniversaries.upcoming.length === 0 && (
                  <div className="p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-2">notifications_off</span>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">No new alerts</p>
                  </div>
                )}

                {anniversaries.inThreeDays.map((ann, i) => (
                  <div 
                    key={`urgent-${i}`} 
                    onClick={() => navigate('/campaigns/new')}
                    className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">{ann.type === 'Birthday' ? 'cake' : 'domain'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate italic">{ann.name}</p>
                          <span className="text-[10px] font-black text-amber-500 uppercase shrink-0">3 Days Left</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {ann.type} on <span className="font-bold text-slate-700 dark:text-slate-300">{ann.date}</span>. Prepare a marketing message!
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {anniversaries.upcoming.filter(a => a.daysUntil !== 3).map((ann, i) => (
                  <div 
                    key={`soon-${i}`} 
                    onClick={() => navigate('/campaigns/new')}
                    className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">{ann.type === 'Birthday' ? 'cake' : 'domain'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{ann.name}</p>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">{ann.daysUntil} days</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {ann.type} on {ann.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalNotifications > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center">
                  <button 
                    onClick={() => navigate('/campaigns')}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    View All Schedule
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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

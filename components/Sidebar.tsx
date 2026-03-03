
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../RoleContext';
import { Role } from '../types';

interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const { role, setRole } = useRole();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roles: Role[] = ['Admin', 'Manager', 'Editor', 'User'];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Campaigns', path: '/campaigns', icon: 'campaign' },
    { label: 'Contacts', path: '/contacts', icon: 'group' },
    { label: 'Templates', path: '/templates', icon: 'description' },
    { label: 'Reports', path: '/reports', icon: 'bar_chart' },
  ];

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shrink-0 z-20 h-screen">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '28px' }}>hub</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold leading-tight dark:text-white">MsgPlatform</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise Workspace</p>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive(item.path)
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
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive('/settings')
                ? 'bg-primary text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-hover hover:text-primary dark:hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined ${isActive('/settings') ? 'fill' : ''}`}>settings</span>
            <span className="text-sm font-medium">Settings</span>
          </Link>
          
          <div className="relative mb-4">
            <button 
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-surface-hover transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">shield_person</span>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Preview Role</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-white">{role}</span>
                </div>
              </div>
              <span className={`material-symbols-outlined text-slate-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <div className="py-1">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold transition-colors ${
                        role === r 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-background-dark hover:text-primary'
                      }`}
                    >
                      {r}
                      {role === r && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between px-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="size-8 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADZtYg6hsKLIiPRp6DLRhWrAH9_9uX0swGM6gTfANG-vgWaWFucrLDkJvGG848SfxjeHgOsDKjg1FwFvM2OdU3EtF1bGrH3q3G6ToV0aF5pQzRqaSoHkMkK3WI4V6-jT1ix7TbFFAzbjIAnaAvAWkKtX9AEPEc71TsGGs7t-u40uVAi-6qHRxd2pU7bnnjc9_2dxbMFTlKjIwhBeWa6wihPbcTRnUI7-I3NW_FqvFYOfUrhYn_eQt8yxdaQ_wmzrk87I-P3efv58Ga')" }}></div>
                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 border-white dark:border-background-dark"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium dark:text-white truncate">Alex Morgan</p>
                <p className="text-xs text-slate-500">{role}</p>
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

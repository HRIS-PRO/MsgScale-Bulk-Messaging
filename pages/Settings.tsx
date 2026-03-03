
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useRole } from '../RoleContext';

/**
 * SETTINGS COMPONENT
 * 
 * BACKEND INTEGRATION NOTES:
 * 1. GET /api/workspace - Fetch general workspace info.
 * 2. GET /api/workspace/members - Fetch team members list.
 * 3. POST /api/workspace/invite - Send new user invitations.
 * 4. GET /api/integrations - Fetch current API provider settings.
 * 5. POST /api/integrations - Update integration credentials.
 * 6. GET /api/billing/plan - Fetch current subscription details.
 */

// --- SUB-COMPONENTS ---

const GeneralSettings = () => (
  <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
    <div className="space-y-2">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">General Workspace</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Update your workspace details and company branding.</p>
    </div>

    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-6">
         <div className="space-y-2">
           <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Workspace Name</label>
           <input className="w-full bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all font-bold italic" defaultValue="MsgPlatform Enterprise" />
         </div>
         
         <div className="space-y-2">
           <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Workspace ID</label>
           <div className="flex gap-3">
             <input className="flex-1 bg-slate-100 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed font-mono text-sm" disabled defaultValue="wp_883_2939_x99" />
             <button type="button" className="p-3 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">content_copy</span></button>
           </div>
         </div>

         <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Workspace Logo</label>
            <div className="flex items-center gap-6 p-6 rounded-2xl border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-[#111722]/50">
               <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shrink-0">
                  <span className="material-symbols-outlined text-primary text-4xl">hub</span>
               </div>
               <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button type="button" className="px-5 py-2 bg-white dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-xl text-[10px] font-black tracking-widest text-slate-700 dark:text-white hover:bg-slate-50 transition-all shadow-sm">UPLOAD NEW</button>
                    <button type="button" className="px-5 py-2 text-[10px] font-black tracking-widest text-red-500 hover:text-red-400 transition-colors uppercase">Remove</button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase opacity-60">Recommended size 512x512px. Max file size 2MB.</p>
               </div>
            </div>
         </div>
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-border-dark flex justify-end gap-3">
         <button type="button" className="px-8 py-3 rounded-xl text-slate-500 font-black tracking-widest text-xs uppercase hover:text-slate-900 dark:hover:text-white transition-all">Cancel</button>
         <button type="submit" className="px-10 py-3 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all">SAVE CHANGES</button>
      </div>
    </form>

    <div className="mt-12 bg-red-500/5 border border-red-500/10 rounded-2xl p-8 space-y-4">
       <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">warning</span>
          <h4 className="text-red-500 font-black uppercase text-xs tracking-widest">Danger Zone</h4>
       </div>
       <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Deleting this workspace is permanent and will wipe all associated campaign data, contacts, and custom attributes. Please proceed with caution.</p>
       <button className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Delete Workspace</button>
    </div>
  </div>
);

const TeamManagement = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);

  const users = [
    { name: 'Sarah Connor', email: 'sarah@acme.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDRjyMCUX_ryCHOxo6n5U7-1CVrasu5Qe5TvkzedwBc5mBe-zPqfH8oHGzfMIzHczfGsrXRpSnTvgUEZRy7SOCA-_aRnqF-vYIMEw5NrBEHBd_AvvxQVmql5x5f_DwiXlfIkNvh4MIOKZnvvk2RoWXsoxitOTfkiyBxL1t1WJEDGtZwR8vPmnE_VfJnqW2zNfLdlzCUaE-utToJ2rSEO7TjA629I_rNsG7eLwKgizh9a8DTLkGswF76-M6ktvOtoDylAogqocOALnj' },
    { name: 'Michael Chen', email: 'michael@acme.com', role: 'Editor', status: 'Active', lastActive: 'Yesterday', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxeuNlXsqUPRrXM9hkZCPV8T_-pUIH8iBeFFTZiMXN7-pbRyRMMIOA6gKqrzrCM74wZ7Fo9rv6ICmzPRBpJY91fWqWcjLKt1mEH1YltBBN2sGDxRdat3nMAtJe13jNSORuniHPzyGFZPYwdLnTGy5UR0Z3ujMWA2limK-DiP6QCVzdflMQXe2gD1v2Z2Y4bIjPy8D-J74FHvLbbgQn0gWGE1F2PLjFL0mQ9aCyQUVT5Vc_4vJUutcucVIGtKR0lzGiUa-GpbtUoywB' },
    { name: 'Emily Davis', email: 'emily.d@acme.com', role: 'Viewer', status: 'Pending', lastActive: '-', avatar: 'ED' },
    { name: 'Alex Johnson', email: 'alex.j@acme.com', role: 'Editor', status: 'Active', lastActive: '3 days ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmyzFVedRD55AqKclx9_CJYvPsNd7gxS5wuMoGgSsrh0_DuUJnODJuNKa61KmH2Q9KpXbPKf6tSZ3En_dytANmAm4gPIBIbOllCJg2vewtsgWOZxdCE3QhjutGNjMPR_opJ5rMB7sNMHVnv_WVnjIAR2-bQ87D57jqf8LxVXMTO2tuQS09nHfPXfZTuxD5TcYsp2wrAGt9beuLMWENvhQgxdWrFyO1UVCaChhsmJTPOwOry_mBpdI_8h5vyezA6e1D3hh6YesV1D8g' },
    { name: 'Jessica Lee', email: 'jessica@acme.com', role: 'Admin', status: 'Active', lastActive: '1 week ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh1o-h2MpQgsGKvGjHp9Q45cmUd3b55BonuJNEOf4UxcgaHys0GVASGqsVWGvqJnnTLV6s9EZpQ5ARgv5w1qqgyLG2TIMor4c4WP0qaNXg-BFWtJJqTwC_dZZC5Mhvh-KtRJLdGiMJccOekdn5_RKNcCYMgrwyf6AmFe6IEc38CyUneCZs3McTw01Ggfi0ZLYkxd51sf7gef5FyiaUiTa9pn_2cQXmg7hPyxZn1NEE8s058h9c_5EbtD5CfWW4ffwshCIbf78hhF76' },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Team Members</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage user access, roles, and workspace permissions.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Invite User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: '142', sub: '↑ 12% this month', icon: 'group' },
          { label: 'Pending Invites', value: '8', sub: 'Awaiting acceptance', icon: 'mail' },
          { label: 'Available Seats', value: '58', sub: 'Upgrade plan →', icon: 'chair' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-sm relative overflow-hidden group">
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white italic">{stat.value}</h3>
              <p className={`text-[10px] font-bold ${i === 0 ? 'text-green-500' : i === 2 ? 'text-primary' : 'text-slate-400'} uppercase tracking-tight`}>{stat.sub}</p>
            </div>
            <span className="material-symbols-outlined absolute -right-2 -bottom-4 text-slate-100 dark:text-slate-800/50 text-[100px] group-hover:scale-110 transition-transform duration-500 pointer-events-none">{stat.icon}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-border-dark flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-[#111722]/50">
          <div className="relative w-full sm:max-w-xs group">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark text-sm font-bold shadow-inner outline-none focus:ring-1 focus:ring-primary" placeholder="Search by name or email..." />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button className="flex-1 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-slate-500 text-xs font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"><span className="material-symbols-outlined text-[18px]">filter_list</span></button>
             <button className="flex-1 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-slate-500 text-xs font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"><span className="material-symbols-outlined text-[18px]">download</span></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-background-dark/30 border-b border-slate-100 dark:border-border-dark">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Activity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatar.startsWith('http') ? (
                        <img src={u.avatar} className="size-10 rounded-xl object-cover border border-slate-200 dark:border-border-dark" alt="" />
                      ) : (
                        <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center font-black text-xs">{u.avatar}</div>
                      )}
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white italic">{u.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{u.email}</p>
                      </div>
                      {u.role === 'Admin' && <span className="material-symbols-outlined text-slate-300 text-[16px]" title="Two-factor enabled">lock</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${u.role === 'Admin' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : u.role === 'Editor' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`size-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500'}`}></span>
                       <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{u.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-slate-400 italic">{u.lastActive}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg text-slate-300 hover:text-slate-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all"><span className="material-symbols-outlined">more_horiz</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-[4px]" onClick={() => setShowInviteModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl overflow-hidden animate-[zoomIn_0.2s_ease-out]">
            <div className="p-5 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-background-dark/30">
              <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-widest italic">Quick Invite</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary" placeholder="colleague@company.com" />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Role Selection</label>
                  <div className="space-y-3">
                    {[
                      { role: 'Admin', desc: 'Full access to workspace settings, billing, and user management.' },
                      { role: 'Editor', desc: 'Can create and send campaigns, manage contacts. No billing access.' },
                      { role: 'Viewer', desc: 'Read-only access to reports and campaign analytics.' },
                    ].map((r, i) => (
                      <label key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-border-dark hover:border-primary cursor-pointer transition-all relative group overflow-hidden">
                        <input name="invite_role" type="radio" className="mt-1 text-primary focus:ring-primary bg-white dark:bg-background-dark border-slate-300 dark:border-slate-700" defaultChecked={i===1} />
                        <div>
                           <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{r.role}</span>
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed opacity-80">{r.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
               </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30">
               <button className="w-full bg-primary hover:bg-blue-600 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all">Send Invitation</button>
               <p className="text-[9px] text-center text-slate-400 font-bold uppercase mt-4 italic opacity-60">User will receive an email to join ACME Enterprise Workspace.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Integrations = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<'sms' | 'email' | null>(null);

  const toggle = (section: 'sms' | 'email') => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Integrations</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Configure your third-party services for SMS and Email delivery.</p>
      </div>

      <div className="space-y-4">
        {/* SMS Collapsible Section */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm transition-all">
          <button 
            onClick={() => toggle('sms')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <span className="material-symbols-outlined text-3xl">sms</span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic leading-none">SMS Configuration</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60 tracking-widest mt-1.5">Connect your preferred SMS gateway</p>
              </div>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${expanded === 'sms' ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          <div className={`transition-all duration-500 ease-in-out ${expanded === 'sms' ? 'max-h-[500px] opacity-100 border-t border-slate-100 dark:border-border-dark' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-8 space-y-6 bg-slate-50 dark:bg-background-dark/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Provider</label>
                  <select className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm font-bold italic text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary">
                    <option>Termii</option>
                    <option>Twilio</option>
                    <option>MessageBird</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sender ID</label>
                  <input className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. MyBrand" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Key</label>
                <input type="password" title="API Key" className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" placeholder="Paste your API key here" />
              </div>
              <div className="flex justify-end pt-4">
                 <button className="px-8 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-600">Update SMS Settings</button>
              </div>
            </div>
          </div>
        </div>

        {/* Email Collapsible Section */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm transition-all">
          <button 
            onClick={() => toggle('email')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="size-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-500/10">
                <span className="material-symbols-outlined text-3xl">mail</span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic leading-none">Email Configuration</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60 tracking-widest mt-1.5">Choose between 3rd party providers or SMTP</p>
              </div>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${expanded === 'email' ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          <div className={`transition-all duration-500 ease-in-out ${expanded === 'email' ? 'max-h-[600px] opacity-100 border-t border-slate-100 dark:border-border-dark' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-8 space-y-6 bg-slate-50 dark:bg-background-dark/30">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Integration Method</label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="email_method" className="text-primary focus:ring-primary" defaultChecked />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors italic uppercase tracking-tighter text-[11px]">3rd Party Provider (API)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="email_method" className="text-primary focus:ring-primary" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors italic uppercase tracking-tighter text-[11px]">SMTP Server</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Provider</label>
                  <select className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm font-bold italic text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary">
                    <option>Resend</option>
                    <option>SendGrid</option>
                    <option>Mailgun</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">From Name</label>
                  <input className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" placeholder="Company Support" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Key</label>
                <input type="password" title="Email API Key" className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" defaultValue="re_123456789" />
              </div>
              <div className="flex justify-end pt-4">
                 <button className="px-8 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-600">Update Email Settings</button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Data Integration Link */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm transition-all">
          <button 
            onClick={() => navigate('/contacts/integrations')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-5">
              <div className="size-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 shadow-lg shadow-green-500/5 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">contacts</span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic leading-none">Contact Data Integration</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60 tracking-widest mt-1.5">Sync your customer data from external CRMs</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">open_in_new</span>
          </button>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-border-dark flex justify-end gap-3">
         <button type="button" className="px-8 py-3 rounded-xl text-slate-500 font-black tracking-widest text-xs uppercase hover:text-slate-900 dark:hover:text-white transition-all">Cancel</button>
         <button type="submit" className="px-10 py-3 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all">SAVE ALL CHANGES</button>
      </div>
    </div>
  );
};

const BillingSettings = () => (
  <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
    <div className="space-y-2 border-b border-slate-100 dark:border-border-dark pb-6">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Billing & Plans</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your subscription, payment methods, and billing history.</p>
    </div>

    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 shadow-lg shadow-green-500/5">
          <span className="material-symbols-outlined">payments</span>
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">Available Plans</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight opacity-60">Scale your communication as you grow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Plan Cards */}
        {[
          { 
            name: 'Free Plan', price: '₦0', sub: '/month', 
            desc: 'Perfect for getting started.', 
            features: ['Up to 2 concurrent workspaces', 'Run up to 2 concurrent campaigns', 'Send to campaign recipients', 'Up to 2 custom contact attributes'],
            btn: 'Current Plan', active: true
          },
          { 
            name: 'Premium Plan', price: '₦75,000', sub: '/month', 
            desc: 'Scale your operations.', 
            features: ['25 workspaces', '50 concurrent campaigns', 'Send to ALL contacts selection', 'Unlimited custom attributes & AI insights', 'Export contacts & AI reporting'],
            btn: 'Upgrade Now', active: false
          },
          { 
            name: 'Lifetime Access', price: '₦750,000', sub: '/one-time', 
            desc: 'Pay once, use forever.', 
            features: ['Everything in Premium', 'Unlimited workspaces', 'Unlimited concurrent campaigns', 'Priority support access', 'Future feature updates'],
            btn: 'Get Lifetime Access', active: false, featured: true
          },
        ].map((plan, i) => (
          <div key={i} className={`relative p-8 rounded-3xl border transition-all flex flex-col h-full ${plan.featured ? 'border-primary border-2 bg-primary/5 shadow-2xl scale-105 z-10' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] shadow-sm hover:shadow-xl'}`}>
            {plan.featured && (
              <div className="absolute -top-3 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Best Value</div>
            )}
            <div className="mb-6">
              <h4 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight mb-1">{plan.name}</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{plan.desc}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-slate-900 dark:text-white italic">{plan.price}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.sub}</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((f, fi) => (
                <li key={fi} className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-[18px] font-black ${plan.featured ? 'text-purple-500' : i === 1 ? 'text-primary' : 'text-green-500'}`}>check_circle</span>
                  <span className={`text-[11px] leading-tight font-bold ${plan.featured ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{f}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${plan.active ? 'bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-400 cursor-not-allowed' : plan.featured ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/30 hover:scale-[1.02]' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-blue-600 hover:scale-[1.02]'}`}>
              {plan.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const NotificationsSettings = () => (
  <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
    <div className="space-y-2">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Notifications</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Control when and how you get notified about your campaigns.</p>
    </div>
    
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 space-y-6 shadow-sm">
       {[
         { title: 'Email Notifications', desc: 'Summary of campaign results via email.' },
         { title: 'Browser Alerts', desc: 'Push notifications for delivery failures.' },
         { title: 'Billing Alerts', desc: 'Receive invoices and low-balance warnings.' },
       ].map((n, i) => (
         <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 dark:border-white/5">
            <div>
               <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{n.title}</h4>
               <p className="text-xs text-slate-500 font-medium">{n.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer group">
              <input type="checkbox" className="sr-only peer" defaultChecked={i!==1} />
              <div className="w-11 h-6 bg-slate-200 dark:bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            </label>
         </div>
       ))}
    </div>
  </div>
);

// --- MAIN SETTINGS PAGE ---

const Settings = () => {
  const { role } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = role === 'Admin';
  const isUser = role === 'User';

  const navGroups = [
    {
      title: 'Workspace Settings',
      items: [
        { label: 'General', path: '/settings', icon: 'tune', show: isAdmin },
        { label: 'Team Management', path: '/settings/team', icon: 'manage_accounts', show: isAdmin },
      ].filter(item => item.show)
    },
    {
      title: 'Global Settings',
      items: [
        { label: 'Integrations', path: '/settings/integrations', icon: 'integration_instructions', show: isAdmin },
        { label: 'Billing', path: '/settings/billing', icon: 'credit_card', show: isAdmin },
        { label: 'Notifications', path: '/settings/notifications', icon: 'notifications_active', show: true },
      ].filter(item => item.show)
    }
  ].filter(group => group.items.length > 0);

  const isActive = (path: string) => {
    if (path === '/settings') return location.pathname === '/settings';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-32">
      {/* Sidebar Nav */}
      <nav className="w-full lg:w-64 space-y-8 shrink-0">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 opacity-70">{group.title}</h3>
            <div className="space-y-1.5">
               {group.items.map((item, i) => (
                 <button 
                  key={i} 
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive(item.path) ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111722]'}`}
                 >
                    <span className={`material-symbols-outlined text-[20px] ${isActive(item.path) ? 'fill' : ''}`}>{item.icon}</span>
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                 </button>
               ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Content Area */}
      <div className="flex-1 bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark p-8 md:p-12 shadow-2xl relative overflow-hidden theme-transition">
        {/* Subtle background flair */}
        <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48"></div>

        <div className="relative z-10">
          <Routes>
            {isAdmin ? (
              <>
                <Route index element={<GeneralSettings />} />
                <Route path="team" element={<TeamManagement />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="billing" element={<BillingSettings />} />
                <Route path="notifications" element={<NotificationsSettings />} />
              </>
            ) : (
              <>
                <Route index element={<Navigate to="/settings/notifications" replace />} />
                <Route path="notifications" element={<NotificationsSettings />} />
                <Route path="*" element={<Navigate to="/settings/notifications" replace />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Settings;

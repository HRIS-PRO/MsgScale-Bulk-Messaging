
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ContactIntegration = () => {
  const navigate = useNavigate();
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'node' | 'python'>('curl');

  return (
    <div className="min-h-full bg-slate-50 dark:bg-background-dark theme-transition font-display animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/contacts')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          </button>
          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400">Settings</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Integrations</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 dark:text-white">Contact Data</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto p-8 flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-8 min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-100 dark:border-border-dark">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tight">Contact Data Integration</h1>
              <p className="text-slate-500 font-medium leading-relaxed">Manage programmatic access to your contact lists. Configure API keys for secure transfers and webhooks for real-time updates.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              Read API docs
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Incoming Data Sources */}
            <section className="bg-white dark:bg-surface-dark rounded-[2rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 dark:border-border-dark space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Incoming Data Sources</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Configure how contacts are ingested from external platforms</p>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Fetch Contacts via API</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 opacity-80">Pull contacts periodically from external CRMs</p>
                  </div>
                  <button className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">+ Add New API Integration</button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-border-dark">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-background-dark/50 border-b border-slate-100 dark:border-border-dark">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Sync</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                        <td className="px-6 py-5 font-black text-slate-900 dark:text-white italic text-sm">Salesforce CRM</td>
                        <td className="px-6 py-5">
                          <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-500 text-[9px] font-black uppercase border border-green-500/20">Active</span>
                        </td>
                        <td className="px-6 py-5 text-[11px] font-bold text-slate-500 italic">10 mins ago</td>
                        <td className="px-6 py-5 text-right flex justify-end gap-2">
                           <button className="p-2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                           <button className="p-2 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 dark:bg-background-dark/50 border-2 border-dashed border-slate-200 dark:border-border-dark rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">settings_input_component</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Integration Configuration</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integration Name</label>
                      <input className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-sm font-bold italic focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue="HubSpot Production" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">External API Endpoint</label>
                      <input className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue="https://api.hubapi.com/crm/v3/..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authentication Method</label>
                      <select className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all">
                        <option>Bearer Token</option>
                        <option>OAuth 2.0</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sync Frequency</label>
                      <select className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all">
                        <option>Every 15 minutes</option>
                        <option>Hourly</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Field Mapping (JSON)</label>
                      <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-xs font-mono text-green-500 focus:ring-1 focus:ring-primary outline-none transition-all resize-none" defaultValue='{"email": "properties.email", "name": "properties.firstname"}' />
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                     <button className="px-6 py-2.5 rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Test Connection</button>
                     <button className="px-8 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all">Save Integration</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Receive via Webhooks */}
            <section className="bg-white dark:bg-surface-dark rounded-[2rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Receive Contacts via Webhooks</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Accept real-time data pushed from external sources</p>
                </div>
                <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all">+ Add Webhook Source</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Webhook Endpoint</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-border-dark">
                       <input readOnly className="flex-1 px-4 py-3 bg-slate-50 dark:bg-background-dark text-xs text-slate-400 outline-none" value="https://api.msgscale.com/v1/hooks/in/..." />
                       <button className="px-4 bg-white dark:bg-surface-dark border-l border-slate-200 dark:border-border-dark text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined text-[18px]">content_copy</span></button>
                    </div>
                    <button className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1 hover:underline"><span className="material-symbols-outlined text-sm">refresh</span> Generate New</button>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Webhook Signing Secret</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-border-dark shadow-inner">
                       <input type="password" readOnly className="flex-1 px-4 py-3 bg-slate-50 dark:bg-background-dark text-xs text-slate-400 outline-none" value="whsec_xxxxx" />
                       <button className="px-4 bg-white dark:bg-surface-dark border-l border-slate-200 dark:border-border-dark text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic opacity-60">Validate X-Signature header using this secret.</p>
                 </div>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-border-dark overflow-hidden mb-8">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-background-dark/30 border-b border-slate-100 dark:border-border-dark">
                       <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Endpoint Slug</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Received</th>
                          <th className="px-6 py-4 text-right"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                       <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                          <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white italic">Typeform Survey</td>
                          <td className="px-6 py-5 font-mono text-[10px] text-slate-400">.../hooks/in/tf-leads</td>
                          <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase italic">2 mins ago</td>
                          <td className="px-6 py-5 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button className="p-1.5 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button className="p-1.5 text-slate-400 hover:text-blue-500"><span className="material-symbols-outlined text-[18px]">play_circle</span></button>
                             </div>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>

              <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-2xl flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                 <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">info</span>
                 <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Payload Mapping Required</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">Incoming webhooks must be mapped to contact fields to be processed correctly. Configure transformation rules in the edit menu.</p>
                 </div>
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar / Code Examples */}
        <aside className="w-full xl:w-[420px] space-y-8 shrink-0">
          <div className="bg-slate-900 dark:bg-[#090c10] rounded-[2rem] border border-slate-800 p-6 shadow-2xl text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><span className="material-symbols-outlined text-8xl">code</span></div>
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Base API URL</h3>
             <div className="flex items-center gap-3 bg-black/40 rounded-xl p-3 border border-white/5">
                <code className="font-mono text-xs flex-1 text-green-400">https://api.msgscale.com/v1</code>
                <button className="text-slate-500 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">content_copy</span></button>
             </div>
          </div>

          <div className="bg-[#1e1e1e] dark:bg-[#0c0c0d] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111] shrink-0">
                <div className="flex gap-4">
                   {(['curl', 'node', 'python'] as const).map(tab => (
                     <button 
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeCodeTab === tab ? 'text-primary border-b-2 border-primary pb-2 -mb-4' : 'text-slate-500 hover:text-white pb-2 -mb-4'}`}
                     >
                       {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : 'Python'}
                     </button>
                   ))}
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">POST /contacts</span>
             </div>
             
             <div className="flex-1 p-8 overflow-x-auto">
                {activeCodeTab === 'curl' && (
                  <pre className="text-xs font-mono leading-relaxed">
                    <span className="text-purple-400">curl</span> -X POST https://api.msgscale.com/v1/contacts \<br/>
                    &nbsp;&nbsp;-H <span className="text-green-400">"Authorization: Bearer sk_live_..."</span> \<br/>
                    &nbsp;&nbsp;-H <span className="text-green-400">"Content-Type: application/json"</span> \<br/>
                    &nbsp;&nbsp;-d <span className="text-green-400">'{'{'}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"email": "alex@example.com",<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"first_name": "Alex",<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"tags": ["new_lead", "web_signup"],<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"custom_fields": {'{'}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"plan": "enterprise"<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br/>
                    &nbsp;&nbsp;{'}'}'</span>
                  </pre>
                )}
                {activeCodeTab === 'node' && (
                   <pre className="text-xs font-mono leading-relaxed text-slate-300">
                     <span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> fetch(<span className="text-green-400">'https://api.msgscale.com/v1/contacts'</span>, {'{'}<br/>
                     &nbsp;&nbsp;method: <span className="text-green-400">'POST'</span>,<br/>
                     &nbsp;&nbsp;headers: {'{'}<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">'Authorization'</span>: <span className="text-green-400">'Bearer sk_live_...'</span>,<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">'Content-Type'</span>: <span className="text-green-400">'application/json'</span><br/>
                     &nbsp;&nbsp;{'}'},<br/>
                     &nbsp;&nbsp;body: JSON.stringify({'{'}<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;email: <span className="text-green-400">'alex@example.com'</span>,<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;first_name: <span className="text-green-400">'Alex'</span><br/>
                     &nbsp;&nbsp;{'}'})<br/>
                     {'}'});
                   </pre>
                )}
             </div>

             <div className="p-6 bg-[#111] border-t border-white/5 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Response Example (201 Created)</h4>
                <pre className="text-[10px] font-mono text-slate-400 leading-relaxed">
                  {'{'}<br/>
                  &nbsp;&nbsp;"id": "ct_192837465",<br/>
                  &nbsp;&nbsp;"status": "active",<br/>
                  &nbsp;&nbsp;"created_at": "2023-11-15T10:30:00Z"<br/>
                  {'}'}
                </pre>
             </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-8 space-y-4 shadow-xl shadow-primary/5">
             <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20"><span className="material-symbols-outlined">help</span></div>
                <div className="space-y-2">
                   <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Need help integrating?</h4>
                   <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Check out our step-by-step guides or contact our developer support team for assistance with complex setups.</p>
                   <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest mt-2">View Guides →</button>
                </div>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ContactIntegration;

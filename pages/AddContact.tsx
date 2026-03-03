
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CustomAttribute {
  id: string;
  name: string;
  type: string;
}

const AddContact = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [attributeName, setAttributeName] = useState('Birthday');
  const [attributeType, setAttributeType] = useState('Date');
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([]);

  const handleSaveAttribute = () => {
    if (attributeName.trim()) {
      const newAttr: CustomAttribute = {
        id: Math.random().toString(36).substr(2, 9),
        name: attributeName,
        type: attributeType
      };
      setCustomAttributes([...customAttributes, newAttr]);
      setIsAddingAttribute(false);
      setAttributeName('Birthday'); // Reset for next use
    }
  };

  const removeAttribute = (id: string) => {
    setCustomAttributes(customAttributes.filter(a => a.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark overflow-hidden theme-transition font-display">
      {/* Page Header Area */}
      <div className="px-8 py-6 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark flex flex-col gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer" onClick={() => navigate('/')}>Workspace</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer" onClick={() => navigate('/contacts')}>Contacts</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white">Add or Import</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Add or Import Contacts</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manually add a single contact or upload a CSV file for bulk import.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-opacity-80 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Download Template
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-border-dark flex gap-8">
            <button 
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 pb-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Manual Entry
            </button>
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 pb-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'bulk' ? 'border-primary text-primary' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              Bulk Import
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Left Content: Form */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'manual' ? (
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-sm dark:shadow-2xl transition-all">
                  <h3 className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-widest mb-8">Contact Details</h3>
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">First Name</label>
                        <input 
                          className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all" 
                          placeholder="e.g. Jane"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                        <input 
                          className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all" 
                          placeholder="e.g. Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                      <input 
                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all" 
                        placeholder="jane.doe@company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                      <div className="flex gap-3">
                        <div className="relative w-32 shrink-0">
                          <select className="w-full appearance-none bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl pl-4 pr-10 py-3 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
                            <option>🇺🇸 +1</option>
                            <option>🇬🇧 +44</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                        </div>
                        <input 
                          className="flex-1 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all" 
                          placeholder="(555) 000-0000"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-text-secondary uppercase tracking-widest opacity-60">Please ensure format follows E.164 standards for SMS delivery.</p>
                    </div>

                    {/* Render existing custom attributes */}
                    {customAttributes.map(attr => (
                      <div key={attr.id} className="p-4 rounded-xl border border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 flex justify-between items-center group animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{attr.type} Attribute</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{attr.name}</span>
                        </div>
                        <button 
                          onClick={() => removeAttribute(attr.id)}
                          className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    ))}

                    {/* Add Custom Attribute Card */}
                    {isAddingAttribute ? (
                      <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark p-6 relative overflow-hidden animate-[zoomIn_0.2s_ease-out]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                        <div className="flex justify-between items-start mb-6 pl-2">
                          <div>
                            <h4 className="text-slate-900 dark:text-white text-sm font-black uppercase tracking-widest">Add Custom Attribute</h4>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Define a new property for this contact.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setIsAddingAttribute(false)}
                            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attribute Name</label>
                            <input 
                              value={attributeName}
                              onChange={(e) => setAttributeName(e.target.value)}
                              className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all" 
                              placeholder="e.g. Birthday"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attribute Type</label>
                            <div className="relative">
                              <select 
                                value={attributeType}
                                onChange={(e) => setAttributeType(e.target.value)}
                                className="w-full appearance-none bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all"
                              >
                                <option>Text</option>
                                <option>Number</option>
                                <option>Date</option>
                                <option>Boolean</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-border-dark pl-2">
                          <button 
                            type="button" 
                            onClick={() => setIsAddingAttribute(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            onClick={handleSaveAttribute}
                            className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-6 py-2 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 uppercase tracking-widest"
                          >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                            Save Attribute
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsAddingAttribute(true)}
                          className="text-primary text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">add</span>
                          Add Custom Attribute
                        </button>
                      </div>
                    )}

                    <div className="pt-8 border-t border-slate-100 dark:border-border-dark flex justify-end gap-4 mt-6">
                      <button type="button" className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-slate-500 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Clear Form</button>
                      <button 
                        onClick={() => navigate('/contacts')}
                        className="px-8 py-2.5 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                      >
                        Save Contact
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark/20 p-16 flex flex-col items-center justify-center text-center animate-[fadeIn_0.3s_ease-out] transition-all">
                  <div className="p-5 rounded-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark mb-6 shadow-sm">
                    <span className="material-symbols-outlined text-[48px] text-slate-400">cloud_upload</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 italic">Click to upload or drag and drop</h4>
                  <p className="text-slate-500 text-sm max-w-sm font-medium">CSV, XLS, or XLSX (max 100,000 rows). Ensure your file follows our template format.</p>
                  <button className="mt-8 px-8 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#232830] transition-all">Select File</button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Import Status Panel */}
              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm dark:shadow-lg h-fit transition-all">
                <div className="p-4 border-b border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-dark/50 flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Import Status</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-500 tracking-widest">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-border-dark">
                  <div className="p-5 space-y-3 bg-slate-50/30 dark:bg-background-dark/30">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white italic">job_contacts_q3.csv</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">ID #8291</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase border border-primary/20 tracking-wider">Processing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[45%] rounded-full shadow-[0_0_8px_rgba(19,91,236,0.3)]"></div>
                      </div>
                      <span className="text-[10px] font-black text-primary">45%</span>
                    </div>
                    <p className="text-[9px] text-right text-slate-400 font-bold uppercase tracking-tighter">~2 mins remaining</p>
                  </div>
                  
                  <div className="p-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white italic line-through opacity-50">oct_leads_v2.csv</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Yesterday, 4:20 PM</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[10px] font-black uppercase border border-green-500/20 tracking-wider">Completed</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-medium italic">
                      <span className="text-slate-900 dark:text-white font-bold">1,240</span> contacts added.
                    </p>
                  </div>
                </div>
                <button className="w-full py-3 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                  View All History
                </button>
              </div>

              {/* Bulk Import Tip */}
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-primary">lightbulb</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">lightbulb</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Bulk Import Tip</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-text-secondary leading-relaxed font-medium">
                  Ensure your CSV has a header row. Columns like <span className="text-slate-900 dark:text-white font-bold">"Phone"</span> and <span className="text-slate-900 dark:text-white font-bold">"Email"</span> map automatically if named correctly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddContact;

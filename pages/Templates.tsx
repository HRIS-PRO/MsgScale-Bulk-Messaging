
import React, { useState } from 'react';
import { useRole } from '../RoleContext';

/**
 * TEMPLATES COMPONENT
 * 
 * BACKEND INTEGRATION NOTES:
 * 1. GET /api/templates - Fetch user-saved and system templates.
 * 2. POST /api/templates - Save a new template.
 * 3. PUT /api/templates/{id} - Update an existing template.
 * 4. DELETE /api/templates/{id} - Remove a template.
 */

type ViewState = 'grid' | 'editor' | 'preview';
type EditorMode = 'visual' | 'html';

interface Template {
  id: string;
  title: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  color: string;
  desc: string;
  content: string;
}

const productLaunchContent = `
<h1 style="color: #135bec; font-size: 24px; font-weight: 900; font-style: italic; margin-bottom: 16px;">The Future is Here.</h1>
<p style="margin-bottom: 16px; color: #475569;">We're thrilled to announce the launch of <strong>MsgScale Pro</strong>, our most powerful enterprise messaging suite yet.</p>
<div style="margin: 24px 0; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" style="width: 100%; display: block;" />
</div>
<p style="margin-bottom: 20px; color: #475569;">Unlock high-throughput API access, real-time DLRs, and advanced AI segmentation that works at the speed of your business.</p>
<a href="#" style="display: inline-block; background: #135bec; color: white; padding: 14px 28px; border-radius: 10px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(19, 91, 236, 0.3);">Get Early Access</a>
<p style="margin-top: 32px; font-size: 12px; color: #94a3b8; font-style: italic;">Best regards,<br/>The Product Team</p>
`;

const systemTemplates: Template[] = [
  { id: '1', title: 'Product Launch', type: 'Email', color: 'text-purple-500', desc: 'Announce new features with a hero image.', content: productLaunchContent },
  { id: '2', title: 'Flash Sale Alert', type: 'SMS', color: 'text-orange-500', desc: 'Urgent messaging with promo codes.', content: '<p>FLASH SALE: Get 20% off all items for the next 2 hours only! Use code: QUICK20 at checkout.</p>' },
  { id: '3', title: 'Monthly Newsletter', type: 'Email', color: 'text-purple-500', desc: 'Standard layout for recurring updates.', content: '<h1>Monthly Update</h1><p>Here is what we have been up to this month...</p>' },
  { id: '4', title: 'Feedback Request', type: 'WhatsApp', color: 'text-green-500', desc: 'Quick survey for customer satisfaction.', content: '<p>Hi there! We would love to hear your feedback on your recent purchase. Reply with 1-5 to rate us.</p>' },
];

const Templates = () => {
  const { role } = useRole();
  const [viewState, setViewState] = useState<ViewState>('grid');
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  const [currentContent, setCurrentContent] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const canEdit = role === 'Admin' || role === 'Manager' || role === 'Editor';

  const handleStartFromScratch = () => {
    setCurrentTitle('Untitled Template');
    setCurrentContent('<p>Start typing your masterpiece...</p>');
    setViewState('editor');
  };

  const handleEdit = (template: Template) => {
    setCurrentTitle(template.title);
    setCurrentContent(template.content);
    setViewState('editor');
  };

  const handlePreview = (template: Template) => {
    setCurrentTitle(template.title);
    setCurrentContent(template.content);
    setViewState('preview');
  };

  const handleSave = () => {
    /** 
     * BACKEND INTEGRATION:
     * If id exists: PUT /api/templates/{id}
     * Else: POST /api/templates
     */
    setViewState('grid');
  };

  if (viewState === 'editor') {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark animate-[fadeIn_0.3s_ease-out]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewState('grid')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-background-dark transition-colors">
              <span className="material-symbols-outlined text-slate-500">arrow_back</span>
            </button>
            <div>
              <input 
                value={currentTitle} 
                onChange={(e) => setCurrentTitle(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-lg font-black text-slate-900 dark:text-white italic p-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setViewState('preview')}
              className="px-6 py-2 rounded-xl border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-background-dark transition-all"
            >
              Preview
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
            >
              Save Template
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-4xl mx-auto w-full overflow-y-auto">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
            <div className="p-3 bg-slate-50 dark:bg-background-dark/50 border-b border-slate-200 dark:border-border-dark flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-background-dark rounded-lg p-1 mr-4 border border-slate-200 dark:border-border-dark">
                <button 
                  onClick={() => setEditorMode('visual')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${editorMode === 'visual' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
                >Visual</button>
                <button 
                  onClick={() => setEditorMode('html')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${editorMode === 'html' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
                >HTML Source</button>
              </div>
              
              {editorMode === 'visual' && (
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-white dark:hover:bg-surface-dark text-slate-400 transition-all"><span className="material-symbols-outlined text-[20px] font-black">format_bold</span></button>
                  <button className="p-2 rounded hover:bg-white dark:hover:bg-surface-dark text-slate-400 transition-all"><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                  <button className="p-2 rounded hover:bg-white dark:hover:bg-surface-dark text-slate-400 transition-all"><span className="material-symbols-outlined text-[20px]">image</span></button>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {editorMode === 'visual' ? (
                <div 
                  contentEditable 
                  suppressContentEditableWarning
                  className="p-12 outline-none text-slate-600 dark:text-slate-300 leading-relaxed font-medium min-h-full"
                  dangerouslySetInnerHTML={{ __html: currentContent }}
                  onBlur={(e) => setCurrentContent(e.currentTarget.innerHTML)}
                />
              ) : (
                <textarea 
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  className="w-full h-full p-12 bg-[#0d1117] text-green-400 font-mono text-sm border-none focus:ring-0 resize-none min-h-[500px]"
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (viewState === 'preview') {
    return (
      <div className="flex flex-col h-full bg-slate-100 dark:bg-background-dark animate-[fadeIn_0.3s_ease-out]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewState('editor')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-background-dark transition-colors">
              <span className="material-symbols-outlined text-slate-500">arrow_back</span>
            </button>
            <h3 className="text-lg font-black text-slate-900 dark:text-white italic">Preview: {currentTitle}</h3>
          </div>
          <div className="flex bg-slate-200 dark:bg-background-dark rounded-xl p-1 border border-slate-300 dark:border-border-dark">
            <button 
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
            >
              <span className="material-symbols-outlined text-lg">smartphone</span> Mobile
            </button>
            <button 
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
            >
              <span className="material-symbols-outlined text-lg">desktop_windows</span> Desktop
            </button>
          </div>
        </header>

        <main className="flex-1 p-12 flex flex-col items-center justify-center overflow-y-auto">
          <div className={`transition-all duration-500 bg-white shadow-2xl border-4 border-slate-900 dark:border-slate-800 overflow-hidden ${previewDevice === 'mobile' ? 'w-[360px] h-[640px] rounded-[3rem]' : 'w-full max-w-5xl aspect-video rounded-2xl'}`}>
            <div className="h-full w-full flex flex-col bg-white">
              {/* Header simulator */}
              <div className="bg-slate-50 border-b border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">AC</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-900 truncate">Acme Corp Team</p>
                    <p className="text-[8px] font-bold text-slate-500">To: Alex Morgan</p>
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">Today</span>
                </div>
              </div>
              <div className="flex-1 p-8 overflow-y-auto bg-white text-slate-700">
                <div className="preview-html-content" dangerouslySetInnerHTML={{ __html: currentContent }} />
              </div>
              <div className="p-4 border-t border-slate-50 bg-slate-50/50 text-center">
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest italic">Unsubscribe • Open in Browser</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Message Templates</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Ready-to-use layouts or start your own design from scratch.</p>
        </div>
        <div className="bg-slate-100 dark:bg-surface-dark p-1 rounded-xl border border-slate-200 dark:border-border-dark flex gap-1 shadow-sm">
          <button className="px-4 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">All</button>
          <button className="px-4 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white">SMS</button>
          <button className="px-4 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white">Email</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {canEdit && (
          <div 
            onClick={handleStartFromScratch}
            className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center min-h-[340px] hover:border-primary hover:bg-primary/5 transition-all cursor-pointer shadow-sm hover:shadow-xl active:scale-[0.98]"
          >
             <div className="size-20 rounded-full bg-slate-100 dark:bg-background-dark border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary/10 group-hover:border-primary/20">
               <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-4xl">add</span>
             </div>
             <p className="font-black text-slate-900 dark:text-white tracking-widest uppercase text-[10px]">Start from scratch</p>
          </div>
        )}

        {systemTemplates.map((t) => (
          <div key={t.id} className="bg-white dark:bg-surface-dark rounded-[2rem] border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm transition-all hover:shadow-2xl hover:border-primary/50 group flex flex-col min-h-[340px]">
            <div className="h-44 bg-slate-50 dark:bg-background-dark/50 relative flex items-center justify-center border-b border-slate-100 dark:border-border-dark">
               <span className={`material-symbols-outlined text-7xl opacity-10 ${t.color}`}>{t.type === 'Email' ? 'mail' : t.type === 'SMS' ? 'sms' : 'chat'}</span>
               <div className="absolute top-4 right-4 px-3 py-1 bg-white dark:bg-background-dark rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-border-dark shadow-sm">
                 {t.type}
               </div>
               <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                 {canEdit && (
                   <button 
                    onClick={() => handleEdit(t)}
                    className="size-12 rounded-full bg-white text-primary flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 active:scale-90"
                   >
                     <span className="material-symbols-outlined">edit</span>
                   </button>
                 )}
               </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 italic tracking-tight">{t.title}</h3>
               <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{t.desc}</p>
               <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-100 dark:border-border-dark/50">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketing</span>
                 <button 
                  onClick={() => handlePreview(t)}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline italic"
                 >
                   Sample Preview
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;

import React, { useState, useEffect } from 'react';
import { useRole } from '../RoleContext';
import { VisualEditor } from '../components/VisualEditor';

const LAYOUT_PRESETS = [
  {
    id: 'p1',
    title: 'Welcome Email',
    type: 'Email',
    category: 'Onboarding',
    content: `
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: #135bec; font-size: 32px; font-weight: 900; italic: true;">Welcome to the Family!</h1>
        <p style="font-size: 16px; color: #475569;">We're thrilled to have you with us. Here's a little something to get you started.</p>
        <div style="margin: 30px 0;">
          <a href="#" style="background-color: #135bec; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Get Started</a>
        </div>
      </div>
    `
  },
  {
    id: 'p2',
    title: 'Monthly Statement',
    type: 'Email',
    category: 'Finance',
    content: `
      <div style="padding: 20px;">
        <h2 style="font-weight: 900; color: #1e293b;">Loan Summary: June 2024</h2>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Current Balance</p>
          <p style="margin: 0; font-size: 24px; font-weight: 800; color: #135bec;">$2,450.00</p>
        </div>
        <p style="font-size: 14px; color: #475569;">Click below to view your full transaction history.</p>
        <a href="#" style="color: #135bec; font-weight: bold; text-decoration: underline;">View Full Statement</a>
      </div>
    `
  },
  {
    id: 'p3',
    title: 'Holiday Promotion',
    type: 'Email',
    category: 'Marketing',
    content: `
      <div style="background-color: #135bec; color: white; border-radius: 20px; padding: 40px; text-align: center;">
        <h1 style="font-weight: 900; margin: 0;">BIG SUMMER SALE</h1>
        <p style="font-size: 20px; opacity: 0.9;">Up to 50% Off Everything</p>
        <p style="margin-top: 20px;">Use code: <strong>SUMMER50</strong></p>
      </div>
    `
  }
];

interface Template {
  id: string;
  title: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  status: 'Draft' | 'Published';
  category?: string;
  tags?: string[];
  subject?: string;
  content: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

const commonVariables = [
  { label: 'First Name', value: '{{firstName}}' },
  { label: 'Last Name', value: '{{surname}}' },
  { label: 'Full Name', value: '{{fullName}}' },
  { label: 'Email', value: '{{email}}' },
  { label: 'Phone', value: '{{mobilePhone}}' },
];

const getTemplateColor = (type: string) => {
  switch (type) {
    case 'Email': return 'text-purple-500';
    case 'SMS': return 'text-orange-500';
    case 'WhatsApp': return 'text-green-500';
    default: return 'text-slate-500';
  }
};

const Templates = () => {
  const { role, token } = useRole();
  const [viewState, setViewState] = useState<'grid' | 'editor' | 'preview'>('grid');
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<Template> | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [filterType, setFilterType] = useState<'All' | 'Email' | 'SMS' | 'WhatsApp'>('All');
  const [isSaving, setIsSaving] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [selectedPresetType, setSelectedPresetType] = useState<Template['type']>('Email');

  const canEdit = role === 'Admin' || role === 'Manager' || role === 'Editor';

  useEffect(() => {
    fetchTemplates();
  }, [token]);

  const fetchTemplates = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = (type: Template['type'] = 'Email') => {
    setSelectedPresetType(type);
    setIsPresetModalOpen(true);
  };

  const selectPreset = (preset: any | null) => {
    setCurrentTemplate({
      title: preset ? preset.title : 'Untitled Template',
      type: selectedPresetType,
      category: preset ? preset.category : 'General',
      content: preset ? preset.content : (selectedPresetType === 'Email' ? '<p>Start typing...</p>' : ''),
      status: 'Draft'
    });
    setIsPresetModalOpen(false);
    setViewState('editor');
  };

  const handleEdit = (template: Template) => {
    setCurrentTemplate(template);
    setViewState('editor');
  };

  const handlePreview = (template: Template) => {
    setCurrentTemplate(template);
    setViewState('preview');
  };

  const handleSave = async () => {
    if (!token || !currentTemplate || isSaving) return;

    setIsSaving(true);
    const method = currentTemplate.id ? 'PATCH' : 'POST';
    const url = currentTemplate.id ? `${import.meta.env.VITE_API_URL}/templates/${currentTemplate.id}` : `${import.meta.env.VITE_API_URL}/templates`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentTemplate)
      });

      if (response.ok) {
        await fetchTemplates();
        setViewState('grid');
      } else {
        const errorData = await response.json();
        alert(`Failed to save: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this template?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const getSmsStats = (content: string) => {
    const chars = content.replace(/<[^>]*>/g, '').length;
    const segments = Math.ceil(chars / 160) || 1;
    return { chars, segments };
  };

  const filteredTemplates = templates.filter(t => filterType === 'All' || t.type === filterType);

  if (viewState === 'editor') {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark animate-[fadeIn_0.3s_ease-out]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewState('grid')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-background-dark transition-all">
              <span className="material-symbols-outlined text-slate-500">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <input
                value={currentTemplate?.title || ''}
                onChange={(e) => setCurrentTemplate(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="bg-transparent border-none focus:ring-0 text-xl font-black text-slate-900 dark:text-white italic p-0 w-64"
                placeholder="Template Name"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewState('preview')}
              className="px-6 py-2 rounded-xl border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-background-dark transition-all"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving...' : (currentTemplate?.id ? 'Update' : 'Save Template')}
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 overflow-hidden">
          {currentTemplate?.type === 'Email' && (
            <div className="animate-[slideDown_0.3s_ease-out] shrink-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2 italic">Subject Line</p>
              <input
                type="text"
                placeholder="Hook your audience with a great subject..."
                value={currentTemplate.subject || ''}
                onChange={(e) => setCurrentTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-2xl overflow-hidden relative">
            {/* Editor Switcher */}
            <div className="absolute top-4 right-4 z-50 flex bg-slate-100 dark:bg-background-dark rounded-xl p-1 border border-slate-200 dark:border-border-dark shadow-sm">
              <button
                onClick={() => setEditorMode('visual')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${editorMode === 'visual' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'}`}
              >Visual</button>
              <button
                onClick={() => setEditorMode('html')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${editorMode === 'html' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'}`}
              >Code</button>
            </div>

            <div className="h-full w-full">
              {editorMode === 'visual' ? (
                <VisualEditor
                  content={currentTemplate?.content || ''}
                  type={currentTemplate?.type}
                  onChange={(html) => setCurrentTemplate(prev => prev ? { ...prev, content: html } : null)}
                  variables={commonVariables}
                />
              ) : (
                <textarea
                  value={currentTemplate?.content || ''}
                  onChange={(e) => setCurrentTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                  className={`w-full h-full p-12 font-mono text-sm border-none focus:ring-0 resize-none ${editorMode === 'html' ? 'bg-[#0d1117] text-green-400' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-white'}`}
                  spellCheck={false}
                  placeholder="Design your message here..."
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
            <button onClick={() => setViewState('editor')} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-slate-500">arrow_back</span>
            </button>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">PREVIEW MODE</h3>
          </div>
          <div className="flex bg-slate-200 dark:bg-background-dark rounded-xl p-1 border border-slate-300 dark:border-border-dark">
            <button onClick={() => setPreviewDevice('mobile')} className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'mobile' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}><span className="material-symbols-outlined text-lg">smartphone</span> Mobile</button>
            <button onClick={() => setPreviewDevice('desktop')} className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'desktop' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}><span className="material-symbols-outlined text-lg">laptop</span> Desktop</button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <div className={`bg-white shadow-2xl border-12 border-slate-900 transition-all duration-500 overflow-hidden relative ${previewDevice === 'mobile' ? 'w-[375px] h-[667px] rounded-[4rem]' : 'w-full max-w-5xl rounded-3xl h-[700px]'}`}>
            {currentTemplate?.type === 'Email' ? (
              <div className="w-full h-full overflow-y-auto p-4 sm:p-8 bg-white" dangerouslySetInnerHTML={{ __html: currentTemplate?.content || '' }} />
            ) : (
              <div className="w-full h-full bg-slate-50 p-6 flex flex-col pt-16">
                {/* Status Bar Simulation */}
                <div className="absolute top-0 left-0 right-0 h-10 px-8 flex justify-between items-center bg-slate-50/50 backdrop-blur-md">
                  <span className="text-[10px] font-black text-slate-800">9:41</span>
                  <div className="flex gap-1">
                    <span className="material-symbols-outlined text-xs">signal_cellular_4_bar</span>
                    <span className="material-symbols-outlined text-xs">wifi</span>
                    <span className="material-symbols-outlined text-xs">battery_full</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark p-5 rounded-[1.5rem] rounded-tl-none shadow-xl shadow-slate-200/50 relative max-w-[90%] self-start border border-slate-100 dark:border-border-dark animate-[slideInUp_0.3s_ease-out]">
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">
                    {currentTemplate?.content?.replace(/<[^>]*>/g, '')}
                  </p>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 ml-2 italic">Delivered • Just Now</p>

                {/* Input Simulation */}
                <div className="absolute bottom-6 left-6 right-6 h-12 bg-white rounded-full border border-slate-200 shadow-lg flex items-center px-4 gap-3">
                  <span className="material-symbols-outlined text-slate-300">add_circle</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full"></div>
                  <span className="material-symbols-outlined text-primary text-xl">send</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-widest italic uppercase">Templates</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold tracking-wide">Design once, send forever. Professional no-code library.</p>
        </div>
        <div className="bg-slate-100 dark:bg-surface-dark p-1 rounded-2xl border border-slate-200 dark:border-border-dark flex gap-1 shadow-inner">
          {['All', 'Email', 'SMS'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-white dark:bg-background-dark text-primary shadow-lg shadow-primary/5' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* NEW CARDS */}
        {canEdit && (
          <div className="flex flex-col gap-6 h-[380px]">
            <button
              onClick={() => handleStartNew('Email')}
              className="flex-1 group bg-slate-50 dark:bg-background-dark/30 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary active:scale-95 shadow-sm"
            >
              <div className="size-12 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-xl group-hover:shadow-primary/20 transition-all mb-2">
                <span className="material-symbols-outlined text-2xl">mail</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">New Email</span>
            </button>
            <button
              onClick={() => handleStartNew('SMS')}
              className="flex-1 group bg-slate-50 dark:bg-background-dark/30 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-500/5 transition-all text-slate-400 hover:text-orange-500 active:scale-95 shadow-sm"
            >
              <div className="size-12 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-xl group-hover:shadow-orange-500/20 transition-all mb-2">
                <span className="material-symbols-outlined text-2xl text-orange-500">sms</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic text-orange-500">New SMS</span>
            </button>
          </div>
        )}

        {isLoading ? [1, 2, 3].map(i => <div key={i} className="h-[380px] rounded-[2.5rem] bg-slate-100 dark:bg-surface-dark animate-pulse border border-slate-200 dark:border-border-dark" />) :
          filteredTemplates.map(t => (
            <div key={t.id} className="group h-[380px] bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col relative">
              <div className="h-44 bg-slate-50 dark:bg-background-dark/30 flex items-center justify-center relative border-b border-slate-100 dark:border-border-dark">
                <span className={`material-symbols-outlined text-7xl opacity-5 ${getTemplateColor(t.type)}`}>
                  {t.type === 'Email' ? 'mail' : 'sms'}
                </span>
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-3 py-1 bg-white dark:bg-background-dark rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-border-dark shadow-sm">
                    {t.type}
                  </span>
                </div>

                {/* VISUAL OVERLAY ACTIONS */}
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-4">
                  <button onClick={() => handleEdit(t)} className="size-12 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="size-12 rounded-full bg-white text-red-500 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate italic">{t.title}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{t.category || 'GENERAL'}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase italic">Updated {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'Now'}</span>
                  <button onClick={() => handlePreview(t)} className="px-4 py-1.5 rounded-xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Preview</button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* PRESET PICKER MODAL */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/95 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]" onClick={() => setIsPresetModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl animate-[zoomIn_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-widest">Choose a Starting Layout</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Pick a professional preset to save time and effort</p>
              </div>
              <button onClick={() => setIsPresetModalOpen(false)} className="size-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                onClick={() => selectPreset(null)}
                className="h-64 rounded-[2.5rem] bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-white/10 transition-all group"
              >
                <span className="material-symbols-outlined text-4xl text-slate-500 group-hover:text-primary mb-3">edit_document</span>
                <p className="text-xs font-black text-white uppercase tracking-widest">Blank Slate</p>
              </div>
              {LAYOUT_PRESETS.filter(p => p.type === selectedPresetType).map(preset => (
                <div
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className="h-64 rounded-[2.5rem] bg-white dark:bg-surface-dark p-6 cursor-pointer hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all group flex flex-col"
                >
                  <div className="flex-1 bg-slate-50 dark:bg-background-dark/50 rounded-2xl mb-4 overflow-hidden p-4">
                    <div className="scale-50 origin-top opacity-50 pointer-events-none" dangerouslySetInnerHTML={{ __html: preset.content }} />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs italic">{preset.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{preset.category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;

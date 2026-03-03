
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../RoleContext';

type Step = 1 | 2 | 3 | 4;
type GroupType = 'static' | 'dynamic';

interface Segment {
  id: string;
  name: string;
  desc: string;
  count: number;
  icon: string;
  color: string;
}

interface ContactItem {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
}

const globalContacts: ContactItem[] = [
  { id: 1, name: 'Jane Cooper', role: 'Marketing Lead', email: 'jane@example.com', status: 'Active' },
  { id: 2, name: 'Wade Warren', role: 'Developer', email: 'wade@example.com', status: 'Unsubscribed' },
  { id: 3, name: 'Esther Black', role: 'Designer', email: 'esther@example.com', status: 'Active' },
  { id: 4, name: 'Cameron Williamson', role: 'Sales', email: 'cameron@example.com', status: 'Pending' },
  { id: 5, name: 'Brooklyn Simmons', role: 'CTO', email: 'brooklyn@example.com', status: 'Active' },
  { id: 6, name: 'Guy Hawkins', role: 'Support', email: 'guy@example.com', status: 'Active' },
];

const mockSegments: Segment[] = [
  { id: 'vip', name: 'VIP Customers', desc: 'Active purchasers in the last 30 days', count: 1240, icon: 'group', color: 'text-blue-500' },
  { id: 'news', name: 'Newsletter Subscribers', desc: 'Marketing opt-ins from web forms', count: 8500, icon: 'bolt', color: 'text-purple-500' },
  { id: 'retail', name: 'Retail Partners', desc: 'Regional distributors and stores', count: 162, icon: 'storefront', color: 'text-green-500' },
  { id: 'churn', name: 'Churn Risk', desc: 'Inactive for over 60 days', count: 943, icon: 'warning', color: 'text-yellow-500' },
  { id: 'beta', name: 'Product Beta Testers', desc: 'Early adopters program', count: 310, icon: 'celebration', color: 'text-pink-500' },
];

const CampaignWizard = () => {
  const { role } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'User') {
      navigate('/campaigns');
    }
  }, [role, navigate]);

  const [step, setStep] = useState<Step>(1);
  
  // Step 1: Details State
  const [campaignName, setCampaignName] = useState('Summer Sale 2024');
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms'>('email');
  const [campaignCategory, setCampaignCategory] = useState<'promotional' | 'transactional' | 'newsletter'>('promotional');
  
  // Step 2: Audience State
  const [selectedSegments, setSelectedSegments] = useState<string[]>(['vip', 'retail']);
  const [excludedSegments, setExcludedSegments] = useState<string[]>([]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupType, setNewGroupType] = useState<GroupType>('dynamic');
  
  // Modal State
  const [modalSearch, setModalSearch] = useState('');
  const [modalSelectedContacts, setModalSelectedContacts] = useState<Set<number>>(new Set());
  
  // Step 3: Content State
  const [fromName, setFromName] = useState('Acme Corp Team');
  const [fromEmail, setFromEmail] = useState('marketing@acme.com');
  const [replyTo, setReplyTo] = useState('support@acme.com');
  const [subject, setSubject] = useState('🚀 Special Offer just for you, {{FirstName}}!');
  const [preheader, setPreheader] = useState('Open to see your exclusive summer discount codes inside.');
  const [htmlContent, setHtmlContent] = useState(`
<p>Hi <span class="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold">{{FirstName}}</span>,</p>
<p>We are excited to announce our latest product update. It comes packed with features you requested.</p>
<div class="my-8 rounded-2xl overflow-hidden h-48 w-full bg-cover bg-center border border-slate-200 dark:border-border-dark" style="background-image: url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800&h=400')"></div>
<p>Don't miss out on the early bird discount available until Friday.</p>
<div class="pt-4">
  <p class="font-bold text-slate-900 dark:text-white">Best,</p>
  <p>The Acme Team</p>
</div>
  `.trim());

  // Step 4: Schedule State
  const [deliveryType, setDeliveryType] = useState<'immediate' | 'scheduled' | 'throttled'>('scheduled');
  const [scheduledDate, setScheduledDate] = useState('2024-06-25');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [throttleRate, setThrottleRate] = useState(1000); // messages per hour

  // UI State
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const steps = [
    { n: 1, title: 'Campaign Details', sub: 'Name & Channel' },
    { n: 2, title: 'Audience', sub: 'Select recipients' },
    { n: 3, title: 'Content & Design', sub: 'Compose message' },
    { n: 4, title: 'Review & Schedule', sub: 'Final check' },
  ];

  const filteredModalContacts = useMemo(() => {
    return globalContacts.filter(c => 
      c.name.toLowerCase().includes(modalSearch.toLowerCase()) || 
      c.email.toLowerCase().includes(modalSearch.toLowerCase())
    );
  }, [modalSearch]);

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step);
    else {
      setToastMessage('Campaign Submitted for Approval!');
      setShowToast(true);
      setTimeout(() => navigate('/campaigns'), 2000);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
    else navigate('/campaigns');
  };

  const toggleSegment = (id: string) => {
    setSelectedSegments(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const totalRecipients = useMemo(() => {
    const includedCount = selectedSegments.reduce((acc, id) => {
      const seg = mockSegments.find(s => s.id === id);
      return acc + (seg?.count || 0);
    }, 0);
    
    const excludedCount = excludedSegments.reduce((acc, id) => {
      const seg = mockSegments.find(s => s.id === id);
      return acc + (seg?.count || 0);
    }, 0);

    // Simple estimation: subtract 15% of excluded count to account for overlap
    return Math.max(0, includedCount - Math.floor(excludedCount * 0.85));
  }, [selectedSegments, excludedSegments]);

  const toggleModalContact = (id: number) => {
    const next = new Set(modalSelectedContacts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setModalSelectedContacts(next);
  };

  const toggleSelectAllModal = () => {
    if (modalSelectedContacts.size === filteredModalContacts.length) {
      setModalSelectedContacts(new Set());
    } else {
      setModalSelectedContacts(new Set(filteredModalContacts.map(c => c.id)));
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Segment group created successfully!');
    setShowToast(true);
    setIsCreateGroupModalOpen(false);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-background-dark overflow-hidden theme-transition relative">
      {/* Progress Sidebar */}
      <div className="w-64 hidden xl:flex flex-col border-r border-slate-200 dark:border-border-dark bg-white dark:bg-[#101622] shrink-0 p-6">
        <h3 className="text-sm font-black text-slate-500 dark:text-text-secondary uppercase tracking-widest mb-8">Progress</h3>
        <div className="relative flex flex-col gap-0">
          {steps.map((s, i) => (
            <div key={s.n} className="flex gap-4 relative">
              {i < steps.length - 1 && (
                <div className={`absolute left-[11px] top-7 bottom-[-20px] w-[2px] transition-all duration-500 ${step > s.n ? 'bg-primary' : 'bg-slate-200 dark:bg-border-dark'}`}></div>
              )}
              <div className="flex flex-col items-center z-10">
                <div className={`size-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step > s.n ? 'bg-primary border-primary' : step === s.n ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-white dark:bg-[#111722] border-slate-200 dark:border-border-dark'
                }`}>
                  {step > s.n ? (
                    <span className="material-symbols-outlined text-white text-[14px] font-black">check</span>
                  ) : (
                    <span className={`text-[11px] font-black ${step === s.n ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>{s.n}</span>
                  )}
                </div>
              </div>
              <div className="pb-8">
                <p className={`text-sm font-black leading-none mb-1 transition-colors ${step === s.n ? 'text-primary' : step > s.n ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-text-secondary font-bold'}`}>{s.title}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-text-secondary uppercase tracking-widest opacity-60">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-background-dark relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] shrink-0 theme-transition">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <span className="text-slate-400 dark:text-text-secondary">Campaigns</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-900 dark:text-white">Create New</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
               <span className="material-symbols-outlined text-[16px]">cloud_done</span> Draft Saved
             </span>
             <div className="h-4 w-px bg-slate-200 dark:bg-border-dark mx-1"></div>
             <button className="text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined text-[20px]">help</span></button>
             <button className="text-slate-400 hover:text-primary transition-all relative">
               <span className="material-symbols-outlined text-[20px]">notifications</span>
               <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111722]"></span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          {/* STEP 1: CAMPAIGN DETAILS */}
          {step === 1 && (
            <div className="max-w-3xl mx-auto p-12 space-y-10 animate-[fadeIn_0.3s_ease-out]">
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Campaign Details</h1>
                <p className="text-slate-500 font-medium">Set up the basic information and communication channel for your campaign.</p>
              </div>

              <div className="space-y-8">
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-sm space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Campaign Name</label>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">label</span>
                      </div>
                      <input 
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 outline-none transition-all font-bold italic"
                        placeholder="e.g. Q4 Product Launch"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Campaign Category</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['promotional', 'transactional', 'newsletter'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCampaignCategory(cat)}
                          className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            campaignCategory === cat 
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                              : 'bg-slate-50 dark:bg-[#111722] border-slate-200 dark:border-border-dark text-slate-500 hover:border-primary/50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Communication Channel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setSelectedChannel('email')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all group ${selectedChannel === 'email' ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722]'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${selectedChannel === 'email' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-surface-dark text-slate-400 group-hover:text-primary'}`}>
                          <span className="material-symbols-outlined text-3xl">mail</span>
                        </div>
                        <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedChannel === 'email' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                          {selectedChannel === 'email' && <div className="size-2.5 rounded-full bg-primary animate-[zoomIn_0.2s_ease-out]"></div>}
                        </div>
                      </div>
                      <h4 className="text-lg font-black dark:text-white tracking-tight italic">Email Campaign</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">Rich content with images, buttons, and personalized templates.</p>
                    </button>

                    <button 
                      onClick={() => setSelectedChannel('sms')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all group ${selectedChannel === 'sms' ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722]'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${selectedChannel === 'sms' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-surface-dark text-slate-400 group-hover:text-primary'}`}>
                          <span className="material-symbols-outlined text-3xl">sms</span>
                        </div>
                        <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedChannel === 'sms' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                          {selectedChannel === 'sms' && <div className="size-2.5 rounded-full bg-primary animate-[zoomIn_0.2s_ease-out]"></div>}
                        </div>
                      </div>
                      <h4 className="text-lg font-black dark:text-white tracking-tight italic">SMS Message</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">Direct text messages for high open rates and quick alerts.</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AUDIENCE SELECTION */}
          {step === 2 && (
            <div className="max-w-7xl mx-auto p-12 flex flex-col lg:flex-row gap-12 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex-1 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Select Audience</h1>
                  <p className="text-slate-500 font-medium">Choose contact groups or segments you want to target.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:max-w-xs group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    <input className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-sm font-bold shadow-sm outline-none focus:ring-1 focus:ring-primary" placeholder="Search groups..." />
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 px-5 py-2.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-lg">filter_list</span> Filters</button>
                    <button 
                      onClick={() => setIsCreateGroupModalOpen(true)}
                      className="flex-1 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                    >
                      + Create Group
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-[#1e293b]/50 flex justify-between items-center">
                    <div className="flex gap-4">
                      <button className="text-xs font-black text-primary uppercase tracking-widest border-b-2 border-primary pb-1">Include</button>
                      <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors pb-1">Exclude</button>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">15,402 Total</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-border-dark max-h-[480px] overflow-y-auto">
                    {mockSegments.map(seg => (
                      <div key={seg.id} className="p-5 flex items-center gap-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group" onClick={() => toggleSegment(seg.id)}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={selectedSegments.includes(seg.id)}
                            onChange={() => {}} 
                            className="size-5 rounded border-slate-300 text-primary focus:ring-primary bg-white dark:bg-background-dark pointer-events-none" 
                          />
                        </div>
                        <div className={`size-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark ${seg.color}`}>
                          <span className="material-symbols-outlined text-2xl">{seg.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black dark:text-white italic tracking-tight">{seg.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{seg.desc}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-sm font-black dark:text-white">{seg.count.toLocaleString()}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setExcludedSegments(prev => prev.includes(seg.id) ? prev.filter(s => s !== seg.id) : [...prev, seg.id]);
                            }}
                            className={`text-[9px] font-black uppercase tracking-tighter mt-1 px-2 py-0.5 rounded transition-all ${excludedSegments.includes(seg.id) ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-red-500'}`}
                          >
                            {excludedSegments.includes(seg.id) ? 'Excluded' : 'Exclude'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audience Sidebar */}
              <div className="w-full lg:w-80 shrink-0">
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 sticky top-8 flex flex-col gap-8 shadow-xl">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Audience Summary</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Real-time estimation</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#111722] rounded-2xl p-8 border border-slate-100 dark:border-border-dark text-center shadow-inner">
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">{totalRecipients.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">Unique Recipients</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Selected Groups</span>
                      <span className="text-slate-900 dark:text-white">{selectedSegments.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Exclusions</span>
                      <span className="text-red-500">{excludedSegments.length}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-border-dark flex justify-between items-center font-black">
                      <span className="text-xs dark:text-white uppercase tracking-widest">Estimated Reach</span>
                      <span className="text-green-500 italic">
                        {selectedSegments.length > 0 ? (92.4 - (excludedSegments.length * 2)).toFixed(1) : '0'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONTENT & DESIGN */}
          {step === 3 && (
            <div className="max-w-7xl mx-auto p-12 flex flex-col lg:flex-row gap-12 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex-1 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Compose Content</h1>
                  <p className="text-slate-500 font-medium">Design your message and personalize it for your audience.</p>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-sm space-y-8">
                  {/* Sender Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">From Name</label>
                      <input 
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">From Email</label>
                      <input 
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Subject & Preheader */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Line</label>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">add_reaction</span> Insert Emoji
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-4 py-3 pr-24 rounded-xl bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark text-sm font-bold italic outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary">
                          Personalize
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preheader Text</label>
                      <input 
                        value={preheader}
                        onChange={(e) => setPreheader(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                        placeholder="The short summary text that follows the subject line..."
                      />
                    </div>

                    <div className="pt-2">
                      <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest group">
                        <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">dashboard_customize</span>
                        Select from Template
                      </button>
                    </div>
                  </div>

                  {/* Editor Area */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Message Content</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            setToastMessage('AI is generating content...');
                            setShowToast(true);
                            // Simulate AI generation for demo
                            setTimeout(() => {
                              setHtmlContent(`
<p>Hi <span class="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold">{{FirstName}}</span>,</p>
<p>We've noticed you're a valued member of our community, and we wanted to say thank you with a special surprise!</p>
<div class="my-8 rounded-2xl overflow-hidden h-48 w-full bg-cover bg-center border border-slate-200 dark:border-border-dark" style="background-image: url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800&h=400')"></div>
<p>Use the code <strong>SUMMER24</strong> at checkout to receive 25% off your next purchase. This offer is exclusive to our VIP members.</p>
<div class="pt-4">
  <p class="font-bold text-slate-900 dark:text-white">Warmly,</p>
  <p>The MsgScale Team</p>
</div>
                              `.trim());
                              setToastMessage('AI Content Generated!');
                              setTimeout(() => setShowToast(false), 2000);
                            }, 1500);
                          }}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-primary/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Generate
                        </button>
                        <button className="px-3 py-1.5 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/5 transition-all">
                          <span className="material-symbols-outlined text-sm">history</span> Versions
                        </button>
                      </div>
                    </div>
                    <div className="border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-inner">
                      <div className="bg-slate-50 dark:bg-background-dark/50 border-b border-slate-200 dark:border-border-dark p-2 flex gap-1">
                        {['format_bold', 'format_italic', 'format_underlined', 'link', 'image', 'variable'].map(icon => (
                          <button key={icon} className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-white/5 hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                          </button>
                        ))}
                      </div>
                      <textarea 
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        className="w-full h-96 p-6 bg-white dark:bg-[#0c111d] text-slate-900 dark:text-white font-mono text-sm outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Sidebar */}
              <div className="w-full lg:w-96 shrink-0 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Live Preview</h3>
                  <div className="flex bg-slate-100 dark:bg-surface-dark p-1 rounded-lg border border-slate-200 dark:border-border-dark">
                    <button 
                      onClick={() => setPreviewDevice('mobile')}
                      className={`size-8 rounded flex items-center justify-center transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-background-dark text-primary shadow-sm' : 'text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-lg">smartphone</span>
                    </button>
                    <button 
                      onClick={() => setPreviewDevice('desktop')}
                      className={`size-8 rounded flex items-center justify-center transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-background-dark text-primary shadow-sm' : 'text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-lg">desktop_windows</span>
                    </button>
                  </div>
                </div>

                <div className={`mx-auto bg-white dark:bg-background-dark border-8 border-slate-900 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 ${previewDevice === 'mobile' ? 'w-[320px] h-[640px]' : 'w-full h-[640px]'}`}>
                  <div className="h-full flex flex-col">
                    <div className="bg-slate-50 dark:bg-surface-dark p-4 border-b border-slate-200 dark:border-border-dark space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate italic">{subject}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0c111d]">
                      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SCHEDULE */}
          {step === 4 && (
            <div className="max-w-5xl mx-auto p-12 space-y-12 animate-[fadeIn_0.3s_ease-out]">
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Review & Launch</h1>
                <p className="text-slate-500 font-medium">One final check before your campaign goes live.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">info</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">Campaign Info</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Details & Channel</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Name</span>
                        <span className="text-sm font-black dark:text-white italic">{campaignName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Channel</span>
                        <span className="text-sm font-black dark:text-white uppercase">{selectedChannel}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</span>
                        <span className="text-sm font-black dark:text-white uppercase">{campaignCategory}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">groups</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">Audience</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recipients & Exclusions</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Recipients</span>
                        <span className="text-sm font-black text-primary italic">{totalRecipients.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Segments</span>
                        <span className="text-sm font-black dark:text-white">{selectedSegments.length} Selected</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheduling Card */}
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-xl space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Delivery Schedule</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Choose when to send</p>
                  </div>

                  <div className="space-y-4">
                    {(['immediate', 'scheduled', 'throttled'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setDeliveryType(type)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                          deliveryType === type ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30'
                        }`}
                      >
                        <div className={`size-10 rounded-lg flex items-center justify-center ${deliveryType === type ? 'bg-primary text-white' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined">
                            {type === 'immediate' ? 'bolt' : type === 'scheduled' ? 'calendar_today' : 'speed'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black dark:text-white uppercase tracking-tight italic">{type.replace('_', ' ')}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">
                            {type === 'immediate' ? 'Send as soon as possible' : type === 'scheduled' ? 'Pick a specific date and time' : 'Send in batches over time'}
                          </p>
                        </div>
                        <div className={`size-5 rounded-full border-2 flex items-center justify-center ${deliveryType === type ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                          {deliveryType === type && <div className="size-2.5 rounded-full bg-primary"></div>}
                        </div>
                      </button>
                    ))}
                  </div>

                  {deliveryType === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-4 animate-[fadeIn_0.2s_ease-out]">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                        <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</label>
                        <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                    </div>
                  )}

                  {deliveryType === 'throttled' && (
                    <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Send Rate</label>
                          <span className="text-xs font-black text-primary italic">{throttleRate} msg/hr</span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="10000" 
                          step="100" 
                          value={throttleRate} 
                          onChange={(e) => setThrottleRate(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-border-dark rounded-lg appearance-none cursor-pointer accent-primary" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 dark:border-border-dark">
                    <button 
                      onClick={() => {
                        setToastMessage('Test message sent to ' + fromEmail);
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                      }}
                      className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">send</span>
                      Send Test Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="absolute bottom-0 left-0 right-0 xl:left-64 bg-white/95 dark:bg-[#101622]/95 backdrop-blur-md border-t border-slate-200 dark:border-border-dark p-4 z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
          <button 
            onClick={handleBack} 
            className="px-8 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-surface-dark transition-all flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back
          </button>
          <div className="flex gap-4">
             <button className="px-10 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-surface-dark transition-all">Save Draft</button>
             <button 
              onClick={handleNext} 
              className="px-12 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all flex items-center gap-2 hover:bg-blue-600 hover:translate-y-[-1px]"
             >
               {step === 4 ? 'Submit for Approval' : 'Next'}
               <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
             </button>
          </div>
        </div>
      </main>

      {/* CREATE GROUP MODAL */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsCreateGroupModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] shadow-2xl overflow-hidden animate-[zoomIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-background-dark/30">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-widest italic">Create Audience Group</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-70 mt-1">Global directory segmenting engine</p>
              </div>
              <button onClick={() => setIsCreateGroupModalOpen(false)} className="size-10 rounded-full bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Group Type Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setNewGroupType('static')}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group ${newGroupType === 'static' ? 'border-primary bg-primary/5 shadow-xl' : 'border-slate-100 dark:border-border-dark'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${newGroupType === 'static' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-background-dark text-slate-400'}`}>
                      <span className="material-symbols-outlined">group</span>
                    </div>
                    {newGroupType === 'static' && <span className="material-symbols-outlined text-primary text-sm font-black">check_circle</span>}
                  </div>
                  <h4 className="text-sm font-black dark:text-white uppercase tracking-tight italic">Static Selection</h4>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">Pick some or ALL contacts from the global database.</p>
                </div>

                <div 
                  onClick={() => setNewGroupType('dynamic')}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group ${newGroupType === 'dynamic' ? 'border-primary bg-primary/5 shadow-xl' : 'border-slate-100 dark:border-border-dark'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${newGroupType === 'dynamic' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-background-dark text-slate-400'}`}>
                      <span className="material-symbols-outlined">auto_fix_high</span>
                    </div>
                    {newGroupType === 'dynamic' && <span className="material-symbols-outlined text-primary text-sm font-black">check_circle</span>}
                  </div>
                  <h4 className="text-sm font-black dark:text-white uppercase tracking-tight italic">Dynamic Rules</h4>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">Automatically includes contacts based on logic-based criteria.</p>
                </div>
              </div>

              {/* Group Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Group Name</label>
                <input required className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-5 py-3.5 text-sm text-slate-900 dark:text-white font-bold italic outline-none focus:ring-1 focus:ring-primary shadow-inner" placeholder="e.g. Active High-Value VIPs" />
              </div>

              {/* STATIC: Contact List Picker */}
              {newGroupType === 'static' && (
                <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative flex-1 w-full group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
                      <input 
                        value={modalSearch}
                        onChange={(e) => setModalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark text-xs font-bold italic outline-none focus:ring-1 focus:ring-primary" 
                        placeholder="Search global directory..." 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={toggleSelectAllModal}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all flex items-center gap-2 shrink-0"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${modalSelectedContacts.size === filteredModalContacts.length ? 'text-primary fill' : ''}`}>
                        {modalSelectedContacts.size === filteredModalContacts.length ? 'check_circle' : 'circle'}
                      </span>
                      Select ALL Global Contacts
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#0c1016] border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-border-dark">
                    {filteredModalContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        onClick={() => toggleModalContact(contact.id)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${modalSelectedContacts.has(contact.id) ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                           <div className={`size-4 rounded border flex items-center justify-center transition-all ${modalSelectedContacts.has(contact.id) ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                             {modalSelectedContacts.has(contact.id) && <span className="material-symbols-outlined text-white text-[12px] font-black">check</span>}
                           </div>
                           <div>
                             <p className="text-xs font-black text-slate-900 dark:text-white italic leading-tight">{contact.name}</p>
                             <p className="text-[10px] text-slate-500 font-bold uppercase">{contact.role}</p>
                           </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{contact.email}</span>
                      </div>
                    ))}
                    {filteredModalContacts.length === 0 && (
                      <div className="p-12 text-center text-[10px] font-black text-slate-400 uppercase italic">No global contacts match search</div>
                    )}
                  </div>
                </div>
              )}

              {/* DYNAMIC: Rule Builder with Contact Attributes */}
              {newGroupType === 'dynamic' && (
                <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Segment Criteria</label>
                    <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ Add Rule</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl group relative shadow-inner">
                       <select className="bg-transparent border-none text-[11px] font-black uppercase text-slate-900 dark:text-white focus:ring-0 cursor-pointer">
                         <option>Contact Name</option>
                         <option>Job Role</option>
                         <option>Email Domain</option>
                         <option>Contact Status</option>
                         <option>Last Active Date</option>
                         <option>VIP Status</option>
                       </select>
                       <select className="bg-transparent border-none text-[11px] font-bold text-primary focus:ring-0 cursor-pointer">
                         <option>is exactly</option>
                         <option>contains</option>
                         <option>starts with</option>
                         <option>is not</option>
                       </select>
                       <input className="bg-transparent border-none text-[11px] font-black text-slate-900 dark:text-white focus:ring-0 flex-1 min-w-[120px]" placeholder="Search value..." />
                       <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                         <span className="material-symbols-outlined text-[18px]">delete</span>
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Preview Panel */}
              <div className="bg-slate-900 dark:bg-[#0c1016] rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between transition-all">
                 <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audience Estimator</p>
                   <p className="text-2xl font-black text-white italic tracking-tight">
                     {newGroupType === 'static' ? modalSelectedContacts.size : '1,240'} 
                     <span className="text-xs text-slate-500 not-italic font-bold uppercase ml-2 tracking-widest">Targeting Match</span>
                   </p>
                 </div>
                 <div className="size-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                    <span className="material-symbols-outlined text-2xl animate-pulse">groups</span>
                 </div>
              </div>
            </form>

            <div className="p-8 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 flex justify-end gap-4 shrink-0">
               <button 
                type="button" 
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="px-8 py-3 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"
               >
                 Cancel
               </button>
               <button 
                onClick={handleCreateGroup}
                className="px-10 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:bg-blue-600 hover:translate-y-[-2px] transition-all"
               >
                 Assemble Group
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-[slideInDown_0.3s_ease-out]">
          <div className="bg-green-500 text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
            <span className="material-symbols-outlined font-black">check_circle</span>
            <span className="text-sm font-black uppercase tracking-widest italic">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignWizard;

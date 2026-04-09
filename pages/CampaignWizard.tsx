import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../RoleContext';
import CreateGroupModal from '../components/CreateGroupModal';
import { VisualEditor } from '../components/VisualEditor';

type Step = 1 | 2 | 3 | 4;

const commonVariables = [
  { label: 'First Name', value: '{{firstName}}' },
  { label: 'Last Name', value: '{{surname}}' },
  { label: 'Full Name', value: '{{fullName}}' },
  { label: 'Email', value: '{{email}}' },
  { label: 'Phone', value: '{{mobilePhone}}' },
];

const CampaignWizard = () => {
  const { role, token, selectedWorkspace } = useRole();
  const isManager = role === 'Admin' || role === 'Manager';
  const navigate = useNavigate();
  const { id } = useParams();


  const [step, setStep] = useState<Step>(1);

  // Step 1: Details State
  const [campaignName, setCampaignName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms'>('email');
  const [campaignCategory, setCampaignCategory] = useState<'promotional' | 'transactional' | 'newsletter'>('promotional');

  // Step 2: Audience State
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [excludedSegments, setExcludedSegments] = useState<string[]>([]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const [externalVariables, setExternalVariables] = useState<string[]>([]);
  const [isUploadingExternal, setIsUploadingExternal] = useState(false);
  const [uploadError, setUploadError] = useState<{ title: string; message: string; details?: string[] } | null>(null);

  const availableVariables = useMemo(() => {
    const vars = [...commonVariables];
    externalVariables.forEach(v => {
      vars.push({ label: v, value: `{{${v}}}` });
    });
    return vars;
  }, [externalVariables]);

  const handleExternalDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingExternal(true);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet) as any[];

        if (rows.length === 0) {
          setUploadError({
            title: "Your file is empty",
            message: "We couldn't find any data rows in this spreadsheet. Please ensure it contains information below the headers.",
          });
          return;
        }

        // Identify headers (excluding the identifier)
        const allHeaders = Object.keys(rows[0]);
        const identifierKey = allHeaders.find(h => 
          h.toLowerCase() === 'identifier' || 
          h.toLowerCase() === 'phone' || 
          h.toLowerCase() === 'mobile' ||
          h.toLowerCase() === 'mobilephone' ||
          h.toLowerCase() === 'email'
        );

        if (!identifierKey) {
          setUploadError({
            title: "Missing Key Column",
            message: "We need a way to match these rows to your contacts. Your file MUST have one of these column headers:",
            details: ["Phone", "MobilePhone", "Email", "Identifier"]
          });
          return;
        }

        // Map identifier key to 'identifier' for the backend
        const processedRows = rows.map(r => {
          const { [identifierKey]: id, ...rest } = r;
          return { identifier: id, ...rest };
        });

        const customVars = allHeaders.filter(h => h !== identifierKey);
        
        if (customVars.length === 0) {
          setUploadError({
            title: "No Variable Columns Found",
            message: "This file only contains the identifier. To use variables, add extra columns like 'DiscountCode' or 'Balance' to your CSV.",
          });
          return;
        }

        setExternalVariables(customVars);
        (window as any)._pendingExternalData = processedRows;

        setToastMessage(`Success! Loaded ${processedRows.length} records with ${customVars.length} custom variables.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

      } catch (err) {
        console.error("Upload error:", err);
        setUploadError({
          title: "Format Not Recognized",
          message: "We had trouble reading this file. Please ensure it is a valid CSV or Excel (.xlsx) file.",
        });
      } finally {
        setIsUploadingExternal(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const fetchGroups = async () => {
    if (!selectedWorkspace?.id || !token) return;
    setIsLoadingGroups(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error("Failed to fetch groups", err);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
      fetchGroups();
    }
  }, [step, selectedWorkspace, token]);



  // Step 3: Content State
  const [fromName, setFromName] = useState('');
  const [replyTo, setReplyTo] = useState('support@acme.com');
  const [subject, setSubject] = useState('🚀 Special Offer just for you, {{firstName}}!');
  const [preheader, setPreheader] = useState('Open to see your exclusive summer discount codes inside.');
  const [htmlContent, setHtmlContent] = useState(`
<p>Hi <span class="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold">{{firstName}}</span>,</p>
<p>We are excited to announce our latest product update. It comes packed with features you requested.</p>
<div class="my-8 rounded-2xl overflow-hidden h-48 w-full bg-cover bg-center border border-slate-200 dark:border-border-dark" style="background-image: url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800&h=400')"></div>
<p>Don't miss out on the early bird discount available until Friday.</p>
<div class="pt-4">
  <p class="font-bold text-slate-900 dark:text-white">Best,</p>
  <p>The Acme Team</p>
</div>
  `.trim());

  // Step 4: Schedule State
  const [deliveryType, setDeliveryType] = useState<'immediate' | 'scheduled' | 'throttled' | 'cycle' | 'anniversary'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [throttleRate, setThrottleRate] = useState(100); // msgs per hour

  // New States for Cycle and Anniversary
  const [cycleType, setCycleType] = useState<'daily' | 'weekly'>('daily');
  const [cycleDay, setCycleDay] = useState<number>(1); // 1 = Monday, 7 = Sunday
  const [cycleTime, setCycleTime] = useState('');

  const [anniversaryField, setAnniversaryField] = useState('Date of Birth');
  const [anniversaryTime, setAnniversaryTime] = useState('');

  // UI State
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);

  useEffect(() => {
    if (id && token && selectedWorkspace?.id) {
      fetchCampaign();
    }
  }, [id, token, selectedWorkspace]);

  const fetchCampaign = async () => {
    setIsLoadingCampaign(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace?.id}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaignName(data.name);
        setSelectedChannel(data.channel.toLowerCase());
        setCampaignCategory(data.category.toLowerCase());
        setSubject(data.content.subject || '');
        setPreheader(data.content.preheader || '');
        setHtmlContent(data.content.body || '');

        if (data.scheduledAt) {
          const date = new Date(data.scheduledAt);
          setDeliveryType('scheduled');
          setScheduledDate(date.toISOString().split('T')[0]);
          setScheduledTime(date.toTimeString().substring(0, 5));
        } else if (data.throttleRate) {
          setDeliveryType('throttled');
          setThrottleRate(data.throttleRate);
        } else {
          setDeliveryType('immediate');
        }

        setSelectedSegments(data.recipients.filter((r: any) => r.isExcluded === 'false').map((r: any) => r.groupId));
        setExcludedSegments(data.recipients.filter((r: any) => r.isExcluded === 'true').map((r: any) => r.groupId));
      }
    } catch (err) {
      console.error("Failed to fetch campaign", err);
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  const steps = [
    { n: 1, title: 'Campaign Details', sub: 'Name & Channel' },
    { n: 2, title: 'Audience', sub: 'Select recipients' },
    { n: 3, title: 'Content & Design', sub: 'Compose message' },
    { n: 4, title: 'Review & Schedule', sub: 'Final check' },
  ];


  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSendTestEmail = async () => {
    if (!token || !selectedWorkspace?.id || isSendingTest) return;

    // Prompting manually for destination right now since it's the fastest way to support any email
    const destination = prompt('Enter the email address to send the test to:', '');
    if (!destination) return;

    setIsSendingTest(true);
    setToastMessage('Sending test email...');
    setShowToast(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace.id}/test-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: destination,
          subject: subject,
          preheader: preheader,
          htmlContent: htmlContent,
          fromName: selectedChannel === 'sms' ? fromName : undefined,
        })
      });

      if (response.ok) {
        setToastMessage(`Test sent successfully to ${destination}!`);
      } else {
        const errorData = await response.json();
        setToastMessage(`Failed to send test: ${errorData.message}`);
      }
    } catch (error) {
      setToastMessage('Failed to send test due to a network error.');
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const handleSaveCampaign = async (isSubmit = false) => {
    if (!token || !selectedWorkspace?.id || isSaving) return;

    setIsSaving(true);
    const campaignData = {
      name: campaignName,
      channel: selectedChannel.toUpperCase(),
      category: campaignCategory.toUpperCase(),
      content: {
        subject: selectedChannel === 'email' ? subject : undefined,
        preheader: selectedChannel === 'email' ? preheader : undefined,
        body: htmlContent, // For SMS, htmlContent holds the plain text from the editor
        senderId: selectedChannel === 'sms' ? fromName : undefined,
      },
      scheduledAt: deliveryType === 'scheduled' ? `${scheduledDate}T${scheduledTime}:00` : null,
      throttleRate: deliveryType === 'throttled' ? throttleRate : null,
      cycleConfig: deliveryType === 'cycle' ? { type: cycleType, dayOfWeek: cycleType === 'weekly' ? cycleDay : null, time: cycleTime } : null,
      anniversaryConfig: deliveryType === 'anniversary' ? { field: anniversaryField, time: anniversaryTime } : null,
      recipients: [
        ...selectedSegments.map(id => ({ groupId: id, isExcluded: false })),
        ...excludedSegments.map(id => ({ groupId: id, isExcluded: true }))
      ],
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace.id}${id ? `/${id}` : ''}`, {
        method: id ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        const campaign = await response.json();

        // Upload pending external data if exists
        const pendingData = (window as any)._pendingExternalData;
        if (pendingData) {
          await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace.id}/${campaign.id}/external-data`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rows: pendingData })
          });
          delete (window as any)._pendingExternalData;
        }

        if (isSubmit) {
          // Immediately submit for approval
          await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace.id}/${campaign.id}/submit`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setToastMessage(isManager ? 'Campaign Scheduled & Launched Successfully!' : 'Campaign Submitted for Approval!');
        } else {
          setToastMessage('Campaign Saved as Draft!');
        }

        setShowToast(true);
        setTimeout(() => navigate('/campaigns'), 2000);
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err) {
      console.error("Failed to save campaign", err);
      alert("Unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !campaignName.trim()) {
      alert("Please enter a Campaign Name to continue.");
      return;
    }
    if (step < 4) setStep((step + 1) as Step);
    else {
      handleSaveCampaign(true);
    }
  };

  const fetchTemplates = async () => {
    if (!token) return;
    setIsLoadingTemplates(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableTemplates(data.filter((t: any) => t.type.toLowerCase() === selectedChannel));
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const selectTemplate = (template: any) => {
    if (template.subject) setSubject(template.subject);
    setHtmlContent(template.content);
    setShowTemplatePicker(false);
    setToastMessage(`Loaded: ${template.title}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
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
      const seg = groups.find(s => s.id === id);
      return acc + (seg?.estimatedCount || 0);
    }, 0);

    const excludedCount = excludedSegments.reduce((acc, id) => {
      const seg = groups.find(s => s.id === id);
      return acc + (seg?.estimatedCount || 0);
    }, 0);

    // Simple estimation: subtract 15% of excluded count to account for overlap
    return Math.max(0, includedCount - Math.floor(excludedCount * 0.85));
  }, [selectedSegments, excludedSegments]);



  // We delegate group creation to CreateGroupModal now

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
                <div className={`size-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step > s.n ? 'bg-primary border-primary' : step === s.n ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-white dark:bg-[#111722] border-slate-200 dark:border-border-dark'
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
                          className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${campaignCategory === cat
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
                  <div className="divide-y divide-slate-100 dark:divide-border-dark max-h-[480px] overflow-y-auto w-full">
                    {isLoadingGroups && <div className="p-12 text-center text-slate-500 text-sm font-bold">Loading groups...</div>}
                    {!isLoadingGroups && groups.length === 0 && <div className="p-12 text-center text-slate-500 text-sm font-bold">No groups found. Create one to get started.</div>}
                    {groups.map(seg => (
                      <div key={seg.id} className="p-5 flex items-center gap-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group" onClick={() => toggleSegment(seg.id)}>
                        <div className="flex flex-col items-center justify-center gap-3 w-8 shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedSegments.includes(seg.id)}
                            onChange={() => { }}
                            className="size-5 rounded border-slate-300 text-primary focus:ring-primary bg-white dark:bg-background-dark pointer-events-none"
                          />
                        </div>
                        <div className={`size-12 rounded-xl flex shrink-0 items-center justify-center bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark ${seg.type === 'static' ? 'text-blue-500' : 'text-orange-500'}`}>
                          <span className="material-symbols-outlined text-2xl">{seg.type === 'static' ? 'list_alt' : 'bolt'}</span>
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-black dark:text-white italic tracking-tight truncate" title={seg.name}>{seg.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{seg.type} Group</p>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0 w-24">
                          <p className="text-sm font-black dark:text-white">{seg.estimatedCount.toLocaleString()}</p>
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
                    {/* <div className="pt-4 border-t border-slate-100 dark:border-border-dark flex justify-between items-center font-black">
                      <span className="text-xs dark:text-white uppercase tracking-widest">Estimated Reach</span>
                      <span className="text-green-500 italic">
                        {selectedSegments.length > 0 ? (92.4 - (excludedSegments.length * 2)).toFixed(1) : '0'}%
                      </span>
                    </div> */}
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
                  {/* External Data Upload */}
                  {/* <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between gap-6">
                    <div className="flex gap-4 items-center">
                       <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">database</span>
                       </div>
                       <div>
                          <h4 className="text-sm font-black dark:text-white uppercase tracking-tight">External Contextual Data</h4>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                            {externalVariables.length > 0 
                              ? `Active: ${externalVariables.join(', ')}` 
                              : 'Upload CSV with Phone + Custom Columns'
                            }
                          </p>
                       </div>
                    </div>
                    <div className="relative">
                       <input 
                         type="file" 
                         accept=".csv,.xlsx,.xls" 
                         className="absolute inset-0 opacity-0 cursor-pointer" 
                         onChange={handleExternalDataUpload}
                       />
                       <button className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">{isUploadingExternal ? 'sync' : 'upload_file'}</span>
                          {isUploadingExternal ? 'Processing...' : 'Upload Data'}
                       </button>
                    </div>
                  </div> */}

                  {/* Sender Details */}
                  {selectedChannel === 'sms' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sender ID</label>
                        <input
                          value={fromName}
                          onChange={(e) => setFromName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                          maxLength={11}
                        />
                      </div>
                    </div>
                  )}


                  {/* Subject & Preheader for Email */}
                  <div className="space-y-6">
                    {selectedChannel === 'email' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[slideDown_0.3s_ease-out]">
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
                              className="w-full px-4 py-3 pr-24 rounded-xl bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark text-sm font-bold italic outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Brief summary following the subject..."
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2 relative">
                      <button
                        onClick={() => {
                          fetchTemplates();
                          setShowTemplatePicker(!showTemplatePicker);
                        }}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest group"
                      >
                        <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">dashboard_customize</span>
                        {showTemplatePicker ? 'Close Picker' : 'Select from Template'}
                      </button>

                      {showTemplatePicker && (
                        <div className="absolute top-[calc(100%+10px)] left-0 right-0 z-[100] bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] shadow-2xl p-8 animate-[slideInUp_0.2s_ease-out]">
                          <div className="flex justify-between items-center mb-6 px-2">
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Your {selectedChannel} Templates</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select a starting point for your message</p>
                            </div>
                            <button
                              onClick={() => setShowTemplatePicker(false)}
                              className="size-8 rounded-full bg-slate-100 dark:bg-background-dark flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>

                          <div className="flex gap-6 overflow-x-auto pb-4 pr-2 min-h-[220px] relative no-scrollbar snap-x snap-mandatory">
                            {isLoadingTemplates ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <span className="material-symbols-outlined animate-spin text-2xl text-primary">autorenew</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading templates...</span>
                              </div>
                            ) : availableTemplates.length === 0 ? (
                              <div className="w-full h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <span className="material-symbols-outlined text-4xl opacity-20">inventory_2</span>
                                <p className="text-xs font-bold italic">No {selectedChannel} templates found.</p>
                              </div>
                            ) : (
                              availableTemplates.map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => selectTemplate(t)}
                                  className="group flex-shrink-0 w-64 snap-start flex flex-col items-start p-4 rounded-[2rem] border-2 border-slate-100 dark:border-border-dark hover:border-primary hover:bg-primary/5 transition-all text-left shadow-sm hover:shadow-xl hover:shadow-primary/5"
                                >
                                  <div className="w-full aspect-[4/3] bg-slate-50 dark:bg-background-dark/50 rounded-2xl mb-4 overflow-hidden p-3 relative border border-slate-100/50 dark:border-border-dark/50">
                                    <div
                                      className="w-[333%] h-[333%] scale-[0.3] origin-top-left opacity-60 group-hover:opacity-100 transition-all duration-500 scale-down-content"
                                      dangerouslySetInnerHTML={{ __html: t.content }}
                                    />
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors z-10" />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-50/80 dark:from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="px-1 w-full">
                                    <p className="text-xs font-black dark:text-white truncate w-full italic mb-1 group-hover:text-primary transition-colors">{t.title}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.category || 'General'}</p>
                                    </div>
                                  </div>
                                </button>
                              )))}
                          </div>

                          <div className="mt-4 flex justify-center gap-1">
                            {availableTemplates.length > 0 && Array.from({ length: Math.min(5, availableTemplates.length) }).map((_, i) => (
                              <div key={i} className={`h-1 rounded-full transition-all ${i === 0 ? 'w-4 bg-primary' : 'w-1 bg-slate-200 dark:bg-slate-700'}`}></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                   <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between gap-6 transition-all hover:bg-primary/10">
                      <div className="flex gap-4 items-center">
                        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">database</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-black dark:text-white uppercase tracking-tight italic">Contextual Variables</h4>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                              {externalVariables.length > 0 
                                ? `Ready: ${externalVariables.map(v => `{{${v}}}`).join(', ')}` 
                                : 'Upload CSV to use custom data for each contact'
                              }
                            </p>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept=".csv,.xlsx,.xls" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={handleExternalDataUpload}
                        />
                        <button className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 group">
                            <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">{isUploadingExternal ? 'sync' : 'upload_file'}</span>
                            {isUploadingExternal ? 'Processing...' : externalVariables.length > 0 ? 'Replace Data' : 'Upload CSV Data'}
                        </button>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-900/50 rounded-2xl p-6 animate-[shake_0.5s_ease-out]">
                        <div className="flex gap-4 items-start">
                          <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined font-black">warning</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                               <h4 className="text-sm font-black text-orange-900 dark:text-orange-200 uppercase tracking-tight">{uploadError.title}</h4>
                               <p className="text-xs text-orange-800/80 dark:text-orange-300/80 font-bold leading-relaxed">{uploadError.message}</p>
                            </div>
                            {uploadError.details && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {uploadError.details.map(d => (
                                  <span key={d} className="px-2 py-1 bg-white dark:bg-[#111722] border border-orange-200 dark:border-orange-900/50 rounded-lg text-[10px] font-black text-orange-600 dark:text-orange-400 font-mono">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            )}
                            <button 
                              onClick={() => setUploadError(null)}
                              className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 underline underline-offset-4 hover:opacity-70 transition-opacity"
                            >
                              Dismiss error and try again
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                   </div>

                  {/* Editor Area */}
                  <div className="h-[550px] flex flex-col">
                    <VisualEditor
                      content={htmlContent}
                      onChange={(html) => setHtmlContent(html)}
                      variables={availableVariables}
                      type={selectedChannel === 'email' ? 'Email' : 'SMS'}
                    />
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

                <div className={`mx-auto bg-white dark:bg-background-dark border-12 border-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-500 relative ${previewDevice === 'mobile' ? 'w-[320px] h-[640px]' : 'w-full h-[640px]'}`}>
                  <div className="h-full flex flex-col relative">
                    {selectedChannel === 'email' ? (
                      <>
                        <div className="bg-slate-50 dark:bg-surface-dark p-4 border-b border-slate-200 dark:border-border-dark space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate italic">{subject}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0c111d]">
                          <div className="prose prose-xs dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-slate-50 p-6 flex flex-col pt-16">
                        <div className="absolute top-0 left-0 right-0 h-10 px-8 flex justify-between items-center bg-slate-50/50 backdrop-blur-md">
                          <span className="text-[10px] font-black text-slate-800">12:00</span>
                          <div className="flex gap-1">
                            <span className="material-symbols-outlined text-xs">signal_cellular_4_bar</span>
                            <span className="material-symbols-outlined text-xs">wifi</span>
                            <span className="material-symbols-outlined text-xs">battery_full</span>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark p-4 rounded-[1.5rem] rounded-tl-none shadow-xl shadow-slate-200/50 relative max-w-[95%] self-start border border-slate-100 dark:border-border-dark animate-[slideInUp_0.3s_ease-out]">
                          <p className="text-[12px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">
                            {htmlContent.replace(/<[^>]*>/g, '')}
                          </p>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 ml-2 italic">Delivered • Just Now</p>

                        <div className="absolute bottom-6 left-6 right-6 h-12 bg-white rounded-full border border-slate-200 shadow-lg flex items-center px-4 gap-3">
                          <span className="material-symbols-outlined text-slate-300">add_circle</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full"></div>
                          <span className="material-symbols-outlined text-primary text-xl">send</span>
                        </div>
                      </div>
                    )}
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
                    {(['immediate', 'scheduled', 'throttled', 'cycle', 'anniversary'] as const).map((type) => {
                      const isRestricted = (type === 'cycle' || type === 'anniversary') && !isManager;
                      return (
                        <button
                          key={type}
                          disabled={isRestricted}
                          onClick={() => setDeliveryType(type)}
                          title={isRestricted ? "Permission Required: Manager role needed for recurring campaigns" : ""}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${deliveryType === type ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30'
                            } ${isRestricted ? 'opacity-40 grayscale cursor-not-allowed border-dashed' : 'hover:border-primary/50'}`}
                        >
                          <div className={`size-10 rounded-lg flex items-center justify-center ${deliveryType === type ? 'bg-primary text-white' : 'text-slate-400'}`}>
                            <span className="material-symbols-outlined">
                              {type === 'immediate' ? 'bolt' : type === 'scheduled' ? 'calendar_today' : type === 'throttled' ? 'speed' : type === 'cycle' ? 'autorenew' : 'cake'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black dark:text-white uppercase tracking-tight italic">{type.replace('_', ' ')}</p>
                              {isRestricted && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 text-[8px] font-black uppercase tracking-widest">
                                  <span className="material-symbols-outlined text-[10px]">lock</span> Restricted
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">
                              {type === 'immediate' ? 'Send as soon as possible' : type === 'scheduled' ? 'Pick a specific date and time' : type === 'throttled' ? 'Send in batches over time' : type === 'cycle' ? 'Send on a recurring schedule' : 'Trigger sent on contact dates'}
                            </p>
                          </div>
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center ${deliveryType === type ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                            {deliveryType === type && <div className="size-2.5 rounded-full bg-primary"></div>}
                          </div>
                        </button>
                      );
                    })}
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
                    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pacing Rate</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { value: 100, icon: '🐢', title: 'Slow & Safe', desc: 'Best for new domains. Highest deliverability.' },
                            { value: 500, icon: '🚶', title: 'Moderate', desc: 'Good balance. Safe for warmed-up domains.' },
                            { value: 2000, icon: '🏃', title: 'Fast', desc: 'Only use with proven high reputation.' }
                          ].map(preset => (
                            <button
                              key={preset.value}
                              onClick={() => setThrottleRate(preset.value)}
                              className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${throttleRate === preset.value ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 hover:border-slate-300'}`}
                            >
                              <div className="text-2xl pt-1 flex-shrink-0 leading-none">{preset.icon}</div>
                              <div>
                                <p className="text-sm font-black dark:text-white uppercase tracking-tight">{preset.title}</p>
                                <p className="text-[10px] text-slate-500 font-bold leading-snug mt-1">{preset.value.toLocaleString()} messages/hr</p>
                                <p className="text-[9px] text-slate-400 font-medium leading-relaxed mt-1 opacity-80">{preset.desc}</p>
                              </div>
                            </button>
                          ))}

                          <button
                            onClick={() => setThrottleRate(0)} // 0 triggers custom input mode below
                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${![100, 500, 2000].includes(throttleRate) ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 hover:border-slate-300'}`}
                          >
                            <div className="text-2xl pt-1 flex-shrink-0 leading-none">⚙️</div>
                            <div>
                              <p className="text-sm font-black dark:text-white uppercase tracking-tight">Custom Pacing</p>
                              {![100, 500, 2000].includes(throttleRate) && throttleRate > 0 ? (
                                <p className="text-[10px] text-primary font-bold leading-snug mt-1">{throttleRate.toLocaleString()} messages/hr</p>
                              ) : (
                                <p className="text-[10px] text-slate-500 font-bold leading-snug mt-1">Set a specific limit</p>
                              )}
                              <p className="text-[9px] text-slate-400 font-medium leading-relaxed mt-1 opacity-80">Manual control for advanced users.</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Custom Input Field */}
                      {![100, 500, 2000].includes(throttleRate) && (
                        <div className="flex bg-white dark:bg-[#111722] border border-primary rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1">
                          <span className="material-symbols-outlined text-primary px-3 self-center pointer-events-none">tune</span>
                          <div className="flex-1 flex flex-col justify-center">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1 mt-1">Custom Rate (per hour)</label>
                            <input
                              type="number"
                              min="1"
                              value={throttleRate || ''}
                              onChange={(e) => setThrottleRate(parseInt(e.target.value) || 0)}
                              className="w-full bg-transparent text-sm font-black dark:text-white border-0 outline-none p-1 pb-2 focus:ring-0 appearance-none"
                              placeholder="e.g. 1500"
                              autoFocus
                            />
                          </div>
                        </div>
                      )}

                      {/* Visual Helper Banner */}
                      {throttleRate > 0 && totalRecipients > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 flex gap-4 items-start shadow-sm animate-[fadeInDown_0.3s_ease-out]">
                          <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-1">Time to Completion</h4>
                            <p className="text-[11px] text-blue-800/80 dark:text-blue-200/80 font-medium leading-relaxed">
                              At <strong className="font-black text-blue-900 dark:text-blue-100">{throttleRate.toLocaleString()} messages per hour</strong>, your campaign will take approximately <strong className="font-black text-blue-900 dark:text-blue-100">{(totalRecipients / throttleRate).toFixed(1)} hours</strong> to finish sending to all {totalRecipients.toLocaleString()} contacts.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {deliveryType === 'cycle' && (
                    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Repeat Setup</label>
                          <select
                            value={cycleType}
                            onChange={(e) => setCycleType(e.target.value as 'daily' | 'weekly')}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold outline-none focus:ring-1 focus:ring-primary appearance-none"
                          >
                            <option value="daily">Every Day</option>
                            <option value="weekly">Once a Week</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time of Day</label>
                          <input type="time" value={cycleTime} onChange={(e) => setCycleTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>

                      {cycleType === 'weekly' && (
                        <div className="space-y-2 animate-[fadeInDown_0.2s_ease-out]">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Day of the Week</label>
                          <div className="flex gap-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCycleDay(idx + 1)}
                                className={`flex-1 aspect-square rounded-xl text-xs font-black transition-all border ${cycleDay === idx + 1 ? 'bg-primary border-primary text-white shadow-md' : 'bg-slate-50 dark:bg-background-dark/30 border-slate-200 dark:border-border-dark text-slate-500 hover:border-slate-300'}`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {deliveryType === 'anniversary' && (
                    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trigger Date Field</label>
                          <select
                            value={anniversaryField}
                            onChange={(e) => setAnniversaryField(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold outline-none focus:ring-1 focus:ring-primary appearance-none"
                          >
                            <option value="Date of Birth">Date of Birth</option>
                            <option value="External Date Created">External Date Created</option>
                            <option value="Joining Date">Joining Date</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time of Day</label>
                          <input type="time" value={anniversaryTime} onChange={(e) => setAnniversaryTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs font-bold outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                        <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-sm">info</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-orange-900 dark:text-orange-100 uppercase tracking-tight mb-1">Date Format Recognition</h4>
                          <p className="text-[11px] text-orange-800/80 dark:text-orange-200/80 font-medium leading-relaxed">
                            System automatically handles Excel serial dates (e.g. <span className="font-black bg-orange-200/50 px-1 rounded">30022</span> = <span className="font-black bg-orange-200/50 px-1 rounded">21-Feb-1982</span>) alongside standard formats (YYYY-MM-DD). The year is ignored to generate an annual trigger.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 dark:border-border-dark">
                    <button
                      onClick={handleSendTestEmail}
                      disabled={isSendingTest}
                      className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {isSendingTest ? 'hourglass_top' : 'send'}
                      </span>
                      {isSendingTest ? 'Sending Test...' : 'Send Test Message'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-[#101622]/95 backdrop-blur-md border-t border-slate-200 dark:border-border-dark p-4 z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
          <button
            onClick={handleBack}
            className="px-8 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-surface-dark transition-all flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => handleSaveCampaign(false)}
              disabled={isSaving}
              className="px-10 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-surface-dark transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleNext}
              disabled={isSaving}
              className="px-12 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all flex items-center gap-2 hover:bg-blue-600 hover:translate-y-[-1px] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Processing...
                </>
              ) : (
                <>
                  {step === 4 ? (isManager ? 'Schedule & Launch' : 'Submit for Approval') : 'Next'}
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* CREATE GROUP MODAL */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSuccess={() => {
          setIsCreateGroupModalOpen(false);
          setToastMessage('Segment group created successfully!');
          setShowToast(true);
          fetchGroups(); // Refresh groups after creation
          setTimeout(() => setShowToast(false), 3000);
        }}
      />

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

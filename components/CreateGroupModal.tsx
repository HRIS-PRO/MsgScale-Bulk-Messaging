import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useRole } from '../RoleContext';

interface Customer {
    id: string;
    fullName: string;
    email: string;
    mobilePhone: string;
    customerType: string;
    customFields: Record<string, string>;
}

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groupToEdit?: any;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess, groupToEdit }) => {
    const { token, selectedWorkspace } = useRole();
    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState<'static' | 'dynamic'>('static');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // --- Static State ---
    const [contacts, setContacts] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
    const [contextualData, setContextualData] = useState<{ identifier: string; data: Record<string, string> }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<{ title: string; message: string; details?: string[] } | null>(null);
    const [uploadSummary, setUploadSummary] = useState<{ matched: number; skipped: number } | null>(null);

    // --- Dynamic State ---
    const [rules, setRules] = useState<{ field: string; operator: string; value: string; logicGate: 'AND' | 'OR' }[]>([
        { field: 'customerType', operator: 'equals', value: '', logicGate: 'AND' }
    ]);

    const [isFetching, setIsFetching] = useState(false);

    // Initial load/reset
    useEffect(() => {
        if (isOpen) {
            if (groupToEdit) {
                // If we have minimal info, show it while fetching details
                setGroupName(groupToEdit.name);
                setGroupType(groupToEdit.type);
                
                const fetchGroupDetails = async () => {
                    setIsSaving(true);
                    try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace?.id}/groups/${groupToEdit.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setGroupName(data.name);
                            setGroupType(data.type);
                            if (data.type === 'static') {
                                setSelectedContactIds(new Set(data.customerIds || []));
                                if (data.customers) {
                                    setContacts(prev => {
                                        const combined = [...data.customers, ...prev];
                                        const seen = new Set();
                                        return combined.filter(c => {
                                            if (!c || seen.has(c.id)) return false;
                                            seen.add(c.id);
                                            return true;
                                        });
                                    });
                                }
                            } else {
                                setRules(data.rules || [{ field: 'customerType', operator: 'equals', value: '', logicGate: 'AND' }]);
                            }
                        }
                    } catch (err) {
                        console.error("Failed to fetch group details", err);
                    } finally {
                        setIsSaving(false);
                    }
                };
                fetchGroupDetails();
            } else {
                setGroupName('');
                setGroupType('static');
                setSelectedContactIds(new Set());
                setRules([{ field: 'customerType', operator: 'equals', value: '', logicGate: 'AND' }]);
            }
        }
    }, [isOpen, groupToEdit, selectedWorkspace, token]);

    // Fetch contacts for static selection
    useEffect(() => {
        if (!isOpen || !token || groupType !== 'static') return;
        
        const fetchContacts = async () => {
            setIsFetching(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/customers?limit=50&search=${encodeURIComponent(searchQuery)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const payload = await res.json();
                    setContacts(payload.data || []);
                }
            } catch (err) {
                console.error("Failed to load contacts for modal", err);
            } finally {
                setIsFetching(false);
            }
        };

        const timeoutId = setTimeout(fetchContacts, 300);
        return () => clearTimeout(timeoutId);
    }, [isOpen, token, groupType, searchQuery]);

    if (!isOpen) return null;

    const filteredContacts = [...contacts].sort((a, b) => {
        const aSel = selectedContactIds.has(a.id);
        const bSel = selectedContactIds.has(b.id);
        if (aSel && !bSel) return -1;
        if (!aSel && bSel) return 1;
        return 0;
    });

    const toggleContact = (id: string) => {
        const next = new Set(selectedContactIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedContactIds(next);
    };

    const toggleAllContacts = () => {
        if (selectedContactIds.size === filteredContacts.length) {
            setSelectedContactIds(new Set());
        } else {
            setSelectedContactIds(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const addRule = () => {
        setRules([...rules, { field: 'customerType', operator: 'equals', value: '', logicGate: 'AND' }]);
    };

    const updateRule = (index: number, key: string, value: string) => {
        const newRules = [...rules];
        newRules[index] = { ...newRules[index], [key]: value };
        setRules(newRules);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);
        setUploadSummary(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const dataRaw = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(dataRaw, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet) as any[];

                if (rows.length === 0) {
                    setUploadError({ title: "File is empty", message: "We couldn't find any data rows." });
                    return;
                }

                const allHeaders = Object.keys(rows[0]);
                const identifierKey = allHeaders.find(h => 
                    ['phone', 'mobile', 'email', 'identifier', 'mobilephone'].includes(h.toLowerCase())
                );

                if (!identifierKey) {
                    setUploadError({
                        title: "Missing ID Column",
                        message: "Column header like 'Phone' or 'Email' is required for matching.",
                        details: ["Phone", "Email", "Mobile", "Identifier"]
                    });
                    return;
                }

                const processedRows = rows.map(r => {
                    const { [identifierKey]: id, ...rest } = r;
                    return { identifier: String(id), data: rest };
                });

                setContextualData(processedRows);
                
                // Resolve identifiers to actual contacts
                const identifiers = processedRows.map(r => r.identifier);
                const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/customers/find-by-identifiers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ identifiers })
                });

                if (res.ok) {
                    const matchedContacts: Customer[] = await res.json();
                    
                    // Merge into current contacts list
                    setContacts(prev => {
                        const combined = [...matchedContacts, ...prev];
                        const seen = new Set();
                        return combined.filter(c => {
                            if (!c || seen.has(c.id)) return false;
                            seen.add(c.id);
                            return true;
                        });
                    });

                    // Automatically select them
                    setSelectedContactIds(prev => {
                        const next = new Set(prev);
                        matchedContacts.forEach(c => next.add(c.id));
                        return next;
                    });

                    setUploadSummary({ 
                        matched: matchedContacts.length, 
                        skipped: processedRows.length - matchedContacts.length 
                    });
                } else {
                    setUploadSummary({ matched: 0, skipped: processedRows.length });
                }

            } catch (err) {
                setUploadError({ title: "Read Error", message: "Failed to parse the file." });
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const removeContext = () => {
        setContextualData([]);
        setUploadSummary(null);
        setUploadError(null);
    };

    const removeRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!groupName.trim()) {
            setError('Group name is required');
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                name: groupName,
                type: groupType,
            };

            if (groupType === 'static') {
                payload.customerIds = Array.from(selectedContactIds);
                if (contextualData.length > 0) {
                    payload.contextualData = contextualData;
                }
            } else {
                // Remove empty rules
                payload.rules = rules.filter(r => r.field && r.value.trim() !== '');
                if (payload.rules.length === 0) {
                    setError('At least one valid rule is required for dynamic groups.');
                    setIsSaving(false);
                    return;
                }
            }

            const method = groupToEdit ? 'PATCH' : 'POST';
            const url = groupToEdit 
                ? `${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace?.id}/groups/${groupToEdit.id}`
                : `${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace?.id}/groups`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create group');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-surface-dark w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-full overflow-hidden animate-[zoomIn_0.2s_ease-out] border border-slate-200 dark:border-border-dark">
                {/* Header Section */}
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-background-dark/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{groupToEdit ? 'Edit Group' : 'Create Group'}</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{groupToEdit ? 'Update your segment' : 'Segment your audience'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 sm:p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8 overflow-y-auto w-full flex-1">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 text-red-600 text-sm font-bold flex flex-col sm:flex-row items-center gap-3">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    <form id="createGroupForm" onSubmit={handleSubmit} className="space-y-8 select-none">

                        {/* Group Type Toggle */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Segmentation Strategy</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setGroupType('static')}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${groupType === 'static' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center gap-4 mb-2 relative z-10">
                                        <div className={`p-2 rounded-xl transition-colors ${groupType === 'static' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-background-dark text-slate-400 group-hover:text-primary'}`}>
                                            <span className="material-symbols-outlined">checklist</span>
                                        </div>
                                        <div>
                                            <h3 className={`font-black tracking-tight ${groupType === 'static' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Static List</h3>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium pl-[3.25rem] leading-relaxed relative z-10">
                                        Hand-pick specific contacts to form a fixed group.
                                    </p>
                                    {groupType === 'static' && <div className="absolute -right-6 -bottom-6 size-24 bg-primary/10 rounded-full blur-xl z-0"></div>}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setGroupType('dynamic')}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${groupType === 'dynamic' ? 'border-orange-500 bg-orange-500/5 shadow-md shadow-orange-500/10' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark hover:border-orange-500/50'}`}
                                >
                                    <div className="flex items-center gap-4 mb-2 relative z-10">
                                        <div className={`p-2 rounded-xl transition-colors ${groupType === 'dynamic' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-background-dark text-slate-400 group-hover:text-orange-500'}`}>
                                            <span className="material-symbols-outlined">bolt</span>
                                        </div>
                                        <div>
                                            <h3 className={`font-black tracking-tight ${groupType === 'dynamic' ? 'text-orange-600' : 'text-slate-900 dark:text-white'}`}>Dynamic Rules</h3>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium pl-[3.25rem] leading-relaxed relative z-10">
                                        Auto-populate group based on contact attributes and rules.
                                    </p>
                                    {groupType === 'dynamic' && <div className="absolute -right-6 -bottom-6 size-24 bg-orange-500/10 rounded-full blur-xl z-0"></div>}
                                </button>
                            </div>
                        </div>

                        {/* Group Name input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Group Name <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-5 py-3.5 text-sm text-slate-900 dark:text-white font-bold italic outline-none focus:ring-1 focus:ring-primary shadow-inner"
                                placeholder="e.g. Active High-Value VIPs"
                            />
                        </div>

                        {/* Static Builder UI */}
                        {groupType === 'static' && (
                            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Audience ({selectedContactIds.size} Selected)</label>
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                                    <div className="relative flex-1 w-full group">
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary ${isFetching ? 'animate-spin' : ''}`}>
                                            {isFetching ? 'autorenew' : 'search'}
                                        </span>
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark text-xs font-bold italic outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Search global directory..."
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleAllContacts}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all flex items-center gap-2 shrink-0 bg-white dark:bg-surface-dark"
                                    >
                                        <span className={`material-symbols-outlined text-[16px] ${selectedContactIds.size === filteredContacts.length && filteredContacts.length > 0 ? 'text-primary fill' : ''}`}>
                                            {selectedContactIds.size === filteredContacts.length && filteredContacts.length > 0 ? 'check_circle' : 'circle'}
                                        </span>
                                        Select ALL Context
                                    </button>
                                </div>

                                <div className="space-y-4">
                                {contextualData.length === 0 ? (
                                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="flex gap-4 items-center">
                                            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">upload_file</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black dark:text-white uppercase tracking-tight italic">Populate via Contextual CSV</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Auto-matches contacts & saves variable data</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input type="file" onChange={handleFileUpload} accept=".csv,.xlsx,.xls" className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <button type="button" className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">{isUploading ? 'sync' : 'upload_file'}</span>
                                                {isUploading ? 'Magic...' : 'Upload List'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-[slideInUp_0.3s_ease-out]">
                                        <div className="flex gap-4 items-center">
                                            <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                <span className="material-symbols-outlined font-black">check_circle</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-tight italic">CSV Data Processed</h4>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-500 font-bold uppercase tracking-widest">
                                                       <span className="text-emerald-600 dark:text-emerald-400 font-black">{uploadSummary?.matched || 0}</span> Matched
                                                    </p>
                                                    {uploadSummary && uploadSummary.skipped > 0 && (
                                                        <>
                                                            <div className="size-1 bg-emerald-300/50 rounded-full"></div>
                                                            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest">
                                                                <span className="font-black">{uploadSummary.skipped}</span> Not in System
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" onClick={removeContext} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 underline underline-offset-4">Remove File</button>
                                    </div>
                                )}

                                {uploadSummary && uploadSummary.skipped > 0 && (
                                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 flex gap-3 animate-[fadeIn_0.3s_ease-out]">
                                        <span className="material-symbols-outlined text-orange-500 text-sm">lightbulb</span>
                                        <p className="text-[10px] text-orange-800 dark:text-orange-300 font-medium leading-relaxed italic">
                                            <strong>Note:</strong> {uploadSummary.skipped} contacts from your file aren't in the global directory. Only the {uploadSummary.matched} matched contacts will be added to this list.
                                        </p>
                                    </div>
                                )}

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
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </div>

                                <div className="bg-white dark:bg-[#0c1016] border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-border-dark">
                                    {isFetching && contacts.length === 0 ? (
                                        <div className="p-12 text-center text-[10px] font-black text-slate-400 uppercase italic flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined animate-spin text-primary">autorenew</span>
                                            Loading Directory...
                                        </div>
                                    ) : (
                                        <>
                                            {filteredContacts.map(contact => (
                                                <div
                                                    key={contact.id}
                                                    onClick={() => toggleContact(contact.id)}
                                                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${selectedContactIds.has(contact.id) ? 'bg-primary/5' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-4 rounded border flex items-center justify-center transition-all ${selectedContactIds.has(contact.id) ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                                                            {selectedContactIds.has(contact.id) && <span className="material-symbols-outlined text-white text-[12px] font-black">check</span>}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900 dark:text-white italic leading-tight">{contact.fullName || 'No Name'}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{contact.customerType || 'Contact'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-slate-400 font-mono">{contact.email}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">{contact.mobilePhone}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {filteredContacts.length === 0 && !isFetching && (
                                                <div className="p-12 text-center text-[10px] font-black text-slate-400 uppercase italic">No contacts match filter</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Dynamic Builder UI */}
                        {groupType === 'dynamic' && (
                            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Segment Criteria</label>
                                    <button type="button" onClick={addRule} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ Add New Rule</button>
                                </div>
                                <div className="space-y-2">
                                    {rules.map((rule, idx) => (
                                        <div key={idx} className="flex flex-col gap-2">
                                            {idx > 0 && (
                                                <div className="flex items-center gap-2 ml-4">
                                                    <div className="w-4 h-px bg-slate-200 dark:bg-border-dark"></div>
                                                    <select
                                                        value={rule.logicGate}
                                                        onChange={(e) => updateRule(idx, 'logicGate', e.target.value)}
                                                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border outline-none cursor-pointer ${rule.logicGate === 'OR' ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-900/50 dark:text-orange-400' : 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400'}`}
                                                    >
                                                        <option value="AND">AND (Must match all)</option>
                                                        <option value="OR">OR (Can match any)</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-inner group transition-all">
                                                <select
                                                    value={rule.field}
                                                    onChange={(e) => updateRule(idx, 'field', e.target.value)}
                                                    className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg text-xs font-black uppercase text-slate-900 dark:text-white cursor-pointer outline-none focus:border-primary shrink-0"
                                                >
                                                    <option value="customerType">Contact Type</option>
                                                    <option value="fullName">Full Name</option>
                                                    <option value="email">Email</option>
                                                    <option value="mobilePhone">Phone Number</option>
                                                    <option value="dob">Date of Birth</option>
                                                    <option value="gender">Gender</option>
                                                    <option value="nationality">Nationality</option>
                                                    <option value="stateOfOrigin">State of Origin</option>
                                                    <option value="residentialState">Residential State</option>
                                                    <option value="residentialTown">Residential Town</option>
                                                    <option value="occupation">Occupation</option>
                                                    <option value="sector">Sector</option>
                                                    <option value="officeAddress">Office Address</option>
                                                    <option value="isPep">Is PEP</option>
                                                    <option value="idIssueDate">ID Issue Date</option>
                                                    <option value="idExpiryDate">ID Expiry Date</option>
                                                </select>
    
                                                <select
                                                    value={rule.operator}
                                                    onChange={(e) => updateRule(idx, 'operator', e.target.value)}
                                                    className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg text-xs font-bold text-primary cursor-pointer outline-none focus:border-primary shrink-0"
                                                >
                                                    <option value="equals">is exactly</option>
                                                    <option value="contains">contains</option>
                                                    <option value="starts_with">starts with</option>
                                                    <option value="not_equals">is not</option>
                                                </select>
    
                                                <input
                                                    value={rule.value}
                                                    onChange={(e) => updateRule(idx, 'value', e.target.value)}
                                                    className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg text-sm font-black text-slate-900 dark:text-white flex-1 min-w-[120px] outline-none focus:border-primary"
                                                    placeholder="Value..."
                                                />
    
                                                <button
                                                    type="button"
                                                    onClick={() => removeRule(idx)}
                                                    disabled={rules.length === 1}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900 flex gap-3">
                                    <span className="material-symbols-outlined text-orange-500">info</span>
                                    <p className="text-xs text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
                                        When a campaign selects this group, it will automatically query the database and send to anyone matching all these rules at the time of sending.
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Section */}
                <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 flex justify-end gap-4 shrink-0 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="createGroupForm"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-blue-600 hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                Saving...
                            </>
                        ) : 'Save Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;

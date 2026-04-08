import React, { useState, useEffect } from 'react';
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

    const filteredContacts = contacts; // server-side filtering is now used

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
                                                    <option value="gender">Gender</option>
                                                    <option value="occupation">Occupation</option>
                                                    <option value="stateOfOrigin">State</option>
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

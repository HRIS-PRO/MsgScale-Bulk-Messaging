import React, { useState, useEffect } from 'react';
import { useRole } from '../RoleContext';

interface ContactGroup {
    id: string;
    name: string;
    type: 'static' | 'dynamic';
    estimatedCount: number;
}

interface AddToGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerIds: string[];
    onSuccess: (addedCount: number) => void;
}

const AddToGroupModal: React.FC<AddToGroupModalProps> = ({ isOpen, onClose, customerIds, onSuccess }) => {
    const { token, selectedWorkspace } = useRole();
    const [groups, setGroups] = useState<ContactGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !selectedWorkspace?.id || !token) return;

        const fetchGroups = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}/groups`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Only allow adding to static groups
                    setGroups(data.filter((g: any) => g.type === 'static'));
                }
            } catch (err) {
                console.error("Failed to fetch groups", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, [isOpen, selectedWorkspace?.id, token]);

    if (!isOpen) return null;

    const handleAdd = async () => {
        if (!selectedGroupId) {
            setError('Please select a group');
            return;
        }

        setIsSaving(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace?.id}/groups/${selectedGroupId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ customerIds })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to add members');
            }

            const result = await res.json();
            onSuccess(result.added);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-2xl animate-[zoomIn_0.2s_ease-out] overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-border-dark flex items-center justify-between bg-slate-50 dark:bg-[#111722]/50">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight uppercase">Add to Group</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{customerIds.length} Contacts Selected</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-background-dark hover:text-slate-600 dark:hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Target Group</label>
                        {isLoading ? (
                            <div className="h-12 w-full bg-slate-100 dark:bg-background-dark animate-pulse rounded-xl"></div>
                        ) : groups.length === 0 ? (
                            <div className="p-4 bg-slate-50 dark:bg-background-dark rounded-xl border border-dashed border-slate-200 text-center">
                                <p className="text-xs text-slate-500 font-bold uppercase">No static groups found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                                {groups.map(group => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedGroupId(group.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${selectedGroupId === group.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-slate-100 dark:border-border-dark hover:border-slate-200 bg-white dark:bg-background-dark'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedGroupId === group.id ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-surface-dark text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black italic tracking-tight ${selectedGroupId === group.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                                    {group.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                    {group.estimatedCount} Contacts
                                                </p>
                                            </div>
                                        </div>
                                        {selectedGroupId === group.id && (
                                            <span className="material-symbols-outlined text-primary">check_circle</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-5 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-[#111722]/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={isSaving || !selectedGroupId}
                        className="px-8 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:hover:bg-primary"
                    >
                        {isSaving ? 'Adding...' : 'Add to Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToGroupModal;

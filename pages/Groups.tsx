import React, { useState, useEffect } from 'react';
import { useRole } from '../RoleContext';
import CreateGroupModal from '../components/CreateGroupModal';

interface ContactGroup {
    id: string;
    name: string;
    type: 'static' | 'dynamic';
    estimatedCount: number;
    createdAt: string;
}

const Groups: React.FC = () => {
    const { token, selectedWorkspace } = useRole();
    const [groups, setGroups] = useState<ContactGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchGroups = async () => {
        if (!selectedWorkspace?.id || !token) return;
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}/groups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch groups');
            const data = await res.json();
            setGroups(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [selectedWorkspace, token]);

    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-background-dark animate-[fadeIn_0.3s_ease-out]">
            {/* Header */}
            <header className="px-4 md:px-8 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark sticky top-0 z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 max-w-7xl mx-auto">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-3xl md:text-4xl text-blue-600">groups</span>
                            Audience Groups
                        </h1>
                        <p className="text-[12px] md:text-sm font-bold text-slate-500 italic">Manage static lists and dynamic targeting rules.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 hover:-translate-y-0.5 transition-all text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Create Group
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
                    {/* Search Bar */}
                    <div className="relative group max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search groups by name..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredGroups.length === 0 ? (
                                <div className="col-span-full py-20 text-center space-y-4">
                                    <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                                        <span className="material-symbols-outlined text-4xl">folder_off</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">No groups found.</p>
                                </div>
                            ) : (
                                filteredGroups.map(group => (
                                    <div key={group.id} className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col justify-between h-[200px]">
                                        <div className="flex justify-between items-start">
                                            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                                <span className="material-symbols-outlined">
                                                    {group.type === 'static' ? 'list_alt' : 'bolt'}
                                                </span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${group.type === 'static' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800'}`}>
                                                {group.type}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate" title={group.name}>{group.name}</h3>
                                            <p className="text-xs text-slate-500 font-bold mt-1">
                                                {new Date(group.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Estimated Reach</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                    {group.estimatedCount.toLocaleString()} <span className="text-xs text-slate-400 font-normal tracking-normal uppercase">contacts</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>

            {isCreateModalOpen && (
                <CreateGroupModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        fetchGroups();
                    }}
                />
            )}
        </div>
    );
};

export default Groups;

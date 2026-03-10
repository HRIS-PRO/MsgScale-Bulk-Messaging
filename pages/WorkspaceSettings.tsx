import React, { useState, useRef } from 'react';
import { useRole } from '../RoleContext';

const WorkspaceSettings = () => {
    const { selectedWorkspace, role, token, selectWorkspace } = useRole();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null | undefined>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync logo preview from selected workspace on mount/workspace change
    React.useEffect(() => {
        if (selectedWorkspace) {
            setLogoPreview((selectedWorkspace as any).logo_url || (selectedWorkspace as any).logoUrl || null);
        }
    }, [selectedWorkspace?.id]);

    const canEditSettings = ['Admin', 'Manager', 'Editor'].includes(role || '');

    if (!canEditSettings) {
        return (
            <div className="p-8 flex justify-center py-20">
                <div className="text-center space-y-4 max-w-md">
                    <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
                    <h2 className="text-2xl font-black text-white">Access Denied</h2>
                    <p className="text-slate-400">You do not have permission to view workspace settings. Please contact your administrator.</p>
                </div>
            </div>
        );
    }

    if (!selectedWorkspace) {
        return <div className="p-8 text-white">Please select a workspace first.</div>;
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setIsUpdating(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`/api/workspaces/${selectedWorkspace.id}/logo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to upload logo');
            }

            const updatedWorkspace = await response.json();
            // Update context so Logo persists in workspace state and header
            selectWorkspace(updatedWorkspace);
            // Update local preview immediately
            setLogoPreview(updatedWorkspace.logo_url || updatedWorkspace.logoUrl);
            alert('Logo updated successfully!');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsUpdating(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteWorkspace = async () => {
        if (!token) return;
        if (deleteConfirmName !== selectedWorkspace.title) {
            alert('Workspace name does not match');
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/workspaces/${selectedWorkspace.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete workspace');
            }

            // Successfully deleted. We need to clear selected workspace and redirect to selection
            window.location.href = '/auth/workspaces';
        } catch (error: any) {
            alert(error.message);
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10 animate-[fadeIn_0.3s_ease-out]">
            <div>
                <h1 className="text-3xl font-black text-white italic tracking-tight">Workspace Settings</h1>
                <p className="text-slate-400 mt-2">Manage settings and preferences for {selectedWorkspace.title}</p>
            </div>

            <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 space-y-8 shadow-sm">
                <div>
                    <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest border-b border-border-dark pb-4">General Configuration</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspace ID</label>
                            <div className="flex items-center gap-3">
                                <code className="bg-slate-900 px-4 py-2.5 rounded-xl border border-border-dark text-slate-300 text-sm flex-1 font-mono">
                                    {selectedWorkspace.id}
                                </code>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(selectedWorkspace.id); alert('Copied!') }}
                                    className="p-2.5 border border-border-dark rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">Used for API integration and support requests.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspace Name</label>
                            <input
                                type="text"
                                value={selectedWorkspace.title}
                                disabled
                                className="w-full bg-slate-900/50 px-4 py-2.5 rounded-xl border border-border-dark text-white text-sm opacity-70 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border-dark/50">
                    <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Workspace Logo</h3>
                    <div className="flex items-center gap-8">
                        <div className="relative group">
                            <div className="size-24 rounded-2xl bg-slate-900 border-2 border-dashed border-border-dark flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Workspace Logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-slate-600 group-hover:text-primary transition-colors">image</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleLogoUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdating}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-primary border border-border-dark hover:border-primary text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                            >
                                {isUpdating ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span> : <span className="material-symbols-outlined text-[16px]">upload</span>}
                                {isUpdating ? 'Uploading...' : 'Upload Logo'}
                            </button>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Recommended: 512x512px. PNG, JPG or WEBP. Max 5MB.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 space-y-6">
                <div>
                    <h3 className="text-lg font-black text-red-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined">warning</span> Danger Zone
                    </h3>
                    <p className="text-slate-400 text-sm font-medium">
                        Permanently delete this workspace and all of its associated data, campaigns, and contacts. This action cannot be undone.
                    </p>
                </div>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500 border border-red-500 text-red-500 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                    Delete Workspace
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-surface-dark border border-red-500/30 w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 ring-1 ring-red-500/50">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">warning</span> Delete Workspace
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">
                                    This action is completely irreversible.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 font-mono">
                            Please type <strong className="text-white bg-slate-800 px-1 rounded">{selectedWorkspace.title}</strong> to confirm.
                        </div>

                        <input
                            type="text"
                            value={deleteConfirmName}
                            onChange={(e) => setDeleteConfirmName(e.target.value)}
                            className="w-full bg-slate-900 border border-red-500/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="Type workspace name here"
                            autoFocus
                        />

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 rounded-xl border border-border-dark text-slate-400 font-bold hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteWorkspace}
                                disabled={isDeleting || deleteConfirmName !== selectedWorkspace.title}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-500/20 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                                )}
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceSettings;

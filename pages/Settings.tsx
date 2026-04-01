
import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useRole } from '../RoleContext';

/**
 * SETTINGS COMPONENT
 * 
 * BACKEND INTEGRATION NOTES:
 * 1. GET /api/workspace - Fetch general workspace info.
 * 2. GET /api/workspace/members - Fetch team members list.
 * 3. POST /api/workspace/invite - Send new user invitations.
 * 4. GET /api/integrations - Fetch current API provider settings.
 * 5. POST /api/integrations - Update integration credentials.
 * 6. GET /api/billing/plan - Fetch current subscription details.
 */

// --- SUB-COMPONENTS ---

const GeneralSettings = () => {
  const { selectedWorkspace, user, token, selectWorkspace } = useRole();
  const [title, setTitle] = useState(selectedWorkspace?.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedWorkspace) {
      setTitle(selectedWorkspace.title);
      setLogoPreview((selectedWorkspace as any).logo_url || (selectedWorkspace as any).logoUrl || null);
    }
  }, [selectedWorkspace?.id]);

  if (!selectedWorkspace) return null;

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const updated = await res.json();
      selectWorkspace(updated);
      alert('Workspace name updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}/logo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const updated = await res.json();
      selectWorkspace(updated);
      setLogoPreview(updated.logo_url || updated.logoUrl);
      alert('Logo updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: null }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const updated = await res.json();
      selectWorkspace(updated);
      setLogoPreview(null);
    } catch (err: any) {
      alert(err.message || 'Failed to remove logo');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!token || deleteConfirmName.trim().toLowerCase() !== selectedWorkspace.title.trim().toLowerCase()) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      window.location.href = '/#/auth/workspaces';
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">General Workspace</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Update your workspace details and branding.</p>
      </div>

      <form className="space-y-8" onSubmit={handleSaveTitle}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Workspace Name</label>
            <input
              className="w-full bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all font-bold italic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Workspace ID</label>
            <div className="flex gap-3">
              <input
                className="flex-1 bg-slate-100 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed font-mono text-sm"
                disabled
                value={selectedWorkspace.id}
              />
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(selectedWorkspace.id); }}
                className="p-3 text-slate-400 hover:text-primary transition-colors"
                title="Copy ID"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Workspace Logo</label>
            <div className="flex items-center gap-6 p-6 rounded-2xl border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-[#111722]/50">
              <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shrink-0 overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Workspace Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-primary text-4xl">hub</span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogoUpload}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-5 py-2 bg-white dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-xl text-[10px] font-black tracking-widest text-slate-700 dark:text-white hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                  >
                    {isUploading ? <span className="material-symbols-outlined animate-spin text-[14px]">refresh</span> : null}
                    {isUploading ? 'UPLOADING...' : 'UPLOAD NEW'}
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-5 py-2 text-[10px] font-black tracking-widest text-red-500 hover:text-red-400 transition-colors uppercase"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase opacity-60">Recommended size 512x512px. Max file size 5MB. WebP compressed automatically.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-border-dark flex justify-end gap-3">
          <button
            type="button"
            onClick={() => { setTitle(selectedWorkspace.title); }}
            className="px-8 py-3 rounded-xl text-slate-500 font-black tracking-widest text-xs uppercase hover:text-slate-900 dark:hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || title.trim() === selectedWorkspace.title}
            className="px-10 py-3 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span> : null}
            SAVE CHANGES
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 bg-red-500/5 border border-red-500/10 rounded-2xl p-8 space-y-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">warning</span>
          <h4 className="text-red-500 font-black uppercase text-xs tracking-widest">Danger Zone</h4>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Deleting this workspace is permanent and will wipe all associated campaign data, contacts, and custom attributes.</p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Delete Workspace
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-red-500/30 w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 ring-1 ring-red-500/20 animate-[zoomIn_0.2s_ease-out]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">warning</span> Delete Workspace
                </h2>
                <p className="text-slate-500 text-sm font-medium">This action is completely irreversible.</p>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmName(''); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
              Type <strong className="text-slate-900 dark:text-white">{selectedWorkspace.title}</strong> to confirm.
            </div>
            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-red-500/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Type workspace name here"
              autoFocus
            />
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmName(''); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-border-dark text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWorkspace}
                disabled={isDeleting || deleteConfirmName.trim().toLowerCase() !== selectedWorkspace.title.trim().toLowerCase()}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-500/20 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span> : <span className="material-symbols-outlined text-[16px]">delete_forever</span>}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const TeamManagement = () => {
  const { selectedWorkspace, token, user } = useRole();
  const [members, setMembers] = useState<any[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);

  const fetchMembers = async () => {
    if (!token || !selectedWorkspace) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMembers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchEligibleUsers = async () => {
    if (!token || !selectedWorkspace) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}/eligible-users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setEligibleUsers(await res.json());
    } catch (err) { console.error(err); }
    finally { setIsRefreshing(false); }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedWorkspace?.id, token]);

  const handleInviteAll = async () => {
    if (!token || !selectedWorkspace || selectedUserIds.length === 0) return;
    setIsInviting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}/members/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds: selectedUserIds })
      });
      if (res.ok) {
        alert('Users invited successfully!');
        setSelectedUserIds([]);
        setShowInviteDropdown(false);
        fetchMembers();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to invite users');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsInviting(false);
    }
  };

  const filteredEligible = eligibleUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleRemoveMember = async (userId: string) => {
    if (!token || !selectedWorkspace) return;
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace.id}/members/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.user.id !== userId));
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to remove member');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Team Members</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage members who have access to this workspace.</p>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              if (!showInviteDropdown) fetchEligibleUsers();
              setShowInviteDropdown(!showInviteDropdown);
            }}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Invite Members
          </button>

          {showInviteDropdown && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl z-100 overflow-hidden animate-[zoomIn_0.15s_ease-out] flex flex-col max-h-[500px]">
              <div className="p-4 border-b border-slate-100 dark:border-border-dark space-y-3 bg-white dark:bg-surface-dark z-10">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-sm group-focus-within:text-primary transition-colors">search</span>
                  <input
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Search HRIS users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-0">
                {isRefreshing ? (
                  <div className="p-12 text-center flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finding users...</p>
                  </div>
                ) : filteredEligible.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center gap-2 opacity-50">
                    <span className="material-symbols-outlined text-3xl text-slate-300">person_off</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No eligible users</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredEligible.map(u => (
                      <div
                        key={u.id}
                        onClick={() => toggleUserSelection(u.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border ${selectedUserIds.includes(u.id) ? 'bg-primary/5 border-primary/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'}`}
                      >
                        <div className={`size-5 rounded border ${selectedUserIds.includes(u.id) ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center transition-all`}>
                          {selectedUserIds.includes(u.id) && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none truncate">{u.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 truncate">{u.email}</p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest shrink-0">{u.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 flex items-center justify-between gap-3 sticky bottom-0 z-10">
                <div className="flex items-center gap-2">
                  <span className={`size-1.5 rounded-full ${selectedUserIds.length > 0 ? 'bg-primary animate-pulse' : 'bg-slate-300'}`}></span>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedUserIds.length} SELECTED</p>
                </div>
                <button
                  disabled={selectedUserIds.length === 0 || isInviting}
                  onClick={handleInviteAll}
                  className="px-5 py-2.5 bg-primary text-white text-[10px] font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
                >
                  {isInviting ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span> : <span className="material-symbols-outlined text-[16px]">send</span>}
                  Add Members
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-background-dark/30 border-b border-slate-100 dark:border-border-dark">
              <tr>
                <th className="px-10 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Member</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">App Access</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Joined Date</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-slate-400 text-xs font-bold uppercase italic tracking-widest">No members found in this workspace</td>
                </tr>
              ) : (
                members.map((m, i) => {
                  if (!m.user) return null;
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm shadow-inner">
                            {m.user?.employee ? (m.user.employee.firstName[0] + m.user.employee.surname[0]) : m.user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white italic flex items-center gap-2">
                              {m.user?.employee ? `${m.user.employee.firstName} ${m.user.employee.surname}` : m.user.email}
                              {m.user.id === (selectedWorkspace as any).ownerId && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[8px] font-black uppercase tracking-widest">Owner</span>}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-tight">{m.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {m.user.roles?.filter((r: any) => r.app === 'MSGSCALE_BULK').map((r: any, ri: number) => (
                            <span key={ri} className="px-2 py-1 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-300 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">{r.role}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 font-mono italic">{new Date(m.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </td>
                      <td className="px-10 py-5 text-right">
                        {m.user.id !== (selectedWorkspace as any).ownerId && m.user.id !== user?.id ? (
                          <button
                            onClick={() => handleRemoveMember(m.user.id)}
                            className="size-10 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            title="Remove Member"
                          >
                            <span className="material-symbols-outlined text-lg">person_remove</span>
                          </button>
                        ) : (
                          <span className="material-symbols-outlined text-slate-200 dark:text-slate-800 pointer-events-none">shield</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// const Integrations = () => {
//   const navigate = useNavigate();
//   const [expanded, setExpanded] = useState<'sms' | 'email' | null>(null);

//   const toggle = (section: 'sms' | 'email') => {
//     setExpanded(expanded === section ? null : section);
//   };

//   return (
//     <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
//       <div className="space-y-2">
//         <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Integrations</h2>
//         <p className="text-slate-500 dark:text-slate-400 font-medium">Configure your third-party services for SMS and Email delivery.</p>
//       </div>

//       <div className="space-y-4">
//         {/* SMS Collapsible Section */}
//         <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm transition-all">
//           <button
//             onClick={() => toggle('sms')}
//             className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
//           >
//             <div className="flex items-center gap-5">
//               <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
//                 <span className="material-symbols-outlined text-3xl">sms</span>
//               </div>
//               <div className="text-left">
//                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic leading-none">SMS Configuration</h3>
//                 <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60 tracking-widest mt-1.5">Connect your preferred SMS gateway</p>
//               </div>
//             </div>
//             <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${expanded === 'sms' ? 'rotate-180' : ''}`}>expand_more</span>
//           </button>

//           <div className={`transition-all duration-500 ease-in-out ${expanded === 'sms' ? 'max-h-[500px] opacity-100 border-t border-slate-100 dark:border-border-dark' : 'max-h-0 opacity-0 overflow-hidden'}`}>
//             <div className="p-8 space-y-6 bg-slate-50 dark:bg-background-dark/30">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Provider</label>
//                   <select className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm font-bold italic text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary">
//                     <option>Termii</option>
//                     <option>Twilio</option>
//                     <option>MessageBird</option>
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sender ID</label>
//                   <input className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. MyBrand" />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Key</label>
//                 <input type="password" title="API Key" className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" placeholder="Paste your API key here" />
//               </div>
//               <div className="flex justify-end pt-4">
//                 <button className="px-8 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-600">Update SMS Settings</button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Email Collapsible Section */}
//         <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm transition-all">
//           <button
//             onClick={() => toggle('email')}
//             className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
//           >
//             <div className="flex items-center gap-5">
//               <div className="size-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-500/10">
//                 <span className="material-symbols-outlined text-3xl">mail</span>
//               </div>
//               <div className="text-left">
//                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic leading-none">Email Configuration</h3>
//                 <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60 tracking-widest mt-1.5">Choose between 3rd party providers or SMTP</p>
//               </div>
//             </div>
//             <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${expanded === 'email' ? 'rotate-180' : ''}`}>expand_more</span>
//           </button>

//           <div className={`transition-all duration-500 ease-in-out ${expanded === 'email' ? 'max-h-[600px] opacity-100 border-t border-slate-100 dark:border-border-dark' : 'max-h-0 opacity-0 overflow-hidden'}`}>
//             <div className="p-8 space-y-6 bg-slate-50 dark:bg-background-dark/30">
//               <div className="space-y-4">
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Integration Method</label>
//                 <div className="flex gap-8">
//                   <label className="flex items-center gap-2 cursor-pointer group">
//                     <input type="radio" name="email_method" className="text-primary focus:ring-primary" defaultChecked />
//                     <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors italic uppercase tracking-tighter text-[11px]">3rd Party Provider (API)</span>
//                   </label>
//                   <label className="flex items-center gap-2 cursor-pointer group">
//                     <input type="radio" name="email_method" className="text-primary focus:ring-primary" />
//                     <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors italic uppercase tracking-tighter text-[11px]">SMTP Server</span>
//                   </label>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Provider</label>
//                   <select className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm font-bold italic text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary">
//                     <option>Resend</option>
//                     <option>SendGrid</option>
//                     <option>Mailgun</option>
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">From Name</label>
//                   <input className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" placeholder="Company Support" />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Key</label>
//                 <input type="password" title="Email API Key" className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" defaultValue="re_123456789" />
//               </div>
//               <div className="flex justify-end pt-4">
//                 <button className="px-8 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-blue-600">Update Email Settings</button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Contact Data Integration Link */}
//         <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm transition-all">
//           <button
//             onClick={() => navigate('/contacts/integrations')}
//             className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
//           >
//             <div className="flex items-center gap-5">
//               <div className="size-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 shadow-lg shadow-green-500/5 transition-transform group-hover:scale-110">
//                 <span className="material-symbols-outlined text-3xl">contacts</span>
//               </div>
//               <div className="text-left">
//                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic leading-none">Contact Data Integration</h3>
//                 <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60 tracking-widest mt-1.5">Sync your customer data from external CRMs</p>
//               </div>
//             </div>
//             <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">open_in_new</span>
//           </button>
//         </div>
//       </div>

//       <div className="pt-8 border-t border-slate-100 dark:border-border-dark flex justify-end gap-3">
//         <button type="button" className="px-8 py-3 rounded-xl text-slate-500 font-black tracking-widest text-xs uppercase hover:text-slate-900 dark:hover:text-white transition-all">Cancel</button>
//         <button type="submit" className="px-10 py-3 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all">SAVE ALL CHANGES</button>
//       </div>
//     </div>
//   );
// };

const BillingSettings = () => (
  <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
    <div className="space-y-2 border-b border-slate-100 dark:border-border-dark pb-6">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Billing & Plans</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your subscription, payment methods, and billing history.</p>
    </div>

    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 shadow-lg shadow-green-500/5">
          <span className="material-symbols-outlined">payments</span>
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">Available Plans</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight opacity-60">Scale your communication as you grow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Plan Cards */}
        {[
          {
            name: 'Free Plan', price: '₦0', sub: '/month',
            desc: 'Perfect for getting started.',
            features: ['Up to 2 concurrent workspaces', 'Run up to 2 concurrent campaigns', 'Send to campaign recipients', 'Up to 2 custom contact attributes'],
            btn: 'Current Plan', active: true
          },
          {
            name: 'Premium Plan', price: '₦75,000', sub: '/month',
            desc: 'Scale your operations.',
            features: ['25 workspaces', '50 concurrent campaigns', 'Send to ALL contacts selection', 'Unlimited custom attributes & AI insights', 'Export contacts & AI reporting'],
            btn: 'Upgrade Now', active: false
          },
          {
            name: 'Lifetime Access', price: '₦750,000', sub: '/one-time',
            desc: 'Pay once, use forever.',
            features: ['Everything in Premium', 'Unlimited workspaces', 'Unlimited concurrent campaigns', 'Priority support access', 'Future feature updates'],
            btn: 'Get Lifetime Access', active: false, featured: true
          },
        ].map((plan, i) => (
          <div key={i} className={`relative p-8 rounded-3xl border transition-all flex flex-col h-full ${plan.featured ? 'border-primary border-2 bg-primary/5 shadow-2xl scale-105 z-10' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] shadow-sm hover:shadow-xl'}`}>
            {plan.featured && (
              <div className="absolute -top-3 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Best Value</div>
            )}
            <div className="mb-6">
              <h4 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight mb-1">{plan.name}</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{plan.desc}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-slate-900 dark:text-white italic">{plan.price}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.sub}</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((f, fi) => (
                <li key={fi} className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-[18px] font-black ${plan.featured ? 'text-purple-500' : i === 1 ? 'text-primary' : 'text-green-500'}`}>check_circle</span>
                  <span className={`text-[11px] leading-tight font-bold ${plan.featured ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{f}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${plan.active ? 'bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-400 cursor-not-allowed' : plan.featured ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/30 hover:scale-[1.02]' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-blue-600 hover:scale-[1.02]'}`}>
              {plan.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const NotificationsSettings = () => (
  <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
    <div className="space-y-2">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Notifications</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Control when and how you get notified about your campaigns.</p>
    </div>

    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 space-y-6 shadow-sm">
      {[
        { title: 'Email Notifications', desc: 'Summary of campaign results via email.' },
        { title: 'Browser Alerts', desc: 'Push notifications for delivery failures.' },
        { title: 'Billing Alerts', desc: 'Receive invoices and low-balance warnings.' },
      ].map((n, i) => (
        <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 dark:border-white/5">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{n.title}</h4>
            <p className="text-xs text-slate-500 font-medium">{n.desc}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer group">
            <input type="checkbox" className="sr-only peer" defaultChecked={i !== 1} />
            <div className="w-11 h-6 bg-slate-200 dark:bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
          </label>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN SETTINGS PAGE ---

const Settings = () => {
  const { role, user, selectedWorkspace } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const isOwner = !!(user && selectedWorkspace && (selectedWorkspace as any).ownerId === user.id);
  const canManage = role === 'Admin' || isOwner;

  const navGroups = [
    {
      title: 'Workspace Settings',
      items: [
        { label: 'General', path: '/settings', icon: 'tune', show: isOwner },
        { label: 'Team Management', path: '/settings/team', icon: 'manage_accounts', show: canManage },
      ].filter(item => item.show)
    }
  ].filter(group => group.items.length > 0);

  const isActive = (path: string) => {
    if (path === '/settings') return location.pathname === '/settings';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-32">
      {/* Sidebar Nav */}
      <nav className="w-full lg:w-64 space-y-8 shrink-0">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 opacity-70">{group.title}</h3>
            <div className="space-y-1.5">
              {group.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive(item.path) ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111722]'}`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive(item.path) ? 'fill' : ''}`}>{item.icon}</span>
                  <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Content Area */}
      <div className="flex-1 bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-border-dark p-8 md:p-12 shadow-2xl relative theme-transition">
        {/* Subtle background flair - contained with absolute wrapper to avoid bleed if needed, but flair is subtle enough */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        </div>

        <div className="relative z-10">
          <Routes>
            {isOwner ? (
              <>
                <Route index element={<GeneralSettings />} />
                <Route path="team" element={<TeamManagement />} />
                {/* <Route path="integrations" element={<Integrations />} /> */}
                {/* <Route path="billing" element={<BillingSettings />} /> */}
                {/* <Route path="notifications" element={<NotificationsSettings />} /> */}
              </>
            ) : canManage ? (
              <>
                <Route index element={<Navigate to="/settings/team" replace />} />
                <Route path="team" element={<TeamManagement />} />
                {/* <Route path="integrations" element={<Integrations />} /> */}
                {/* <Route path="billing" element={<BillingSettings />} /> */}
                {/* <Route path="notifications" element={<NotificationsSettings />} /> */}
              </>
            ) : (
              <>
                <Route index element={<Navigate to="/settings/notifications" replace />} />
                <Route path="notifications" element={<NotificationsSettings />} />
                <Route path="*" element={<Navigate to="/settings/notifications" replace />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Settings;

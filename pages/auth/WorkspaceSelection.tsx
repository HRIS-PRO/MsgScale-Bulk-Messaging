
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../RoleContext';

const WorkspaceSelection = ({ onSelect }: { onSelect: () => void }) => {
  const navigate = useNavigate();
  const { user, token, role, selectWorkspace } = useRole();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const canCreateWorkspace = ['Admin', 'Manager', 'Editor'].includes(role || '');

  const fetchWorkspaces = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/workspaces', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch workspaces');
      const data = await response.json();
      setWorkspaces(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceTitle.trim() || !token) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newWorkspaceTitle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create workspace');
      }

      setNewWorkspaceTitle('');
      setIsModalOpen(false);
      await fetchWorkspaces();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelect = (ws: any) => {
    selectWorkspace(ws);
    onSelect();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background-dark p-10 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-10">
        <div className="flex justify-between items-end border-b border-border-dark pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tight">Welcome back, {user?.employee?.firstName}</h1>
            <p className="text-text-secondary text-lg">Choose an organization to manage your campaigns</p>
          </div>
          {canCreateWorkspace && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-primary/30 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                CREATE NEW WORKSPACE
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('msgscale_token');
                  window.location.href = '/login';
                }}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Log Out
              </button>
            </div>
          )}
          {!canCreateWorkspace && (
            <button
              onClick={() => {
                localStorage.removeItem('msgscale_token');
                window.location.href = '/login';
              }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Log Out
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin mb-4">refresh</span>
            <p className="text-text-secondary font-bold uppercase tracking-widest">Loading your workspaces...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center space-y-4">
            <span className="material-symbols-outlined text-4xl text-red-500">error</span>
            <p className="text-red-500 font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-sm"
            >
              Retry
            </button>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="size-24 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-5xl text-slate-500">folder_open</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">No workspaces found</h3>
              <p className="text-text-secondary">You haven't been added to any workspaces yet. Create one or contact your admin.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws, i) => (
              <div
                key={ws.id}
                onClick={() => handleSelect(ws)}
                className="group p-6 rounded-2xl bg-surface-dark border border-border-dark hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">hub</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ws.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                    ws.status === 'SUSPENDED' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>{ws.status}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{ws.title}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Created {new Date(ws.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-4 border-t border-border-dark/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="material-symbols-outlined text-sm">group</span>
                    {ws.memberCount || 0} {ws.memberCount === 1 ? 'Member' : 'Members'}
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">Access</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface-dark border border-border-dark w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white italic">Create Workspace</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
                disabled={isCreating}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Name</label>
                <input
                  type="text"
                  value={newWorkspaceTitle}
                  onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                  placeholder="e.g. Marketing Team, Sales Corp..."
                  className="w-full bg-slate-800/50 border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border-dark text-slate-400 font-bold hover:bg-slate-800 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  disabled={isCreating || !newWorkspaceTitle.trim()}
                >
                  {isCreating ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  )}
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelection;

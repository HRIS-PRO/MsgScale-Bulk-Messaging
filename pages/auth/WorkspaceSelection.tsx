
import React from 'react';
import { useNavigate } from 'react-router-dom';

const WorkspaceSelection = ({ onSelect }: { onSelect: () => void }) => {
  const navigate = useNavigate();

  const workspaces = [
    { name: 'Marketing Team A', status: 'Active', members: 12, role: 'Owner' },
    { name: 'Global Support', status: 'Active', members: 45, role: 'Editor' },
    { name: 'Engineering', status: 'Maintenance', members: 8, role: 'Admin' },
    { name: 'Sales East', status: 'Active', members: 22, role: 'Viewer' },
    { name: 'Human Resources', status: 'Suspended', members: 5, role: 'Owner' },
    { name: 'Product Design', status: 'Active', members: 14, role: 'Editor' },
  ];

  const handleSelect = () => {
    onSelect();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background-dark p-10 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-10">
        <div className="flex justify-between items-end border-b border-border-dark pb-8">
           <div className="space-y-2">
             <h1 className="text-4xl font-black text-white tracking-tight">Welcome back, Alex</h1>
             <p className="text-text-secondary text-lg">Choose an organization to manage your campaigns</p>
           </div>
           <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-primary/30 flex items-center gap-2">
             <span className="material-symbols-outlined text-[18px]">add</span>
             CREATE NEW WORKSPACE
           </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {workspaces.map((ws, i) => (
             <div 
                key={i} 
                onClick={handleSelect}
                className="group p-6 rounded-2xl bg-surface-dark border border-border-dark hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col gap-6"
             >
                <div className="flex justify-between items-start">
                   <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center">
                     <span className="material-symbols-outlined text-primary">hub</span>
                   </div>
                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     ws.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                     ws.status === 'Suspended' ? 'bg-red-500/10 text-red-500' : 
                     'bg-yellow-500/10 text-yellow-500'
                   }`}>{ws.status}</span>
                </div>
                <div className="space-y-1">
                   <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{ws.name}</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Created Oct 2023</p>
                </div>
                <div className="pt-4 border-t border-border-dark/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="flex items-center gap-1.5 text-slate-400">
                     <span className="material-symbols-outlined text-sm">group</span>
                     {ws.members} Members
                   </span>
                   <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">{ws.role}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelection;

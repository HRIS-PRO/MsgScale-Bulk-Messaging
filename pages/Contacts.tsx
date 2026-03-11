
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../RoleContext';
import AddToGroupModal from '../components/AddToGroupModal';

interface Contact {
  id: string;
  fullName: string;
  customerType: string;
  title: string;
  surname: string;
  firstName: string;
  mobilePhone: string;
  email: string;
  residentialState?: string;
  bvn?: string;
  nin?: string;
  tin?: string;
  occupation?: string;
  externalCreatedAt?: string;
  createdAt: string;
}

const formatDate = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString.split('T')[0];
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const Contacts = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/customers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('msgscale_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchContacts();
  }, []);

  const canEdit = role === 'Admin' || role === 'Manager' || role === 'Editor';
  const isAdmin = role === 'Admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: keyof Contact; direction: 'asc' | 'desc' } | null>(null);
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('All');

  // MODAL STATES
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [visibility, setVisibility] = useState<'global' | 'workspace' | 'private'>('global');
  const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredAndSortedContacts = useMemo(() => {
    let result = contacts.filter(c => {
      const searchLower = searchQuery.toLowerCase();

      const searchString = `
        ${c.firstName || ''} 
        ${c.surname || ''} 
        ${c.email || ''} 
        ${c.mobilePhone || ''} 
        ${c.bvn || ''} 
        ${c.nin || ''} 
        ${c.tin || ''} 
        ${c.customerType || ''} 
        ${c.occupation || ''}
      `.toLowerCase();

      const matchesSearch = searchString.includes(searchLower);
      const matchesGroup = activeGroupFilter === 'All' || c.customerType === activeGroupFilter;

      return matchesSearch && matchesGroup;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [contacts, searchQuery, sortConfig, activeGroupFilter]);

  // Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedContacts.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSort = (key: keyof Contact) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const bulkAction = async (action: string) => {
    if (action === 'delete') {
      const idsToDelete = Array.from(selectedIds);
      if (idsToDelete.length === 0) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/customers/bulk`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('msgscale_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ customerIds: idsToDelete })
        });
        if (res.ok) {
          setContacts(prev => prev.filter(c => !selectedIds.has(c.id)));
          setSelectedIds(new Set());
        } else {
          console.error("Failed to delete bulk customers");
        }
      } catch (err) {
        console.error("Error deleting bulk customers:", err);
      }
    } else if (action === 'group') {
      setIsAddToGroupModalOpen(true);
    }
  };

  const deleteSingleCustomer = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/customers/bulk`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('msgscale_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customerIds: [id] })
      });
      if (res.ok) {
        setContacts(prev => prev.filter(c => c.id !== id));
        const newSelected = new Set(selectedIds);
        newSelected.delete(id);
        setSelectedIds(newSelected);
      } else {
        console.error("Failed to delete customer");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-20 animate-[fadeIn_0.3s_ease-out] theme-transition relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight">Manage Contacts</h2>
          <p className="text-slate-500 text-sm font-medium">View, filter, and organize your message recipients.</p>
        </div>
        <div className="flex gap-3">
          {canEdit && (
            <button
              onClick={() => navigate('/contacts/add')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              New Contact
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
        <div className="flex-1 w-full relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400 shadow-inner"
            placeholder="Filter by name, email, or phone number..."
          />
        </div>

        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          {/* Unique customer types dynamically extracted, just like the old 'groups' logic */}
          {['All', ...Array.from(new Set(contacts.map(c => c.customerType).filter(Boolean)))].map(group => (
            <button
              key={group}
              onClick={() => setActiveGroupFilter(group)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeGroupFilter === group
                ? 'bg-primary border-primary text-white'
                : 'bg-white dark:bg-[#111722] border-slate-200 dark:border-border-dark text-slate-500 hover:border-primary'
                }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* <div className="space-y-3">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 animate-[fadeIn_0.4s_ease-out]">
          <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-2xl">info</span>
          <div className="flex-1">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs mr-1">Global Contacts Enabled.</span>
              By default, all contacts added here are part of the global addressing list. You can limit visibility to just this workspace if needed.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsVisibilityModalOpen(true)}
              className="text-xs font-black text-primary uppercase tracking-widest hover:text-blue-600 hover:underline transition-all whitespace-nowrap italic"
            >
              Manage List Visibility
            </button>
          )}
        </div>

        <div className="bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 animate-[fadeIn_0.5s_ease-out]">
          <span className="material-symbols-outlined text-violet-500 dark:text-violet-400 text-2xl">webhook</span>
          <div className="flex-1">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs mr-1">API & Webhook Imports.</span>
              Contacts can also be imported via API or webhook events.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate('/contacts/integrations')}
              className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest hover:text-violet-700 transition-all whitespace-nowrap italic"
            >
              Set Up API/Webhook Integrations
            </button>
          )}
        </div>
      </div> */}

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 animate-[slideInDown_0.2s_ease-out]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">check_circle</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedIds.size} contacts selected</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => bulkAction('group')}
              className="px-4 py-2 rounded-lg bg-white dark:bg-surface-dark text-slate-700 dark:text-white text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-border-dark hover:border-primary transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span> Add to Group
            </button>
            <button
              onClick={() => bulkAction('delete')}
              className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-200 dark:border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span> Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Results Container */}
      <div className="rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-slate-200 dark:border-border-dark shadow-sm dark:shadow-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-[#111722]/50">
                <th className="px-6 py-5 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className={`size-5 rounded border flex items-center justify-center transition-all ${selectedIds.size === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0
                      ? 'bg-primary border-primary'
                      : 'border-slate-300 dark:border-slate-600 hover:border-primary'
                      }`}
                  >
                    {selectedIds.size === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0 &&
                      <span className="material-symbols-outlined text-white text-[14px] font-black">check</span>
                    }
                  </button>
                </th>
                <th
                  className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                  onClick={() => handleSort('firstName')}
                >
                  <div className="flex items-center gap-1">
                    Contact Name
                    <span className={`material-symbols-outlined text-[16px] transition-opacity ${sortConfig?.key === 'firstName' ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-50'}`}>
                      {sortConfig?.direction === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone & Email</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border-dark/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm font-bold uppercase tracking-widest">
                    <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-primary">autorenew</span>
                    <p>Loading Contacts...</p>
                  </td>
                </tr>
              ) : filteredAndSortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm font-bold uppercase tracking-widest">
                    No Contacts Found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedContacts.map((contact) => {
                  const avatarText = `${contact.firstName?.[0] || ''}${contact.surname?.[0] || ''}` || 'CC';
                  return (
                    <tr key={contact.id} className={`group hover:bg-slate-50 dark:hover:bg-white/5 transition-all ${selectedIds.has(contact.id) ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => toggleSelect(contact.id)}
                          className={`size-5 rounded border flex items-center justify-center transition-all ${selectedIds.has(contact.id) ? 'bg-primary border-primary' : 'border-slate-200 dark:border-border-dark group-hover:border-primary'
                            }`}
                        >
                          {selectedIds.has(contact.id) && <span className="material-symbols-outlined text-white text-[14px] font-black">check</span>}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm shadow-inner uppercase">
                            {avatarText}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white italic tracking-tight">{contact.firstName} {contact.surname}</p>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{contact.occupation || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                            {contact.mobilePhone}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            {contact.email || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          {contact.bvn && <span className="text-[10px] font-medium text-slate-500">BVN: *******{contact.bvn.slice(-4)}</span>}
                          {contact.nin && <span className="text-[10px] font-medium text-slate-500">NIN: *******{contact.nin.slice(-4)}</span>}
                          <span className="text-[10px] font-medium text-slate-500">{contact.residentialState || 'Unknown State'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20`}>
                          <span className={`size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]`}></span>
                          {contact.customerType || 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 dark:text-white italic leading-none">{formatDate(contact.externalCreatedAt || contact.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button className="size-9 flex items-center justify-center rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all shadow-sm" title="Edit">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => deleteSingleCustomer(contact.id)}
                            className="size-9 flex items-center justify-center rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark text-slate-400 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/10 transition-all shadow-sm"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary */}
        <div className="p-6 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-[#111722]/30 gap-4">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">
            Showing <span className="text-slate-900 dark:text-white">{filteredAndSortedContacts.length}</span> of <span className="text-slate-900 dark:text-white">{contacts.length}</span> Total Results
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-primary transition-all">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="size-10 rounded-xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20">1</button>
            <button className="p-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-primary transition-all">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* MANAGE LIST VISIBILITY MODAL */}
      {isVisibilityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsVisibilityModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-2xl animate-[zoomIn_0.2s_ease-out] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-border-dark flex items-center justify-between bg-slate-50 dark:bg-[#111722]/50">
              <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase tracking-widest text-sm">Manage List Visibility</h3>
              <button
                onClick={() => setIsVisibilityModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-background-dark hover:text-slate-600 dark:hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 font-medium leading-relaxed italic uppercase tracking-tighter">
                Control who can see and access the contacts in this list. Changes apply immediately to all workspace members.
              </p>

              <div className="space-y-4">
                {/* Global Access */}
                <div
                  onClick={() => setVisibility('global')}
                  className={`relative flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all ${visibility === 'global' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722]'
                    }`}
                >
                  <div className="flex h-6 items-center">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${visibility === 'global' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                      {visibility === 'global' && <div className="size-2.5 rounded-full bg-primary animate-[zoomIn_0.15s_ease-out]"></div>}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Global Access</label>
                      <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[9px] font-black text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase tracking-widest">Recommended</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">All members of the organization can view and edit these contacts. Best for shared company directories.</p>
                  </div>
                </div>

                {/* Workspace Only */}
                <div
                  onClick={() => setVisibility('workspace')}
                  className={`relative flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all ${visibility === 'workspace' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722]'
                    }`}
                >
                  <div className="flex h-6 items-center">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${visibility === 'workspace' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                      {visibility === 'workspace' && <div className="size-2.5 rounded-full bg-primary animate-[zoomIn_0.15s_ease-out]"></div>}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic mb-1">Workspace Only</label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Restricted to members of <span className="text-slate-900 dark:text-white font-black">Workspace A</span>. Good for department-specific contacts.</p>
                  </div>
                </div>

                {/* Private List */}
                <div
                  onClick={() => setVisibility('private')}
                  className={`relative flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all ${visibility === 'private' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722]'
                    }`}
                >
                  <div className="flex h-6 items-center">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${visibility === 'private' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                      {visibility === 'private' && <div className="size-2.5 rounded-full bg-primary animate-[zoomIn_0.15s_ease-out]"></div>}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic mb-1">Private List</label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Only you and workspace admins can see this list. Useful for sensitive client data.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-border-dark flex justify-end gap-3">
                <button
                  onClick={() => setIsVisibilityModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsVisibilityModalOpen(false)}
                  className="px-8 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD TO GROUP MODAL */}
      {isAddToGroupModalOpen && (
        <AddToGroupModal
          isOpen={isAddToGroupModalOpen}
          onClose={() => setIsAddToGroupModalOpen(false)}
          customerIds={Array.from(selectedIds)}
          onSuccess={(added) => {
            setIsAddToGroupModalOpen(false);
            setSuccessMessage(`Successfully added recipients to group. ${added} were new members.`);
            setSelectedIds(new Set());
            setTimeout(() => setSuccessMessage(''), 5000);
          }}
        />
      )}

      {/* SUCCESS NOTIFICATION */}
      {successMessage && (
        <div className="fixed bottom-8 right-8 z-[200] animate-[slideInRight_0.3s_ease-out]">
          <div className="bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="size-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
            <p className="text-sm font-bold tracking-tight">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;

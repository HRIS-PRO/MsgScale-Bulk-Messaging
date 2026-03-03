
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../types';
import { useRole } from '../RoleContext';

const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Urgent Alert #44', type: 'WhatsApp', status: 'Sent', audience: '12,450', createdBy: 'Alice M.', date: 'Just now' },
  { id: '2', name: 'Q3 Promo Blast', type: 'SMS', status: 'Scheduled', audience: '50,000', createdBy: 'Bob D.', date: 'In 2 days' },
  { id: '3', name: 'November Newsletter', type: 'Email', status: 'Draft', audience: '-', createdBy: 'Charlie T.', date: '2 hours ago' },
  { id: '4', name: 'Holiday Special', type: 'Email', status: 'Pending Approval', audience: '25,000', createdBy: 'David K.', date: '1 hour ago' },
  { id: '5', name: 'Flash Sale', type: 'SMS', status: 'Rejected', audience: '10,000', createdBy: 'Emma S.', date: 'Yesterday' },
];

const Campaigns = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const canCreate = role === 'Admin' || role === 'Manager' || role === 'Editor';
  const canApprove = role === 'Admin' || role === 'Manager';

  const handleReview = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsReviewModalOpen(true);
  };

  const handleApprove = () => {
    // In a real app, this would call an API
    setIsReviewModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleReject = () => {
    // In a real app, this would call an API
    setIsReviewModalOpen(false);
    setSelectedCampaign(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">All Campaigns</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your messaging broadcasts.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => navigate('/campaigns/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg shadow-primary/20 transition-all font-bold tracking-wide"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Create Campaign
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-lg">search</span>
            <input className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm" placeholder="Search campaigns..." />
          </div>
          <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-background-dark/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Channel</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Audience</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-surface-hover/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold dark:text-white">{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{c.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${c.type === 'WhatsApp' ? 'text-green-500' : c.type === 'SMS' ? 'text-blue-500' : 'text-purple-500'}`}>
                        {c.type === 'WhatsApp' ? 'chat' : c.type === 'SMS' ? 'sms' : 'mail'}
                      </span>
                      <span className="text-sm font-medium">{c.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      c.status === 'Sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      c.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                      c.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      c.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium dark:text-slate-300">{c.audience}</td>
                  <td className="px-6 py-4 text-right">
                    {c.status === 'Pending Approval' && canApprove ? (
                      <button 
                        onClick={() => handleReview(c)}
                        className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Review
                      </button>
                    ) : (
                      <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">more_horiz</span></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* REVIEW MODAL */}
      {isReviewModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsReviewModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2.5rem] shadow-2xl overflow-hidden animate-[zoomIn_0.2s_ease-out] flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-background-dark/30">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-widest italic">Review Campaign</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-70 mt-1">Approval workflow required for enterprise compliance</p>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="size-10 rounded-full bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign Name</p>
                  <p className="text-sm font-bold dark:text-white italic">{selectedCampaign.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Channel</p>
                  <p className="text-sm font-bold dark:text-white uppercase">{selectedCampaign.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audience Size</p>
                  <p className="text-sm font-bold dark:text-white">{selectedCampaign.audience}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Created By</p>
                  <p className="text-sm font-bold dark:text-white">{selectedCampaign.createdBy}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-2xl p-6">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">visibility</span> Content Preview
                </h4>
                <div className="space-y-3">
                  <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-20 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl mt-4"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reviewer Comments (Optional)</label>
                <textarea className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-5 py-3.5 text-sm text-slate-900 dark:text-white font-bold italic outline-none focus:ring-1 focus:ring-primary shadow-inner h-24 resize-none" placeholder="Add feedback for the campaign creator..."></textarea>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 flex justify-end gap-4">
               <button 
                onClick={handleReject}
                className="px-8 py-3 rounded-2xl border border-red-200 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
               >
                 Reject
               </button>
               <button 
                onClick={handleApprove}
                className="px-10 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:bg-blue-600 hover:translate-y-[-2px] transition-all"
               >
                 Approve & Schedule
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;

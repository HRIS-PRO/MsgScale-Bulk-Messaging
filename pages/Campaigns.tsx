
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../types';
import { useRole } from '../RoleContext';

const Campaigns = () => {
  const navigate = useNavigate();
  const { role, token, selectedWorkspace, user } = useRole();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  React.useEffect(() => {
    fetchCampaigns();
  }, [selectedWorkspace?.id, token]);

  const fetchCampaigns = async () => {
    if (!token || !selectedWorkspace?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canCreate = role === 'Admin' || role === 'Manager' || role === 'Editor';
  const canApprove = (campaign: any) => {
    // Only Admins or Managers can approve, AND you cannot approve your own campaign
    if (role !== 'Admin' && role !== 'Manager') return false;
    if (campaign.creatorId === user?.id) return false;
    return true;
  };

  const handleReview = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedCampaign || isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace?.id}/${selectedCampaign.id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'APPROVE' })
      });
      if (response.ok) {
        await fetchCampaigns();
        setIsReviewModalOpen(false);
        setSelectedCampaign(null);
      }
    } catch (error) {
      console.error('Failed to approve campaign:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCampaign || isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace?.id}/${selectedCampaign.id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'REJECT' })
      });
      if (response.ok) {
        await fetchCampaigns();
        setIsReviewModalOpen(false);
        setSelectedCampaign(null);
      }
    } catch (error) {
      console.error('Failed to reject campaign:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendApproval = async (campaign: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace?.id}/${campaign.id}/resend-approval`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setToastMessage('Approval Notification Resent!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Failed to resend approval:', error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace?.id}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id));
        setToastMessage('Campaign Deleted');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleEditCampaign = (campaign: any) => {
    if (campaign.status !== 'DRAFT' && campaign.status !== 'REJECTED') {
      alert("Only drafts or rejected campaigns can be edited.");
      return;
    }
    navigate(`/campaigns/edit/${campaign.id}`);
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
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold">Loading campaigns...</td>
                </tr>
              )}
              {!isLoading && campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold">No campaigns found.</td>
                </tr>
              )}
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-surface-hover/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold dark:text-white">{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${c.channel === 'WHATSAPP' ? 'text-green-500' : c.channel === 'SMS' ? 'text-blue-500' : 'text-purple-500'}`}>
                        {c.channel === 'WHATSAPP' ? 'chat' : c.channel === 'SMS' ? 'sms' : 'mail'}
                      </span>
                      <span className="text-sm font-medium">{c.channel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      c.status === 'SCHEDULED' || c.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        c.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                          c.status === 'REJECTED' || c.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium dark:text-slate-300">
                    {c.targetCount || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {c.status === 'PENDING' && canApprove(c) ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReview(c); }}
                          className="px-4 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-primary/20"
                        >
                          Review
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          {c.status === 'PENDING' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleResendApproval(c); }}
                              className="size-10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all border border-slate-100 dark:border-border-dark hover:border-blue-100 shadow-sm bg-white dark:bg-surface-dark"
                              title="Resend Approval Notification"
                            >
                              <span className="material-symbols-outlined text-xl">send</span>
                            </button>
                          )}
                          {(c.status === 'DRAFT' || c.status === 'REJECTED') && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditCampaign(c); }}
                              className="size-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all border border-slate-100 dark:border-border-dark hover:border-primary/20 shadow-sm bg-white dark:bg-surface-dark"
                              title="Edit Campaign"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(c.id); }}
                            className="size-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-slate-100 dark:border-border-dark hover:border-red-100 shadow-sm bg-white dark:bg-surface-dark"
                            title="Delete Campaign"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
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
                  <p className="text-sm font-bold dark:text-white">{selectedCampaign.targetCount || 'Calculating...'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Created By</p>
                  <p className="text-sm font-bold dark:text-white">{selectedCampaign.creator?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-2xl p-6">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">visibility</span> Content Preview
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedCampaign.content?.body || '' }} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reviewer Comments (Optional)</label>
                <textarea className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-5 py-3.5 text-sm text-slate-900 dark:text-white font-bold italic outline-none focus:ring-1 focus:ring-primary shadow-inner h-24 resize-none" placeholder="Add feedback for the campaign creator..."></textarea>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-background-dark/30 flex justify-end gap-4">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-8 py-3 rounded-2xl border border-red-200 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {isProcessing ? '...' : 'Reject'}
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-10 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:bg-blue-600 hover:translate-y-[-2px] transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Approve & Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-[slideInUp_0.3s_ease-out] border border-white/10 backdrop-blur-md">
          <div className="size-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-widest italic">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Campaigns;

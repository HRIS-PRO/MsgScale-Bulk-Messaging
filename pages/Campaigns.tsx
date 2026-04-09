
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

  const canCreate = role === 'Admin' || role === 'Manager' || role === 'Editor' || role === 'User';
  const canApprove = (campaign: any) => {
    if (campaign.creatorId === user?.id && role !== 'Admin') return false;
    const stage = campaign.content?.metadata?.approvalStage || 'MANAGER';
    if (stage === 'EDITOR') {
      return role === 'Admin' || role === 'Editor';
    }
    return role === 'Admin' || role === 'Manager';
  };

  const handleRetryCampaign = async (campaignId: string) => {
    if (!selectedWorkspace) return;
    if (!window.confirm("Are you sure you want to retry sending failed messages for this campaign?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${selectedWorkspace.id}/${campaignId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('msgscale_token')}`,
        }
      });

      if (response.ok) {
        alert("Retry successfully initiated!");
        fetchCampaigns();
      } else {
        const err = await response.json();
        alert(`Failed to retry: ${err.message}`);
      }
    } catch (error) {
      console.error("Retry Error:", error);
      alert("An unexpected error occurred while retrying.");
    }
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
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Campaign</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Creator</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Channel</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold italic">Loading campaigns...</td>
                </tr>
              )}
              {!isLoading && campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold italic tracking-wide">No campaigns recorded yet.</td>
                </tr>
              )}
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-surface-hover/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold dark:text-white uppercase tracking-tight">{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black shrink-0">
                        {c.creatorName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black dark:text-white tracking-tight">{c.creatorName}</span>
                        <span className="text-[10px] text-slate-400 font-bold lowercase">
                          {c.creator?.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${c.channel === 'WHATSAPP' ? 'text-green-500' : c.channel === 'SMS' ? 'text-blue-500' : 'text-purple-500'}`}>
                        {c.channel === 'WHATSAPP' ? 'chat' : c.channel === 'SMS' ? 'sms' : 'mail'}
                      </span>
                      <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{c.channel}</span>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col items-center px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-white/5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Reach</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">{c.targetCount || '0'}</span>
                       </div>
                       <div className="flex flex-col items-center px-3 py-1 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100/50 dark:border-red-900/20">
                          <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter">failed</span>
                          <span className="text-xs font-black text-red-600 dark:text-red-400 leading-tight">{c.targetCount - c.sentCount || '0'}</span>
                       </div>
                       <div className="flex flex-col items-center px-3 py-1 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100/50 dark:border-blue-900/20">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Sent</span>
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 leading-tight">{c.sentCount || '0'}</span>
                       </div>
                       {/* <div className="flex flex-col items-center px-3 py-1 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100/50 dark:border-red-900/20">
                          <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter">retries</span>
                          <span className="text-xs font-black text-red-600 dark:text-red-400 leading-tight">{c.failedCount || '0'}</span>
                       </div> */}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {c.status === 'PENDING' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReview(c); }}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${canApprove(c) ? 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                        >
                          {canApprove(c) ? 'Review' : 'View Progress'}
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
                          {c.failedCount > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRetryCampaign(c.id); }}
                              className="size-10 flex items-center justify-center text-amber-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-all border border-slate-100 dark:border-border-dark hover:border-amber-100 shadow-sm bg-white dark:bg-surface-dark"
                              title="Retry Failed Messages"
                            >
                              <span className="material-symbols-outlined text-xl">replay</span>
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
          <div className="relative w-full max-w-5xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-[2rem] shadow-2xl overflow-hidden animate-[zoomIn_0.2s_ease-out] flex flex-col md:flex-row h-[85vh]">
            
            {/* Left Column: Context & Action */}
            <div className="w-full md:w-2/5 md:border-r border-slate-100 dark:border-border-dark flex flex-col bg-slate-50 dark:bg-background-dark/30">
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-white dark:bg-surface-dark">
                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-widest italic leading-tight">Review Campaign</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-70 mt-1">Enterprise Compliance Workflow</p>
                </div>
                <button onClick={() => setIsReviewModalOpen(false)} className="size-8 rounded-full bg-slate-100 dark:bg-background-dark flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {/* Visual Stepper */}
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 -z-10"></div>
                  
                  {['DRAFT', 'SUBMITTED', 'REVIEWING', 'APPROVED'].map((step, idx) => {
                    let isCompleted = false;
                    let isActive = false;
                    let isError = false;
                    const st = selectedCampaign.status;
                    
                    if (step === 'DRAFT') isCompleted = true;
                    if (step === 'SUBMITTED') isCompleted = st !== 'DRAFT';
                    if (step === 'REVIEWING') {
                      if (st === 'PENDING') isActive = true;
                      if (st === 'APPROVED' || st === 'SCHEDULED' || st === 'COMPLETED') isCompleted = true;
                    }
                    if (step === 'APPROVED') {
                      if (st === 'APPROVED' || st === 'SCHEDULED' || st === 'COMPLETED') isCompleted = true;
                      if (st === 'REJECTED') { isCompleted = true; isError = true; }
                    }

                    return (
                      <div key={step} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-background-dark/30 px-2 ring-4 ring-slate-50 dark:ring-[#1a2130]">
                        <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' : isError ? 'bg-red-500 text-white' : isCompleted ? 'bg-green-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                          {isActive ? <span className="material-symbols-outlined text-[16px]">visibility</span> : isError ? <span className="material-symbols-outlined text-[16px]">close</span> : isCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : (idx + 1)}
                        </div>
                        <span className={`text-[8px] font-black tracking-widest uppercase ${isActive ? 'text-blue-500' : isError ? 'text-red-500' : isCompleted ? 'text-green-500' : 'text-slate-400'}`}>{isError && step === 'APPROVED' ? 'REJECTED' : step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1 col-span-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Campaign Name</p>
                    <p className="text-sm font-bold dark:text-white italic">{selectedCampaign.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Channel</p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest dark:text-slate-300">
                      <span className="material-symbols-outlined text-[12px]">{selectedCampaign.channel === 'WHATSAPP' ? 'chat' : selectedCampaign.channel === 'SMS' ? 'sms' : 'mail'}</span>
                      {selectedCampaign.channel}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audience Size</p>
                    <p className="text-sm font-bold dark:text-white font-mono">{selectedCampaign.targetCount?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Created By</p>
                    <p className="text-sm font-bold dark:text-white">{selectedCampaign.creator?.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Stage</p>
                    <p className="text-sm font-bold text-amber-500">{selectedCampaign.content?.metadata?.approvalStage || 'MANAGER'}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reviewer Comments (Optional)</label>
                  <textarea className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold italic outline-none focus:ring-1 focus:ring-primary shadow-inner h-28 resize-none" placeholder="Add explicit feedback for the creator..."></textarea>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark flex gap-3">
                {!canApprove(selectedCampaign) ? (
                  <div className="flex-1 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest italic bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 h-[46px] flex items-center justify-center">
                    {selectedCampaign.status === 'PENDING' ? `Awaiting ${selectedCampaign.content?.metadata?.approvalStage?.toLowerCase() || 'manager'} review` : 'Review Completed'}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="flex-1 py-3.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="flex-1 py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Content Preview */}
            <div className="w-full md:w-3/5 bg-slate-200 dark:bg-[#0f141e] flex flex-col relative h-full">
              <div className="p-4 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-border-dark flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined text-sm text-slate-400">preview</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Content Preview</span>
              </div>
              <div className="flex-1 overflow-y-auto w-full relative custom-scrollbar">
                {selectedCampaign.channel === 'EMAIL' ? (
                   <div className="w-full min-h-full bg-white text-black p-8 shadow-inner prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedCampaign.content?.body || '' }} />
                ) : (
                  <div className="p-8 flex items-center justify-center h-full">
                    <div className="bg-[#DCF8C6] dark:bg-[#056162] text-slate-800 dark:text-white p-4 rounded-2xl rounded-tl-none shadow-md max-w-sm w-full font-sans text-sm whitespace-pre-wrap">
                      {selectedCampaign.content?.body || ''}
                    </div>
                  </div>
                )}
              </div>
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

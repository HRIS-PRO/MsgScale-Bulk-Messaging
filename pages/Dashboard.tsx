import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useRole } from '../RoleContext';

const Dashboard = () => {
  const { user, selectedWorkspace, token } = useRole();
  const userName = user?.employee
    ? `${user.employee.firstName} ${user.employee.surname}`
    : (user?.email.split('@')[0] || 'User');

  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [anniversaries, setAnniversaries] = useState<{ inThreeDays: any[], upcoming: any[] }>({ inThreeDays: [], upcoming: [] });
  const [isFetchingAnniversaries, setIsFetchingAnniversaries] = useState(false);
  const [chartRange, setChartRange] = useState<'30D' | '14D' | '7D'>('30D');

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedWorkspace?.id && token) {
      fetchStats();
      fetchAnniversaries();
    }
  }, [selectedWorkspace?.id, token]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace!.id}/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStatsData(await response.json());
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnniversaries = async () => {
    setIsFetchingAnniversaries(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${selectedWorkspace!.id}/anniversaries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAnniversaries(await response.json());
      }
    } catch (err) {
      console.error("Failed to fetch anniversaries", err);
    } finally {
      setIsFetchingAnniversaries(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white italic">Welcome back, {userName}</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium text-[12px] md:text-sm">Managing <b>{selectedWorkspace?.title}</b> workspace.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">download</span> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Sent Today', value: statsData?.totalSentToday?.value || '0', trend: statsData?.totalSentToday?.trend || '0%', up: statsData?.totalSentToday?.up ?? true, icon: 'send', color: 'blue' },
          { label: 'Delivery Rate', value: statsData?.deliveryRate?.value || '0%', trend: statsData?.deliveryRate?.trend || '0%', up: statsData?.deliveryRate?.up ?? true, icon: 'check_circle', color: 'green' },
          { label: 'Failed Messages', value: statsData?.failedRate?.value || '0%', trend: statsData?.failedRate?.trend || '0%', up: statsData?.failedRate?.up ?? false, icon: 'error', color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <div className={`p-2 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-500`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight">{stat.value}</h3>
              {stat.trend && (
                <span className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-full ${stat.up ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                  <span className="material-symbols-outlined text-[14px] mr-1">{stat.up ? 'trending_up' : 'trending_down'}</span> {stat.trend}
                </span>
              )}
            </div>

            {stat.label === 'Total Sent Today' && (
              <div className="flex gap-4 mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Emails: <span className="text-slate-900 dark:text-white">{statsData?.totalSentToday?.emailVal || '0'}</span></span>
                <span>SMS: <span className="text-slate-900 dark:text-white">{statsData?.totalSentToday?.smsVal || '0'}</span></span>
              </div>
            )}
            {stat.label !== 'Total Sent Today' && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">vs. yesterday</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">Delivery Performance</h3>
              <p className="text-xs text-slate-500 font-medium">Last {chartRange.replace('D', '')} Days Message Volume</p>
            </div>
            <div className="relative">
              <select
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value as '30D' | '14D' | '7D')}
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
              >
                <option value="30D">Last 30 Days</option>
                <option value="14D">Last 14 Days</option>
                <option value="7D">Last 7 Days</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-4xl animate-spin mb-4">refresh</span>
                <p className="font-bold uppercase tracking-widest text-xs">Loading Live Data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartRange === '30D' ? (statsData?.chartData || []) : chartRange === '14D' ? (statsData?.chartData || []).slice(-14) : (statsData?.chartData || []).slice(-7)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#135bec" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#135bec" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark-stroke="#232f48" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={15} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111722', border: '1px solid #232f48', borderRadius: '12px', padding: '12px' }}
                    itemStyle={{ color: '#135bec', fontWeight: 900 }}
                    labelStyle={{ color: '#fff', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#135bec" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">Channel Health</h3>
            <span className="px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 text-[9px] font-black uppercase tracking-tighter">Live</span>
          </div>
          <div className="space-y-6">
            {isLoading ? (
              <div className="w-full flex flex-col items-center justify-center text-slate-400 py-10">
                <span className="material-symbols-outlined text-4xl animate-spin mb-4">refresh</span>
              </div>
            ) : (
              (statsData?.channelHealth || []).map((channel: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${channel.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : channel.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                      <span className="material-symbols-outlined text-2xl">{channel.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-black dark:text-white italic tracking-tight">{channel.name}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${channel.color === 'green' ? 'text-green-500' : channel.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>{channel.status}</p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined font-black ${channel.color === 'green' ? 'text-green-500' : channel.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {channel.color === 'green' ? 'check_circle' : channel.color === 'yellow' ? 'warning' : 'error'}
                  </span>
                </div>
              )))}
          </div>
          <button className="w-full mt-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary transition-all">
            System Status Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-primary font-black">celebration</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Anniversary Alerts</h3>
            <p className="text-xs text-slate-500 font-medium mb-8">Proactive marketing opportunities for the next 7 days</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isFetchingAnniversaries ? (
                <div className="col-span-full py-10 flex flex-col items-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl animate-spin mb-2">refresh</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Scanning Contacts...</p>
                </div>
              ) : (anniversaries.inThreeDays.length === 0 && anniversaries.upcoming.length === 0) ? (
                <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700 mb-2">event_busy</span>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No upcoming anniversaries</p>
                </div>
              ) : (
                <>
                  {[...anniversaries.inThreeDays, ...anniversaries.upcoming].slice(0, 4).map((ann, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigate('/campaigns/new')}
                      className={`p-4 rounded-xl border ${ann.daysUntil === 3 ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'} transition-transform hover:scale-[1.02] cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${ann.type === 'Birthday' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                          <span className="material-symbols-outlined text-lg">{ann.type === 'Birthday' ? 'cake' : 'domain'}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${ann.daysUntil === 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {ann.daysUntil} Days Left
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate italic">{ann.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{ann.type} • {ann.date}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 p-8 rounded-2xl bg-slate-900 dark:bg-primary/10 border border-slate-800 dark:border-primary/20 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-base font-black text-white uppercase tracking-widest mb-4 italic">Action required</h3>
            <p className="text-sm text-slate-300 dark:text-slate-200 leading-relaxed mb-8">
              There are <span className="text-white font-black">{anniversaries.inThreeDays.length} urgent</span> marketing opportunities today.
            </p>
            <div className="mt-auto space-y-3">
              <button 
                onClick={() => navigate('/campaigns/new')}
                className="w-full py-4 rounded-xl bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group/btn shadow-lg"
              >
                Create Campaign <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
                Dismiss Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

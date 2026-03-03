
import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const chartData = [
  { name: 'Nov 01', value: 12000 },
  { name: 'Nov 05', value: 24000 },
  { name: 'Nov 10', value: 18000 },
  { name: 'Nov 15', value: 22000 },
  { name: 'Nov 20', value: 8000 },
  { name: 'Nov 25', value: 25430 },
  { name: 'Today', value: 21000 },
];

const Dashboard = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white italic">Welcome back, Alex</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">Here is your daily activity overview.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">download</span> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sent Today', value: '12,450', trend: '12%', up: true, icon: 'send', color: 'blue' },
          { label: 'Delivery Rate', value: '98.2%', trend: '0.5%', up: true, icon: 'check_circle', color: 'green' },
          { label: 'Failed Messages', value: '1.8%', trend: '0.2%', up: false, icon: 'error', color: 'red' },
          { label: 'Wallet Balance', value: '₦450.00', trend: null, up: null, icon: 'account_balance_wallet', color: 'purple' },
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
                  <span className="material-symbols-outlined text-[14px] mr-0.5">{stat.up ? 'trending_up' : 'trending_down'}</span> {stat.trend}
                </span>
              )}
            </div>
            {stat.label === 'Wallet Balance' && (
              <div className="mt-4 space-y-2">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3 shadow-[0_0_8px_rgba(19,91,236,0.5)]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Threshold</span>
                  <span>66% remaining</span>
                </div>
              </div>
            )}
            {stat.label !== 'Wallet Balance' && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">vs. yesterday</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">Delivery Performance</h3>
              <p className="text-xs text-slate-500 font-medium">Last 30 Days Message Volume</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow rounded-lg transition-all">30D</button>
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">7D</button>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#135bec" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#135bec" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark-stroke="#232f48" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111722', border: '1px solid #232f48', borderRadius: '12px', padding: '12px' }}
                  itemStyle={{ color: '#135bec', fontWeight: 900 }}
                  labelStyle={{ color: '#fff', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#135bec" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8">Channel Health</h3>
          <div className="space-y-8">
            {[
              { name: 'SMS Gateway', status: 'Operational', icon: 'sms', color: 'green' },
              { name: 'WhatsApp API', status: 'Operational', icon: 'chat', color: 'green' },
              { name: 'Email Server', status: 'Degraded Performance', icon: 'mail', color: 'yellow' },
            ].map((channel, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${channel.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'}`}>
                    <span className="material-symbols-outlined text-2xl">{channel.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black dark:text-white italic tracking-tight">{channel.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${channel.color === 'green' ? 'text-green-500' : 'text-yellow-500'}`}>{channel.status}</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined font-black ${channel.color === 'green' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {channel.color === 'green' ? 'check_circle' : 'warning'}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary transition-all">
            System Status Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

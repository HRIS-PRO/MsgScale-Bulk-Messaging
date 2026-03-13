
import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, 
  CartesianGrid, Cell, LineChart, Line, PieChart, Pie
} from 'recharts';
import { getAIAnalysis } from '../geminiService';
import { Message } from '../types';

type TabType = 'overview' | 'deliverability' | 'engagement';

const overviewChartData = [
  { name: 'Mon', value: 3000, opacity: 0.3 },
  { name: 'Tue', value: 4500, opacity: 0.5 },
  { name: 'Wed', value: 7000, opacity: 1 },
  { name: 'Thu', value: 4000, opacity: 0.6 },
  { name: 'Fri', value: 3200, opacity: 0.4 },
  { name: 'Sat', value: 6000, opacity: 0.8 },
  { name: 'Sun', value: 4800, opacity: 0.7 },
];

const growthData = [
  { name: '01', new: 40, left: 10 },
  { name: '02', new: 55, left: 5 },
  { name: '03', new: 85, left: 15 },
  { name: '04', new: 60, left: 8 },
  { name: '05', new: 45, left: 20 },
];

const deliverabilityLineData = [
  { name: 'Nov 01', whatsapp: 85, sms: 70 },
  { name: 'Nov 08', whatsapp: 92, sms: 65 },
  { name: 'Nov 15', whatsapp: 88, sms: 75 },
  { name: 'Nov 22', whatsapp: 95, sms: 60 },
  { name: 'Nov 30', whatsapp: 98, sms: 80 },
];

const failureReasonsData = [
  { name: 'Invalid Number', value: 60, color: '#ef4444' },
  { name: 'Network Error', value: 25, color: '#f59e0b' },
  { name: 'Blocked / Opt-out', value: 15, color: '#135bec' },
];

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const hours = Array.from({ length: 24 }, (_, i) => i);

// Generate heatmap data with realistic patterns (higher intensity during mid-day)
const heatmapData = Array.from({ length: 7 }, (_, dIdx) => 
  Array.from({ length: 24 }, (_, hIdx) => {
    // Peak hours 9am - 5pm, slight peaks in early morning
    let base = 0.05;
    if (hIdx >= 9 && hIdx <= 17) base += 0.4 + Math.random() * 0.5;
    if (hIdx >= 18 && hIdx <= 21) base += 0.2 + Math.random() * 0.3;
    if (dIdx >= 5) base *= 0.6; // Weekend dip
    return Math.min(base, 1);
  })
);

const Reports = () => {
  const [activeTab, setActiveTab] = useState<TabType>('engagement');
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: "Hello Alex! I've analyzed your engagement reports. \n\nYour **Open Rate is at 42.4%** with a significant peak in activity on **Wednesdays around 11 AM**. \n\nThe heatmap shows that **mornings** are consistently your highest engagement window. Would you like me to schedule your next blast for Wednesday morning?" 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text?: string) => {
    const query = text || inputValue;
    if (!query.trim()) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const contextData = {
      activeTab,
      engagement: {
        openRate: '42.4%',
        ctr: '12.8%',
        conversion: '3.15%',
        heatmapSummary: 'Peak activity Wednesdays 10AM-2PM'
      }
    };

    try {
      const aiResponse = await getAIAnalysis(query, contextData);
      setMessages(prev => [...prev, { role: 'model', content: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-background-dark overflow-hidden theme-transition font-display">
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 pb-32">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Reports & Analytics</h1>
              <p className="text-[12px] md:text-sm text-slate-500 font-medium">Detailed insights into your audience's interaction behavior.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-1 rounded-xl shadow-sm w-full sm:w-auto overflow-x-auto">
                {(['overview', 'deliverability', 'engagement'] as TabType[]).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                      activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-[#232830] transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Nov 1 - Nov 30, 2023
              </button>
            </div>
          </div>

          {activeTab === 'engagement' && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              {/* Engagement KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Open Rate', value: '42.4%', trend: '↑ 2.1%', vs: 'vs. 40.3% last month', icon: 'mail_lock', color: 'text-green-500' },
                  { label: 'Click-Through Rate (CTR)', value: '12.8%', trend: '↑ 4.5%', vs: 'vs. 8.3% last month', icon: 'ads_click', color: 'text-green-500' },
                  { label: 'Conversion Rate', value: '3.15%', trend: '↓ 0.4%', vs: 'vs. 3.55% last month', icon: 'payments', color: 'text-red-500' },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-slate-200 dark:border-border-dark shadow-sm space-y-3 relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <span className="material-symbols-outlined text-primary/40 text-[20px] group-hover:scale-110 transition-transform">{stat.icon}</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight">{stat.value}</h3>
                      <span className={`text-[11px] font-bold ${stat.color}`}>{stat.trend}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.vs}</p>
                  </div>
                ))}
              </div>

              {/* Engagement Heatmap Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-slate-200 dark:border-border-dark shadow-sm space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Engagement Heatmap</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Most active times of the day (User activity)</p>
                    </div>
                    <button className="p-2 rounded-lg border border-slate-200 dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <span className="material-symbols-outlined text-lg">filter_list</span>
                    </button>
                  </div>

                  <div className="flex gap-4">
                    {/* Day Labels */}
                    <div className="flex flex-col justify-between py-6 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      {days.map(day => <span key={day} className="h-4 flex items-center">{day}</span>)}
                    </div>

                    {/* Heatmap Matrix */}
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-rows-7 gap-1">
                        {heatmapData.map((dayRow, dIdx) => (
                          <div key={dIdx} className="grid grid-cols-24 gap-1">
                            {dayRow.map((intensity, hIdx) => (
                              <div 
                                key={hIdx} 
                                className="aspect-square rounded-[2px] transition-all hover:ring-2 hover:ring-primary hover:z-10 cursor-pointer relative group"
                                style={{ 
                                  backgroundColor: intensity > 0.05 ? `rgba(19, 91, 236, ${intensity})` : 'transparent',
                                  border: intensity <= 0.05 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
                                }}
                              >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                  {intensity > 0 ? Math.round(intensity * 100) : 0}% Active at {hIdx}:00
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Hour Labels */}
                      <div className="flex justify-between px-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span>12am</span>
                        <span>6am</span>
                        <span>12pm</span>
                        <span>6pm</span>
                        <span>11pm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audience Growth Chart */}
                <div className="p-8 rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-slate-200 dark:border-border-dark shadow-sm space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Audience Growth</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">New vs Unsubscribed</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="size-2 rounded-full bg-primary shadow-[0_0_5px_rgba(19,91,236,0.5)]"></span> NEW
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="size-2 rounded-full bg-slate-400 dark:bg-slate-700"></span> LEFT
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={growthData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
                        />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{ fill: 'rgba(19, 91, 236, 0.05)' }}
                          contentStyle={{ backgroundColor: '#0c111d', border: '1px solid #1f2937', borderRadius: '12px' }}
                        />
                        <Bar dataKey="left" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="new" fill="#135bec" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top Performing Table */}
              <div className="bg-white dark:bg-[#1e293b]/30 rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                <div className="px-8 py-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-[#111722]/50">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Top Performing Campaigns</h3>
                  <button className="text-[10px] font-black text-primary uppercase hover:underline">View All Campaigns</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-background-dark/30 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign Name</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Open Rate</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">CTR</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Conv.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-border-dark/50">
                      {[
                        { name: 'Black Friday Early Access', id: 'CMP-90122', type: 'WhatsApp', icon: 'chat', color: 'text-green-500', open: 68.2, ctr: 24.5, conv: 4.2 },
                        { name: 'Winter Collection Launch', id: 'CMP-90135', type: 'Email', icon: 'mail', color: 'text-primary', open: 32.1, ctr: 10.8, conv: 2.1 },
                        { name: 'Abandoned Cart Series', id: 'CMP-90201', type: 'SMS', icon: 'sms', color: 'text-purple-500', open: 92.4, ctr: 15.2, conv: 5.8 },
                      ].map((camp, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 dark:text-white italic">{camp.name}</span>
                              <span className="text-[9px] font-black text-slate-500 uppercase">ID: {camp.id}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <span className={`material-symbols-outlined ${camp.color} text-[18px]`}>{camp.icon}</span>
                              <span className="text-xs font-bold text-slate-500">{camp.type}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-black text-slate-900 dark:text-white italic">{camp.open}%</span>
                              <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${camp.open > 60 ? 'bg-green-500' : 'bg-primary'} rounded-full`} style={{ width: `${camp.open}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 italic">{camp.ctr}%</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black italic">
                              {camp.conv}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deliverability' && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              {/* Deliverability KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Sent', value: '1,284,502', trend: '+12.4%', up: true, icon: 'send', color: 'text-primary' },
                  { label: 'Delivered %', value: '98.2%', trend: 'Target 95%', up: null, icon: 'check_circle', color: 'text-green-500' },
                  { label: 'Bounced %', value: '1.4%', trend: '-0.3%', up: true, icon: 'error_outline', color: 'text-red-500' },
                  { label: 'Spam Reports', value: '0.02%', trend: '+0.01%', up: false, icon: 'report_problem', color: 'text-amber-500' },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <span className={`material-symbols-outlined ${stat.color} text-[20px]`}>{stat.icon}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">{stat.value}</h3>
                      {stat.up !== null && (
                        <span className={`text-[10px] font-bold ${stat.up ? 'text-green-500' : 'text-red-500'}`}>{stat.trend}</span>
                      )}
                      {stat.up === null && <span className="text-[10px] font-bold text-slate-400">{stat.trend}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-slate-200 dark:border-border-dark shadow-sm space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Delivery Rate Over Time</h3>
                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="size-2 rounded-full bg-primary"></div>
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="size-2 rounded-full bg-emerald-500"></div>
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">SMS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={deliverabilityLineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" dark-stroke="#232f48" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                        <Line type="monotone" dataKey="whatsapp" stroke="#135bec" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="sms" stroke="#10b981" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Failure Reasons Pie Chart */}
                <div className="p-8 rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-slate-200 dark:border-border-dark shadow-sm flex flex-col">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8">Failure Reasons</h3>
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={failureReasonsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {failureReasonsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                      <span className="text-2xl font-black text-slate-900 dark:text-white italic">18.2K</span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Fail</span>
                    </div>
                    
                    <div className="w-full space-y-4 mt-8">
                      {failureReasonsData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrier Performance Table */}
              <div className="bg-white dark:bg-[#1e293b]/30 rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                <div className="px-8 py-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-[#111722]/50">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Carrier Performance Breakdown</h3>
                  <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline group">
                    View Full Analysis
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-background-dark/30 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Carrier Provider</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Volume</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Success Rate</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-border-dark/50">
                      {[
                        { name: 'Verizon Wireless', volume: '420,500', rate: 99.2, trend: 'up' },
                        { name: 'AT&T Mobility', volume: '312,200', rate: 98.8, trend: 'flat' },
                        { name: 'T-Mobile US', volume: '255,100', rate: 94.5, trend: 'down' },
                      ].map((carrier, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[20px]">cell_tower</span>
                              </div>
                              <span className="text-sm font-bold text-slate-900 dark:text-white italic">{carrier.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center text-xs font-black text-slate-700 dark:text-slate-300 italic">{carrier.volume}</td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${carrier.rate > 98 ? 'bg-green-500' : 'bg-amber-500'} rounded-full`} style={{ width: `${carrier.rate}%` }}></div>
                              </div>
                              <span className="text-xs font-black italic">{carrier.rate}%</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className={`material-symbols-outlined font-black ${carrier.trend === 'up' ? 'text-green-500' : carrier.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                              {carrier.trend === 'up' ? 'trending_up' : carrier.trend === 'down' ? 'trending_down' : 'trending_flat'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
              {/* Overview Metrics... (Omitted for brevity, existing functionality retained) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Expenses', value: '₦12,450', trend: '+8.2%', color: 'text-green-500' },
                  { label: 'Avg. CTR', value: '4.8%', trend: '-1.2%', color: 'text-red-500' },
                  { label: 'ROI', value: '320%', trend: '+12%', color: 'text-green-500' },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#1e293b]/30 border border-slate-200 dark:border-border-dark shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight">{stat.value}</h3>
                      <span className={`text-[11px] font-bold ${stat.color}`}>{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-[#1e293b]/30 rounded-2xl border border-slate-200 dark:border-border-dark p-8 shadow-sm space-y-8">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">Campaign Performance</h3>
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewChartData}>
                      <CartesianGrid strokeDasharray="0" stroke="#e2e8f0" dark-stroke="#232f48" vertical={false} opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={54}>
                        {overviewChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#135bec" fillOpacity={entry.opacity} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Analyst Chat Sidebar */}
      <aside className={`${isAiPanelOpen ? 'w-[420px]' : 'w-0'} hidden xl:flex flex-col border-l border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] shrink-0 h-full shadow-2xl z-20 theme-transition relative transition-all duration-300`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
          className={`absolute top-1/2 -left-4 -translate-y-1/2 size-8 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-lg z-50 ${isAiPanelOpen ? '' : 'rotate-180'}`}
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>

        <div className={`${isAiPanelOpen ? 'opacity-100' : 'opacity-0'} flex flex-col h-full transition-opacity duration-200 overflow-hidden`}>
          {/* Chat Header */}
          <div className="p-5 border-b border-slate-200 dark:border-border-dark flex items-center justify-between bg-slate-50 dark:bg-surface-dark/40 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">AI Analyst</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Insights Engine</p>
              </div>
            </div>
            <button 
              onClick={() => setMessages([{ role: 'model', content: "Context reset. How can I help you analyze your data today?" }])}
              className="p-2 rounded-lg text-slate-500 hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-[#0c1016]">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-[fadeIn_0.3s_ease-out]`}>
                <div className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center border shadow-sm ${
                  m.role === 'model' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-primary border-primary text-white'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">{m.role === 'model' ? 'smart_toy' : 'person'}</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'model' 
                      ? 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 rounded-tl-none' 
                      : 'bg-primary text-white rounded-tr-none'
                  }`}>
                    <div className="whitespace-pre-wrap font-medium">
                      {m.content.split('**').map((part, idx) => 
                        idx % 2 === 1 ? <strong key={idx} className="text-primary dark:text-indigo-400">{part}</strong> : part
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                </div>
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <div className="size-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="size-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                  <div className="size-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-5 bg-white dark:bg-surface-dark/50 border-t border-slate-200 dark:border-border-dark backdrop-blur-md">
            <div className="relative group">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full pl-5 pr-14 py-4 rounded-2xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-[#111722] text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Ask for deeper analysis..."
              />
              <button 
                onClick={() => handleSend()}
                disabled={isTyping}
                className="absolute right-2.5 top-2.5 p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Reports;

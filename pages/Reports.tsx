
import React, { useMemo, useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { Icons } from '../constants';
import { useData } from '../DataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Reports: React.FC = () => {
  const { payments, expenses, stats } = useData();
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'PDF',
    range: 'last-30',
    includeCharts: true,
    includeDetails: true
  });

  const monthLabels = useMemo(() => {
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); 
      d.setMonth(d.getMonth() - i);
      labels.push({
        label: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear()
      });
    }
    return labels;
  }, []);

  const trendData = useMemo(() => {
    return monthLabels.map(({ label, month, year }) => {
      const monthIncome = payments
        .filter(p => {
          const pDate = new Date(p.date);
          return pDate.getMonth() === month && pDate.getFullYear() === year && p.status === 'Paid';
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const monthExp = expenses
        .filter(e => {
          const eDate = new Date(e.date);
          return eDate.getMonth() === month && eDate.getFullYear() === year && e.status === 'Paid';
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return { month: label, income: monthIncome, expenses: monthExp };
    });
  }, [payments, expenses, monthLabels]);

  const pieData = useMemo(() => {
    const data = [
      { name: 'Income', value: stats.totalIncome },
      { name: 'Expenses', value: stats.totalExpenses },
    ].filter(d => d.value > 0);
    return data;
  }, [stats]);

  const COLORS = ['#10B981', '#EF4444'];
  const hasData = trendData.some(d => d.income > 0 || d.expenses > 0);

  const handleExport = () => {
    alert(`Exporting ${exportConfig.format} report for ${exportConfig.range}...`);
    setExportModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Financial Analytics</h2>
          <p className="text-sm text-brand-textSecondary">Real-time performance metrics</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setExportModalOpen(true)} variant="secondary" className="flex-1 sm:flex-initial text-sm">
            <Icons.Reports /> Export & Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Revenue vs Expenses Trend">
          <div className="w-full h-80 min-h-[300px]">
            {!hasData ? (
              <div className="h-full flex flex-col items-center justify-center text-brand-textSecondary border-2 border-dashed border-gray-100 rounded-lg">
                <Icons.Reports />
                <p className="mt-2 font-bold">No transaction data available yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`AED ${val}`, '']}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Financial Distribution">
          <div className="w-full h-80 min-h-[300px] flex flex-col items-center justify-center">
            {pieData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-brand-textSecondary text-center">
                <div className="w-24 h-24 rounded-full border-4 border-gray-100 flex items-center justify-center text-lg font-black">0%</div>
                <p className="mt-4 font-bold">Waiting for entries...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `AED ${val}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-wrap gap-4 mt-2 text-xs font-black justify-center">
               {pieData.map((d, i) => (
                 <div key={d.name} className="flex items-center gap-1">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                   <span>{d.name} (AED {d.value.toLocaleString()})</span>
                 </div>
               ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-black text-brand-sidebar">Export Customizer</h3>
                <button onClick={() => setExportModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Icons.Close /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">REPORT FORMAT</label>
                  <div className="flex gap-4">
                    <button onClick={() => setExportConfig({...exportConfig, format: 'PDF'})} className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${exportConfig.format === 'PDF' ? 'border-brand-secondary bg-blue-50 text-brand-secondary' : 'border-gray-100 text-gray-400'}`}>PDF</button>
                    <button onClick={() => setExportConfig({...exportConfig, format: 'CSV'})} className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${exportConfig.format === 'CSV' ? 'border-brand-secondary bg-blue-50 text-brand-secondary' : 'border-gray-100 text-gray-400'}`}>CSV</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">TIME RANGE</label>
                  <select 
                    value={exportConfig.range}
                    onChange={(e) => setExportConfig({...exportConfig, range: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 font-bold outline-none focus:border-brand-secondary"
                  >
                    <option value="today">Today Only</option>
                    <option value="last-7">Last 7 Days</option>
                    <option value="last-30">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={exportConfig.includeCharts} onChange={(e) => setExportConfig({...exportConfig, includeCharts: e.target.checked})} className="w-5 h-5 rounded text-brand-secondary" />
                    <span className="text-sm font-bold text-gray-700">Include Analytics Charts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={exportConfig.includeDetails} onChange={(e) => setExportConfig({...exportConfig, includeDetails: e.target.checked})} className="w-5 h-5 rounded text-brand-secondary" />
                    <span className="text-sm font-bold text-gray-700">Include Line-Item Details</span>
                  </label>
                </div>

                <div className="pt-4 flex gap-4">
                   <button onClick={() => setExportModalOpen(false)} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Cancel</button>
                   <Button onClick={handleExport} className="flex-1 h-12 shadow-xl">Generate Report</Button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

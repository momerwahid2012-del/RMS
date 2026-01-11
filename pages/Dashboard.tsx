
import React from 'react';
import { Card, Badge } from '../components/UI';
import { useData } from '../DataContext';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const SummaryCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
  <Card className="flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer">
    <div className={`p-3 md:p-4 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600 shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs md:text-sm font-medium text-brand-textSecondary truncate">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-brand-textPrimary truncate">{value}</p>
    </div>
  </Card>
);

export const Dashboard: React.FC = () => {
  const { stats, payments, expenses } = useData();

  const chartData = [
    { name: 'Income', amount: stats.totalIncome },
    { name: 'Expenses', amount: stats.totalExpenses },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard 
          title="Total Rooms" 
          value={stats.totalRooms} 
          color="bg-blue-500"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <SummaryCard 
          title="Total Tenants" 
          value={stats.totalTenants} 
          color="bg-purple-500"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <SummaryCard 
          title="Monthly Income" 
          value={`AED ${stats.totalIncome.toLocaleString()}`} 
          color="bg-green-500"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <SummaryCard 
          title="Monthly Expenses" 
          value={`AED ${stats.totalExpenses.toLocaleString()}`} 
          color="bg-red-500"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Financial Performance Overview">
          <div className="w-full h-80 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`AED ${value}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Activity">
           <div className="space-y-4">
             {payments.length === 0 && expenses.length === 0 ? (
               <div className="text-center py-10 text-brand-textSecondary">
                 <p>No recent activity found.</p>
                 <p className="text-xs">Entries added by Admin will appear here.</p>
               </div>
             ) : (
               [...payments, ...expenses].sort((a,b) => b.id.localeCompare(a.id)).slice(0, 5).map((item: any) => (
                 <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold">{item.tenant || item.title}</p>
                      <p className="text-xs text-brand-textSecondary">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${'tenant' in item ? 'text-brand-success' : 'text-brand-error'}`}>
                        {'tenant' in item ? '+' : '-'}AED {item.amount}
                      </p>
                      <Badge status={item.status} />
                    </div>
                 </div>
               ))
             )}
           </div>
        </Card>
      </div>
    </div>
  );
};

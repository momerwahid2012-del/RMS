
import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Input } from '../components/UI';
import { useData } from '../DataContext';
import { Expense } from '../types';

export const Expenses: React.FC = () => {
  const { expenses, addExpense } = useData();
  const [newExp, setNewExp] = useState<Partial<Expense>>({
    property: '',
    unit: '',
    title: '',
    amount: 0,
    paidBy: 'System', 
    status: 'Paid',   
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense(newExp as Omit<Expense, 'id'>);
    setNewExp({
      property: '',
      unit: '',
      title: '',
      amount: 0,
      paidBy: 'System',
      status: 'Paid',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const groupedExpenses = useMemo(() => {
    const sorted = [...expenses].sort((a,b) => b.date.localeCompare(a.date));
    const groups: { [key: string]: Expense[] } = {};
    sorted.forEach(exp => {
      const monthYear = new Date(exp.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(exp);
    });
    return groups;
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Add New Expense">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="PROPERTY" 
              placeholder="Enter building or property name" 
              value={newExp.property}
              onChange={(e) => setNewExp({...newExp, property: e.target.value})}
              required
            />
            <Input 
              label="Room/Unit" 
              placeholder="e.g. K6" 
              value={newExp.unit}
              onChange={(e) => setNewExp({...newExp, unit: e.target.value})}
              required
            />
            <Input 
              label="Expense Title" 
              placeholder="Gas, repair, etc." 
              value={newExp.title}
              onChange={(e) => setNewExp({...newExp, title: e.target.value})}
              required
            />
            <Input 
              label="Amount (AED)" 
              type="number" 
              placeholder="0.00" 
              value={newExp.amount}
              onChange={(e) => setNewExp({...newExp, amount: Number(e.target.value)})}
              required
            />
            <Input 
              label="Date" 
              type="date"
              value={newExp.date}
              onChange={(e) => setNewExp({...newExp, date: e.target.value})}
              required
            />
            
            <Button type="submit" className="w-full h-14 font-black uppercase tracking-widest shadow-xl">Submit Expense</Button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {Object.keys(groupedExpenses).length === 0 ? (
          <Card title="Expense History">
             <div className="text-center py-20 text-gray-400 font-medium italic">No expense records found.</div>
          </Card>
        ) : (
          (Object.entries(groupedExpenses) as [string, Expense[]][]).map(([monthYear, exps]) => (
            <Card key={monthYear} title={monthYear}>
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Unit</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Title</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Amount</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-borderColor">
                    {exps.map(exp => (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-bold text-brand-sidebar">{exp.property} / {exp.unit}</td>
                        <td className="px-4 py-4 text-sm text-brand-textSecondary">{exp.title}</td>
                        <td className="px-4 py-4 text-sm font-black text-brand-error text-right">AED {exp.amount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-xs font-medium text-brand-textSecondary text-center">{exp.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

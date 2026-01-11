
import React, { useState } from 'react';
import { Card, Badge, Input, Button, Select } from '../components/UI';
import { useData } from '../DataContext';
import { Icons } from '../constants';
import { Payment } from '../types';

export const Payments: React.FC = () => {
  const { payments, tenants, addPayment } = useData();
  const [newPayment, setNewPayment] = useState({ 
    tenant: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const tenantObj = tenants.find(t => t.name === newPayment.tenant);
    addPayment({
      tenant: newPayment.tenant,
      room: tenantObj ? tenantObj.room : 'N/A',
      amount: Number(newPayment.amount),
      date: newPayment.date,
      status: 'Paid' // Automatically set to Paid as requested
    });
    setNewPayment({ tenant: '', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Record New Payment" className="lg:col-span-1">
          <form onSubmit={handleAddPayment} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-brand-textSecondary uppercase tracking-widest">Tenant*</label>
              <select 
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary bg-white font-medium"
                required
                value={newPayment.tenant}
                onChange={(e) => setNewPayment({...newPayment, tenant: e.target.value})}
              >
                <option value="">Select Tenant</option>
                {tenants.map(t => <option key={t.id} value={t.name}>{t.name} ({t.room})</option>)}
              </select>
            </div>
            <Input 
              label="Amount (AED)" 
              type="number" 
              required 
              value={newPayment.amount}
              onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
            />
            <Input 
              label="Date" 
              type="date" 
              required 
              value={newPayment.date}
              onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
            />
            <Button type="submit" className="w-full h-12 shadow-lg">Record Payment</Button>
          </form>
        </Card>

        <Card title="Payment History" className="lg:col-span-2">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderColor">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-brand-textSecondary">No payments recorded yet.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold">{p.tenant}</td>
                      <td className="px-6 py-4 text-sm text-brand-textSecondary">{p.room}</td>
                      <td className="px-6 py-4 text-sm font-black text-brand-success">AED {p.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-brand-textSecondary">{p.date}</td>
                      <td className="px-6 py-4"><Badge status={p.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

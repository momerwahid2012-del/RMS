
import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Icons } from '../constants';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import { Tenant } from '../types';

export const Tenants: React.FC = () => {
  const { tenants, rooms, addTenant, updateTenant, deleteTenant, bulkDeleteTenants } = useData();
  const { role } = useAuth();
  const isAdmin = role === 'Admin';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newTenant, setNewTenant] = useState<Omit<Tenant, 'id'>>({ name: '', room: '', phone: '', moveInDate: '', status: 'Active' });

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    addTenant(newTenant);
    setIsModalOpen(false);
    setNewTenant({ name: '', room: '', phone: '', moveInDate: '', status: 'Active' });
  };

  const handleRemove = (id: string) => {
    if (confirm('Permanently remove this tenant from the system?')) {
      deleteTenant(id);
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkRemove = () => {
    if (confirm(`Permanently remove ${selectedIds.length} tenants?`)) {
      bulkDeleteTenants(selectedIds);
      setSelectedIds([]);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Input 
            label="" 
            placeholder="Search by name or room..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Icons.Plus /> Register Tenant
            </Button>
          )}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-brand-error p-4 rounded-xl flex items-center justify-between text-white animate-in slide-in-from-top-4 duration-300">
          <span className="font-bold">{selectedIds.length} tenants selected for bulk removal</span>
          <div className="flex gap-2">
            <button onClick={handleBulkRemove} className="px-4 py-1 bg-white/20 rounded-lg text-sm font-bold hover:bg-white/30">Bulk Remove</button>
            <button onClick={() => setSelectedIds([])} className="px-4 py-1 text-sm opacity-70 hover:opacity-100">Cancel</button>
          </div>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 w-10"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? tenants.map(t => t.id) : [])} checked={selectedIds.length === tenants.length && tenants.length > 0} className="w-4 h-4 rounded text-brand-secondary" /></th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tenant Name</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Room</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Move-in</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-borderColor">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(tenant.id)} onChange={() => setSelectedIds(prev => prev.includes(tenant.id) ? prev.filter(i => i !== tenant.id) : [...prev, tenant.id])} className="w-4 h-4 rounded text-brand-secondary" /></td>
                  <td className="px-6 py-4 text-sm font-semibold">{tenant.name}</td>
                  <td className="px-6 py-4 text-sm font-black text-brand-secondary text-center">{tenant.room}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{tenant.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{tenant.moveInDate}</td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button onClick={() => setViewTenant(tenant)} className="text-brand-secondary font-bold text-sm hover:underline">View</button>
                    {isAdmin && <button onClick={() => handleRemove(tenant.id)} className="text-brand-error font-bold text-sm hover:underline">Remove</button>}
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium italic">No tenants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Tenant Modal */}
      {viewTenant && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">Tenant Profile</h3>
                <button onClick={() => setViewTenant(null)} className="p-2 hover:bg-gray-100 rounded-full"><Icons.Close /></button>
             </div>
             <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border">
                  <div className="w-14 h-14 bg-brand-secondary text-white rounded-2xl flex items-center justify-center font-black text-xl">{viewTenant.name[0]}</div>
                  <div>
                    <p className="font-black text-lg">{viewTenant.name}</p>
                    <p className="text-brand-secondary font-bold">Room {viewTenant.room}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50/50 rounded-xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-brand-sidebar">{viewTenant.phone}</p>
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Move-in Date</p>
                    <p className="font-bold text-brand-sidebar">{viewTenant.moveInDate}</p>
                  </div>
                </div>
                <Button onClick={() => setViewTenant(null)} className="w-full py-4 h-auto text-xs font-black tracking-widest">Close Profile</Button>
             </div>
          </div>
        </div>
      )}

      {/* Register Tenant Modal */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Register Tenant</h2>
              <button onClick={() => setIsModalOpen(false)}><Icons.Close /></button>
            </div>
            <form onSubmit={handleAddTenant} className="p-6 space-y-4">
              <Input label="Full Name" placeholder="Full name" required value={newTenant.name} onChange={(e) => setNewTenant({...newTenant, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium text-brand-textSecondary">Room*</label>
                  <select required value={newTenant.room} onChange={(e) => setNewTenant({...newTenant, room: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-md bg-white font-bold">
                    <option value="">Select Room</option>
                    {rooms.map(r => <option key={r.id} value={r.roomNumber}>{r.roomNumber}</option>)}
                  </select>
                </div>
                <Input label="Move-in Date" type="date" required value={newTenant.moveInDate} onChange={(e) => setNewTenant({...newTenant, moveInDate: e.target.value})} />
              </div>
              <Input label="Phone Number" placeholder="+971..." required value={newTenant.phone} onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})} />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Add Tenant</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

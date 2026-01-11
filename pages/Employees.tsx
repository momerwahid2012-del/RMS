
import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../components/UI';
import { Icons } from '../constants';
import { useData } from '../DataContext';
import { Employee, EmployeePermissions } from '../types';

export const Employees: React.FC = () => {
  const { employees, rooms, addEmployee, updateEmployee, deleteEmployee, bulkToggleEmployeeStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    status: 'Active',
    assignedRoomIds: [],
    permissions: {
      rooms: { view: true, add: false, edit: false, delete: false },
      tenants: { view: true, add: false, edit: false, delete: false },
      payments: { view: true, add: false, edit: false, delete: false },
      expenses: { view: true, add: false, edit: false, delete: false },
    }
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      username: '', name: '', email: '', password: '', role: 'Employee', status: 'Active',
      assignedRoomIds: [],
      permissions: {
        rooms: { view: true, add: false, edit: false, delete: false },
        tenants: { view: true, add: false, edit: false, delete: false },
        payments: { view: true, add: false, edit: false, delete: false },
        expenses: { view: true, add: false, edit: false, delete: false },
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  const handleTogglePerm = (module: keyof EmployeePermissions, action: keyof EmployeePermissions['rooms']) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module][action]
        }
      }
    }));
  };

  const handleToggleRoom = (roomId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedRoomIds: prev.assignedRoomIds.includes(roomId)
        ? prev.assignedRoomIds.filter(id => id !== roomId)
        : [...prev.assignedRoomIds, roomId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp) {
      updateEmployee({ ...formData, id: editingEmp.id });
    } else {
      addEmployee(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently remove this employee account? This action cannot be undone.')) {
      deleteEmployee(id);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatus = (status: 'Active' | 'Inactive') => {
    bulkToggleEmployeeStatus(selectedIds, status);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-brand-textPrimary">Employees & Access</h2>
          <p className="text-sm text-brand-textSecondary">Manage system accounts and granular permissions.</p>
        </div>
        <Button onClick={handleOpenAdd}><Icons.Plus /> Add Employee</Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-brand-secondary p-4 rounded-xl flex items-center justify-between text-white animate-in slide-in-from-top-4 duration-300">
          <span className="font-bold">{selectedIds.length} employees selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkStatus('Active')} className="px-4 py-1 bg-white/20 rounded-lg text-sm font-bold hover:bg-white/30">Set Active</button>
            <button onClick={() => handleBulkStatus('Inactive')} className="px-4 py-1 bg-white/20 rounded-lg text-sm font-bold hover:bg-white/30">Set Inactive</button>
            <button onClick={() => setSelectedIds([])} className="px-4 py-1 text-sm opacity-70 hover:opacity-100">Cancel</button>
          </div>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 w-10"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? employees.map(emp => emp.id) : [])} checked={selectedIds.length === employees.length && employees.length > 0} className="w-4 h-4 rounded text-brand-secondary" /></th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Rooms</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-borderColor">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(emp.id)} onChange={() => toggleSelect(emp.id)} className="w-4 h-4 rounded text-brand-secondary" /></td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-secondary">@{emp.username}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {emp.assignedRoomIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {emp.assignedRoomIds.map(rid => {
                          const r = rooms.find(room => room.id === rid);
                          return <span key={rid} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">#{r?.roomNumber || rid}</span>;
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-300 italic text-xs">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center"><Badge status={emp.status} /></td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => handleOpenEdit(emp)} className="text-brand-secondary font-bold mr-4 text-sm hover:underline">Edit Details</button>
                    <button onClick={() => handleDelete(emp.id)} className="text-brand-error text-sm font-bold hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">No employees registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-black">{editingEmp ? 'Employee Profile' : 'New Employee'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><Icons.Close /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <Input label="FULL NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <Input label="USERNAME" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                <Input label="EMAIL ADDRESS" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <Input label="PASSWORD" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ASSIGNED ROOMS (GRANULAR ACCESS)</label>
                <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                   <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto custom-scrollbar flex flex-col">
                     {rooms.map(room => {
                       const isAssigned = formData.assignedRoomIds.includes(room.id);
                       return (
                         <div key={room.id} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                           <span className="font-bold text-sm text-brand-sidebar uppercase tracking-tight">Room {room.roomNumber}</span>
                           <button 
                             type="button" 
                             onClick={() => handleToggleRoom(room.id)}
                             className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 transform active:scale-95 ${
                               isAssigned 
                                 ? 'bg-brand-success text-white shadow-lg shadow-green-100' 
                                 : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                             }`}
                           >
                             {isAssigned ? 'On' : 'Off'}
                           </button>
                         </div>
                       );
                     })}
                   </div>
                   {rooms.length === 0 && <p className="p-8 text-center text-xs text-gray-400 italic font-medium">No rooms available. Please create rooms first.</p>}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ACCESS OPPORTUNITIES (PERMISSIONS)</label>
                <div className="grid grid-cols-1 gap-4">
                  {(Object.keys(formData.permissions) as Array<keyof EmployeePermissions>).map(module => (
                    <div key={module} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <span className="font-bold text-sm uppercase tracking-tight w-24 text-brand-sidebar">{module}</span>
                      <div className="flex gap-4 flex-wrap">
                        {['view', 'add', 'edit', 'delete'].map(action => (
                          <label key={action} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.permissions[module][action as keyof EmployeePermissions['rooms']]} 
                              onChange={() => handleTogglePerm(module, action as keyof EmployeePermissions['rooms'])}
                              className="w-5 h-5 rounded text-brand-secondary border-gray-300 focus:ring-brand-secondary"
                            />
                            <span className="text-xs font-bold text-gray-400 group-hover:text-brand-secondary transition-colors uppercase tracking-wider">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white shadow-[0_-20px_20px_-10px_white]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-brand-secondary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

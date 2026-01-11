
import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Input } from '../components/UI';
import { Icons } from '../constants';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import { Room, RoomStatus } from '../types';

export const Rooms: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, currentEmployee } = useData();
  const { role } = useAuth();
  const isAdmin = role === 'Admin';
  
  // Granular Access Logic
  const displayRooms = useMemo(() => {
    if (isAdmin) return rooms;
    // For employees, we filter based on assignedRoomIds if they have 'view' permission.
    // Actually, common PRMS behavior: filter the list to only show assigned units.
    if (currentEmployee?.permissions.rooms.view) {
      return rooms.filter(r => currentEmployee.assignedRoomIds.includes(r.id));
    }
    return [];
  }, [rooms, isAdmin, currentEmployee]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    rent: '0',
    monthlyExpenses: '0',
    status: RoomStatus.AVAILABLE,
    building: '',
    floor: '',
    occStart: '',
    occEnd: '',
    occOpenEnded: false,
    maintCost: '0',
    maintDate: '',
    resStart: '',
    resEnd: '',
    resOpenEnded: false,
    resTenantName: '',
    resTenantPhone: '',
    images: [] as string[]
  });

  const handleOpenAdd = () => {
    if (!isAdmin && !currentEmployee?.permissions.rooms.add) return;
    setEditingRoom(null);
    setFormData({
      roomNumber: '', rent: '0', monthlyExpenses: '0', status: RoomStatus.AVAILABLE,
      building: '', floor: '', occStart: '', occEnd: '', occOpenEnded: false,
      maintCost: '0', maintDate: '', resStart: '', resEnd: '', resOpenEnded: false,
      resTenantName: '', resTenantPhone: '', images: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    // Check if employee has edit rights for this specific room
    const canEdit = isAdmin || (currentEmployee?.permissions.rooms.edit && currentEmployee.assignedRoomIds.includes(room.id));
    if (!canEdit) return;

    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      rent: room.rent.toString(),
      monthlyExpenses: room.monthlyExpenses?.toString() || '0',
      status: room.status,
      building: room.building || '',
      floor: room.floor || '',
      occStart: room.occupancy?.startDate || '',
      occEnd: room.occupancy?.endDate || '',
      occOpenEnded: room.occupancy?.isOpenEnded || false,
      maintCost: room.maintenance?.cost.toString() || '0',
      maintDate: room.maintenance?.date || '',
      resStart: room.preBooking?.startDate || '',
      resEnd: room.preBooking?.endDate || '',
      resOpenEnded: room.preBooking?.endDate === '' && room.preBooking?.startDate !== '',
      resTenantName: room.preBooking?.tenantName || '',
      resTenantPhone: room.preBooking?.tenantPhone || '',
      images: room.images || []
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this room? This cannot be undone.')) {
      deleteRoom(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoomData: Omit<Room, 'id'> = {
      roomNumber: formData.roomNumber,
      type: 'N/A', 
      rent: Number(formData.rent),
      monthlyExpenses: Number(formData.monthlyExpenses),
      status: formData.status,
      building: formData.building,
      floor: formData.floor,
      images: formData.images,
      occupancy: formData.status === RoomStatus.OCCUPIED ? {
        startDate: formData.occStart, 
        endDate: formData.occOpenEnded ? '' : formData.occEnd, 
        isOpenEnded: formData.occOpenEnded,
      } : undefined,
      maintenance: formData.status === RoomStatus.MAINTENANCE ? {
        cost: Number(formData.maintCost), date: formData.maintDate,
      } : undefined,
      preBooking: formData.status === RoomStatus.RESERVED ? {
        startDate: formData.resStart, 
        endDate: formData.resOpenEnded ? '' : formData.resEnd,
        tenantName: formData.resTenantName,
        tenantPhone: formData.resTenantPhone
      } : undefined,
    };

    if (editingRoom) {
      updateRoom({ ...finalRoomData, id: editingRoom.id });
    } else {
      addRoom(finalRoomData);
    }
    setIsModalOpen(false);
  };

  const projection = Number(formData.rent) - Number(formData.monthlyExpenses);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-brand-textSecondary">
          {isAdmin ? `Total: ${rooms.length} Rooms` : `Your Assigned Rooms: ${displayRooms.length}`}
        </h3>
        {(isAdmin || currentEmployee?.permissions.rooms.add) && (
          <Button onClick={handleOpenAdd}>
            <Icons.Plus /> Add Room
          </Button>
        )}
      </div>

      <Card className="hidden md:block">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b border-brand-borderColor">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Room #</th>
                <th className="px-6 py-3 text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Rent (AED)</th>
                <th className="px-6 py-3 text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Building/Floor</th>
                <th className="px-6 py-3 text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-borderColor">
              {displayRooms.map((room, idx) => {
                const canEdit = isAdmin || (currentEmployee?.permissions.rooms.edit && currentEmployee.assignedRoomIds.includes(room.id));
                const canDelete = isAdmin || (currentEmployee?.permissions.rooms.delete && currentEmployee.assignedRoomIds.includes(room.id));
                
                return (
                  <tr key={room.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors group`}>
                    <td className="px-6 py-4 text-sm font-semibold text-brand-textPrimary whitespace-nowrap">
                      <div className="flex items-center gap-3">
                         {room.images && room.images.length > 0 ? (
                           <img src={room.images[0]} className="w-10 h-10 rounded-lg object-cover border shadow-sm" alt="Room" />
                         ) : (
                           <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                             <Icons.Rooms />
                           </div>
                         )}
                         {room.roomNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">AED {room.rent.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={room.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-textSecondary whitespace-nowrap">
                      {room.building || '-'}{room.floor ? ` / ${room.floor}` : ''}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      {canEdit && (
                        <button onClick={() => handleOpenEdit(room)} className="text-brand-secondary hover:text-blue-800 font-bold mr-6">Edit</button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={(e) => handleDelete(e, room.id)} 
                          className="text-brand-error hover:text-red-700 font-bold"
                        >
                          Delete
                        </button>
                      )}
                      {!canEdit && !canDelete && <span className="text-gray-300 italic text-xs">View Only</span>}
                    </td>
                  </tr>
                );
              })}
              {displayRooms.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-brand-textSecondary">
                    No rooms found. {isAdmin ? 'Add your first room.' : 'You are not assigned to any rooms.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {displayRooms.map(room => {
          const canEdit = isAdmin || (currentEmployee?.permissions.rooms.edit && currentEmployee.assignedRoomIds.includes(room.id));
          const canDelete = isAdmin || (currentEmployee?.permissions.rooms.delete && currentEmployee.assignedRoomIds.includes(room.id));
          
          return (
            <Card key={room.id} className="relative overflow-hidden group">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden border">
                    {room.images && room.images.length > 0 ? (
                      <img src={room.images[0]} className="w-full h-full object-cover" alt="Room" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Icons.Rooms />
                      </div>
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xl text-brand-sidebar">Room {room.roomNumber}</h4>
                    <p className="text-xs text-brand-textSecondary truncate">{room.building || 'No Building'} • {room.floor || 'No Floor'}</p>
                 </div>
                 <div className="shrink-0">
                    <Badge status={room.status} />
                 </div>
               </div>
               <div className="flex justify-between items-end border-t pt-4">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Rent</p>
                    <p className="font-bold text-brand-secondary text-lg">AED {room.rent.toLocaleString()}</p>
                 </div>
                 <div className="flex gap-3">
                   {canEdit && <button onClick={() => handleOpenEdit(room)} className="p-2 bg-blue-50 text-brand-secondary rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>}
                   {canDelete && <button onClick={(e) => handleDelete(e, room.id)} className="p-2 bg-red-50 text-brand-error rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>}
                 </div>
               </div>
            </Card>
          );
        })}
        {displayRooms.length === 0 && <p className="text-center py-10 text-gray-400 italic">No rooms assigned to you.</p>}
      </div>

      {(isAdmin || currentEmployee?.permissions.rooms.add || currentEmployee?.permissions.rooms.edit) && isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-auto max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10 shadow-sm">
              <h2 className="text-2xl font-black text-brand-sidebar">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Icons.Close />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="ROOM NUMBER" placeholder="e.g. 101" required value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                <Input label="MONTHLY EXPENSES (AED)" type="number" value={formData.monthlyExpenses} onChange={(e) => setFormData({...formData, monthlyExpenses: e.target.value})} />
                <Input label="MONTHLY RENT (AED)" type="number" value={formData.rent} onChange={(e) => setFormData({...formData, rent: e.target.value})} />
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-bold text-brand-textSecondary uppercase tracking-wider">STATUS</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as RoomStatus})} className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-brand-textPrimary font-bold focus:ring-2 focus:ring-brand-secondary">
                    <option value={RoomStatus.AVAILABLE}>Available</option>
                    <option value={RoomStatus.OCCUPIED}>Occupied</option>
                    <option value={RoomStatus.MAINTENANCE}>Maintenance</option>
                    <option value={RoomStatus.RESERVED}>Reserved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-brand-textSecondary uppercase tracking-wider flex items-center gap-2">
                  ROOM IMAGES <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Real Upload</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 group">
                      <img src={img} className="w-full h-full object-cover rounded-xl border-2 border-brand-borderColor shadow-sm" alt="Room" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-brand-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Icons.Close />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-brand-secondary transition-all">
                    <Icons.Plus />
                    <span className="text-[10px] font-bold mt-1 text-gray-400">ADD IMAGE</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="bg-[#0F172A] rounded-2xl p-6 flex justify-between items-center text-white shadow-inner">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">FINANCIAL PROJECTION</p>
                  <p className={`text-3xl font-black ${projection >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
                    {projection >= 0 ? '+' : ''}AED {projection.toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-xs font-medium space-y-1">
                  <p className="text-brand-success">Rent: +{Number(formData.rent).toLocaleString()}</p>
                  <p className="text-brand-error">Exp: -{Number(formData.monthlyExpenses).toLocaleString()}</p>
                </div>
              </div>

              {/* Conditional Panels */}
              {formData.status === RoomStatus.OCCUPIED && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p className="text-blue-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <Icons.Tenants /> OCCUPANCY DETAILS
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="START DATE" type="date" value={formData.occStart} onChange={(e) => setFormData({...formData, occStart: e.target.value})} />
                    {!formData.occOpenEnded && (
                      <Input label="END DATE" type="date" value={formData.occEnd} onChange={(e) => setFormData({...formData, occEnd: e.target.value})} />
                    )}
                  </div>
                  <label className="flex items-center gap-3 p-3 bg-white bg-opacity-50 rounded-lg cursor-pointer hover:bg-white transition-colors">
                    <input type="checkbox" checked={formData.occOpenEnded} onChange={(e) => setFormData({...formData, occOpenEnded: e.target.checked})} className="w-5 h-5 rounded-md text-brand-secondary border-gray-300 focus:ring-brand-secondary" />
                    <span className="text-sm font-bold text-brand-sidebar">Open-Ended Stay (No fixed end date)</span>
                  </label>
                </div>
              )}

              {formData.status === RoomStatus.RESERVED && (
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p className="text-purple-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    📅 RESERVATION & TENANT INFO
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="TENANT NAME" placeholder="Full name" value={formData.resTenantName} onChange={(e) => setFormData({...formData, resTenantName: e.target.value})} />
                     <Input label="PHONE" placeholder="+971..." value={formData.resTenantPhone} onChange={(e) => setFormData({...formData, resTenantPhone: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-purple-100 pt-4">
                    <Input label="BOOKING START" type="date" value={formData.resStart} onChange={(e) => setFormData({...formData, resStart: e.target.value})} />
                    {!formData.resOpenEnded && (
                      <Input label="BOOKING END" type="date" value={formData.resEnd} onChange={(e) => setFormData({...formData, resEnd: e.target.value})} />
                    )}
                  </div>
                  <label className="flex items-center gap-3 p-3 bg-white bg-opacity-50 rounded-lg cursor-pointer hover:bg-white transition-colors">
                    <input type="checkbox" checked={formData.resOpenEnded} onChange={(e) => setFormData({...formData, resOpenEnded: e.target.checked})} className="w-5 h-5 rounded-md text-brand-secondary border-gray-300 focus:ring-brand-secondary" />
                    <span className="text-sm font-bold text-brand-sidebar">Open-Ended Reservation</span>
                  </label>
                </div>
              )}

              {formData.status === RoomStatus.MAINTENANCE && (
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p className="text-orange-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">🛠 MAINTENANCE TASK</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="ESTIMATED COST (AED)" type="number" value={formData.maintCost} onChange={(e) => setFormData({...formData, maintCost: e.target.value})} />
                    <Input label="COMPLETION DATE" type="date" value={formData.maintDate} onChange={(e) => setFormData({...formData, maintDate: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <Input label="BUILDING" placeholder="e.g. Delta Building" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
                <Input label="FLOOR" placeholder="e.g. 8th Floor" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white shadow-[0_-20px_20px_-10px_rgba(255,255,255,1)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-200 font-black text-brand-textPrimary hover:bg-gray-50 transition-colors uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 px-6 rounded-2xl bg-brand-secondary hover:bg-brand-primary text-white font-black transition-all shadow-xl uppercase tracking-widest text-xs">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

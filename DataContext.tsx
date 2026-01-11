
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Room, Tenant, Payment, Expense, Employee, RoomStatus, AppNotification, Property, EmployeePermissions } from './types';
import { useAuth } from './AuthContext';

interface DataContextType {
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
  expenses: Expense[];
  employees: Employee[];
  properties: Property[];
  notifications: AppNotification[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  updateTenant: (tenant: Tenant) => void;
  deleteTenant: (id: string) => void;
  bulkDeleteTenants: (ids: string[]) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  toggleEmployeeStatus: (id: string) => void;
  bulkToggleEmployeeStatus: (ids: string[], status: 'Active' | 'Inactive') => void;
  clearNotification: (id: string) => void;
  stats: {
    totalRooms: number;
    totalTenants: number;
    totalIncome: number;
    totalExpenses: number;
  };
  currentEmployee: Employee | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_PERMISSIONS: EmployeePermissions = {
  rooms: { view: true, add: false, edit: false, delete: false },
  tenants: { view: true, add: false, edit: false, delete: false },
  payments: { view: true, add: false, edit: false, delete: false },
  expenses: { view: true, add: false, edit: false, delete: false }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { role, username } = useAuth() || { role: 'Guest', username: null };
  const performer = role || 'System';

  // Completely empty initial state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const currentEmployee = useMemo(() => {
    return employees.find(e => e.username === username) || null;
  }, [employees, username]);

  const addLog = (message: string, type: AppNotification['type'] = 'info') => {
    setNotifications(prev => [{
      id: Date.now().toString(),
      message,
      type,
      performer,
      timestamp: new Date().toLocaleString(),
    }, ...prev]);
  };

  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newId = Date.now().toString();
    setRooms(prev => [{ ...roomData, id: newId }, ...prev]);
    addLog(`Added Room ${roomData.roomNumber}`, 'success');
  };

  const updateRoom = (room: Room) => {
    setRooms(prev => prev.map(r => r.id === room.id ? room : r));
    addLog(`Updated Room ${room.roomNumber}`);
  };

  const deleteRoom = (id: string) => {
    const target = rooms.find(r => r.id === id);
    setRooms(prev => prev.filter(r => r.id !== id));
    if (target) addLog(`Deleted Room ${target.roomNumber}`, 'warning');
  };

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    setTenants(prev => [{ ...tenant, id: Date.now().toString() }, ...prev]);
    addLog(`Registered Tenant ${tenant.name}`, 'success');
  };

  const updateTenant = (tenant: Tenant) => {
    setTenants(prev => prev.map(t => t.id === tenant.id ? tenant : t));
    addLog(`Updated Tenant ${tenant.name}`);
  };

  const deleteTenant = (id: string) => {
    const target = tenants.find(t => t.id === id);
    setTenants(prev => prev.filter(t => t.id !== id));
    if (target) addLog(`Removed Tenant ${target.name}`, 'warning');
  };

  const bulkDeleteTenants = (ids: string[]) => {
    setTenants(prev => prev.filter(t => !ids.includes(t.id)));
    addLog(`Bulk removed ${ids.length} tenants`, 'warning');
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    setPayments(prev => [{ ...payment, id: Date.now().toString() }, ...prev]);
    addLog(`Recorded payment of AED ${payment.amount} for ${payment.tenant}`, 'success');
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [{ ...expense, id: Date.now().toString() }, ...prev]);
    addLog(`Recorded expense: ${expense.title}`, 'warning');
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    setEmployees(prev => [{ 
      ...employee, 
      id: Date.now().toString(), 
      permissions: employee.permissions || DEFAULT_PERMISSIONS,
      assignedRoomIds: employee.assignedRoomIds || []
    }, ...prev]);
    addLog(`Added Employee ${employee.name}`, 'info');
  };

  const updateEmployee = (employee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === employee.id ? employee : e));
    addLog(`Updated profile for ${employee.name}`);
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (target) addLog(`Removed Employee ${target?.name || 'Account'}`, 'warning');
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e));
  };

  const bulkToggleEmployeeStatus = (ids: string[], status: 'Active' | 'Inactive') => {
    setEmployees(prev => prev.map(e => ids.includes(e.id) ? { ...e, status } : e));
    addLog(`Bulk updated ${ids.length} employees to ${status}`, 'info');
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const stats = useMemo(() => {
    return {
      totalRooms: rooms.length,
      totalTenants: tenants.length,
      totalIncome: payments.reduce((acc, curr) => acc + curr.amount, 0),
      totalExpenses: expenses.reduce((acc, curr) => acc + curr.amount, 0)
    };
  }, [rooms, tenants, payments, expenses]);

  return (
    <DataContext.Provider value={{ 
      rooms, tenants, payments, expenses, employees, properties, notifications,
      addRoom, updateRoom, deleteRoom, addTenant, updateTenant, deleteTenant, bulkDeleteTenants,
      addPayment, addExpense, addEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus, bulkToggleEmployeeStatus,
      clearNotification, stats, currentEmployee
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};


export type UserRole = 'Admin' | 'Employee';

export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  MAINTENANCE = 'Maintenance',
  RESERVED = 'Reserved'
}

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  performer: string;
  isPersistent?: boolean; 
  expiryDate?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  rent: number;
  monthlyExpenses: number;
  status: RoomStatus;
  building?: string;
  floor?: string;
  occupancy?: {
    startDate: string;
    endDate: string;
    isOpenEnded: boolean;
  };
  maintenance?: {
    cost: number;
    date: string;
  };
  preBooking?: {
    startDate: string;
    endDate: string;
    tenantName?: string;
    tenantPhone?: string;
  };
  images?: string[];
}

export interface Tenant {
  id: string;
  name: string;
  room: string;
  phone: string;
  moveInDate: string;
  status: 'Active' | 'Inactive';
}

export interface Payment {
  id: string;
  tenant: string;
  room: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
}

export interface Expense {
  id: string;
  property: string;
  unit: string;
  title: string;
  amount: number;
  paidBy: string;
  status: 'Paid' | 'Unpaid';
  date: string;
}

export interface EmployeePermissions {
  rooms: { view: boolean; add: boolean; edit: boolean; delete: boolean };
  tenants: { view: boolean; add: boolean; edit: boolean; delete: boolean };
  payments: { view: boolean; add: boolean; edit: boolean; delete: boolean };
  expenses: { view: boolean; add: boolean; edit: boolean; delete: boolean };
}

export interface Employee {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  permissions: EmployeePermissions;
  status: 'Active' | 'Inactive';
  assignedRoomIds: string[]; // New field for granular access
}

export interface Property {
  id: string;
  name: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string;
}

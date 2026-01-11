
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 transition-all border-l-4 ${
          isActive 
            ? 'bg-blue-900 border-brand-secondary text-white' 
            : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const { notifications, clearNotification } = useData();
  const location = useLocation();
  const { logout, role, profile } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSidebarOpen(false);
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location]);

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    notifications.forEach(n => clearNotification(n.id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bgLight">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-sidebar transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 overflow-y-auto custom-scrollbar`}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-brand-secondary">PR</span>MS
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><Icons.Close /></button>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          <SidebarItem to="/" icon={<Icons.Dashboard />} label="Dashboard" />
          <SidebarItem to="/rooms" icon={<Icons.Rooms />} label="Rooms" />
          <SidebarItem to="/tenants" icon={<Icons.Tenants />} label="Tenants" />
          <SidebarItem to="/payments" icon={<Icons.Payments />} label="Payments" />
          <SidebarItem to="/expenses" icon={<Icons.Expenses />} label="Expenses" />
          <SidebarItem to="/employees" icon={<Icons.Employees />} label="Employees" />
          <SidebarItem to="/reports" icon={<Icons.Reports />} label="Reports" />
          <SidebarItem to="/settings" icon={<Icons.Settings />} label="Settings" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-md md:hidden"><Icons.Menu /></button>
            <h2 className="text-lg md:text-xl font-semibold text-brand-textPrimary truncate">{getPageTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative" ref={notifRef}>
              <div 
                onClick={() => setNotifOpen(!isNotifOpen)} 
                className={`cursor-pointer p-2 rounded-full transition-colors relative ${isNotifOpen ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isNotifOpen ? 'text-brand-secondary' : 'text-brand-textSecondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && <span className="absolute top-1 right-1 bg-brand-error text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white animate-pulse">{notifications.length}</span>}
              </div>

              {/* NOTIFICATION DROPDOWN PANEL */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-modal border border-gray-100 py-0 z-[100] max-h-[480px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleClearAll} 
                        className="text-[10px] font-black text-brand-secondary uppercase hover:underline transition-all"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="overflow-y-auto custom-scrollbar flex-1">
                    {notifications.length === 0 ? (
                      <div className="py-12 px-8 text-center space-y-2">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                          <Icons.Dashboard />
                        </div>
                        <p className="text-xs text-gray-400 font-medium italic">All caught up! No new activity.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-4 hover:bg-blue-50/30 transition-colors group relative">
                            <button 
                              onClick={() => clearNotification(n.id)}
                              className="absolute top-3 right-3 p-1 text-gray-300 hover:text-brand-error opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-white"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <div className="flex items-start gap-4">
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                n.type === 'success' ? 'bg-brand-success' :
                                n.type === 'warning' ? 'bg-brand-warning' :
                                n.type === 'error' ? 'bg-brand-error' : 'bg-brand-secondary'
                              }`} />
                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[13px] font-bold text-brand-sidebar leading-tight">{n.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[9px] font-black text-brand-secondary uppercase bg-blue-50 px-1.5 py-0.5 rounded tracking-tighter">{n.performer}</span>
                                  <span className="text-[9px] text-gray-400 font-bold">{n.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src={profile.photo} alt="Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-brand-secondary object-cover" />
                <div className="hidden sm:block min-w-[80px]">
                  <p className="text-sm font-semibold text-brand-textPrimary truncate">{profile.firstName} {profile.lastName}</p>
                  <p className="text-xs text-brand-textSecondary">{role}</p>
                </div>
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1 z-50">
                <NavLink to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-50">Profile Settings</NavLink>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-brand-error hover:bg-red-50">Logout</button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-brand-bgLight">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

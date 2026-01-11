
import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/UI';
import { useAuth } from '../AuthContext';

export const Settings: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [localProfile, setLocalProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateProfile(localProfile);
      setIsSaving(false);
      alert('Profile updated successfully! Real-time sync complete.');
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfile({...localProfile, photo: reader.result as string});
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
      <Card title="Profile Information">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative group">
               <img 
                 src={localProfile.photo} 
                 alt="Profile" 
                 className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-brand-secondary p-1 object-cover shadow-xl transition-transform group-hover:scale-105"
               />
               <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <span className="text-white text-xs font-black uppercase tracking-widest">Change</span>
                 <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
               </label>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <Input 
              label="First Name" 
              value={localProfile.firstName} 
              onChange={(e) => setLocalProfile({...localProfile, firstName: e.target.value})}
            />
            <Input 
              label="Last Name" 
              value={localProfile.lastName} 
              onChange={(e) => setLocalProfile({...localProfile, lastName: e.target.value})}
            />
            <Input 
              label="Email" 
              value={localProfile.email} 
              onChange={(e) => setLocalProfile({...localProfile, email: e.target.value})}
            />
            <Input 
              label="Phone" 
              value={localProfile.phone} 
              onChange={(e) => setLocalProfile({...localProfile, phone: e.target.value})}
            />
            <div className="sm:col-span-2 pt-4 border-t mt-4 flex justify-end">
              <Button onClick={handleSaveProfile} className="w-full sm:w-auto px-10 h-12 shadow-xl">
                {isSaving ? 'Syncing...' : 'Update & Sync Profile'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="System Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="font-black text-sm uppercase tracking-tight">Email Notifications</p>
              <p className="text-xs text-brand-textSecondary">Receive critical security and billing alerts</p>
            </div>
            <button 
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`w-14 h-7 rounded-full transition-all duration-300 relative ${emailNotifs ? 'bg-brand-success' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${emailNotifs ? 'left-[32px]' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

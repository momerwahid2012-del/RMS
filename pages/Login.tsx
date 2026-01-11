
import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const passRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'user' | 'pass') => {
    if (e.key === 'Enter') {
      if (field === 'user') {
        e.preventDefault();
        // Focus the next input (find input within components/UI.tsx wrapper)
        const inputs = document.querySelectorAll('input');
        if (inputs[1]) inputs[1].focus();
      }
      // If field is pass, the form submit handles it
    }
  };

  return (
    <div className="min-h-screen bg-brand-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md transform transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
        <Card className="p-8 shadow-2xl border-t-4 border-brand-secondary">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-brand-sidebar tracking-tight">
              <span className="text-brand-secondary">PR</span>MS
            </h1>
            <p className="text-brand-textSecondary mt-3 font-medium">Property Management System</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <Input 
                label="Username" 
                placeholder="admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                onKeyDown={(e) => handleKeyDown(e, 'user')}
              />
            </div>
            <div className="group">
              <Input 
                label="Password" 
                type="password"
                placeholder="••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={error}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 text-lg bg-gradient-to-r from-brand-secondary to-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest text-brand-textSecondary font-bold">
            <span className="h-px bg-gray-200 flex-1"></span>
            <span>Authorized Only</span>
            <span className="h-px bg-gray-200 flex-1"></span>
          </div>
        </Card>
      </div>
    </div>
  );
};

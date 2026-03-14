'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Terminal, Lock, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-[#0a0a0a] border border-zinc-800 p-10 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-[60px] -mr-16 -mt-16" />
        
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-3">
            <Terminal size={18} className="text-amber-500" />
            <span className="text-amber-500 uppercase tracking-[0.6em] text-[10px] font-bold">Security Protocol</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">System <span className="font-serif font-light lowercase text-zinc-600">access</span></h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">Identifier</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800/50 p-5 rounded-2xl outline-none focus:border-amber-500/30 text-white font-light" 
              placeholder="admin@studio.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">Access Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800/50 p-5 rounded-2xl outline-none focus:border-amber-500/30 text-white font-light" 
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
            Initialize Session
          </button>
        </form>
      </div>
    </div>
  );
}
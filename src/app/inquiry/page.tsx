"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Globe, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function InquiryPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', vision: '', _honeypot: '' });

  // 1. Fetch data on the client side to stay in one file
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('content')
          .eq('id', 'hero_content')
          .single();
        
        if (data?.content) setSettings(data.content);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Sync variables with Admin Config
  const contactEmail = settings?.contact_email || "hello@liza.studio";
  const brandName = settings?.brand_name || "LIZA STUDIO";
  const heroTitle = settings?.hero_title || "Let's build *iconic* things.";
  const locationText = settings?.hero_location || "London, UK";

  const renderTitle = (text: string) => {
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <span key={i} className="italic font-serif text-amber-500/90 lowercase">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData._honeypot || !formData.name || !formData.email) return;
    setStatus('sending');

    try {
      // 1. Log the inquiry to the database for the Admin Inbox
      await supabase.from('inquiries').insert([{ 
        name: formData.name, 
        email: formData.email, 
        message: formData.vision,
        created_at: new Date().toISOString()
      }]);

      // 2. Trigger the mailto with the address set in Admin Inbox
      const subject = encodeURIComponent(`Project Inquiry: ${formData.name}`);
      const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nVision: ${formData.vision}`);
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      
      setStatus('success');
    } catch (err) {
      console.error("Transmission failed", err);
      setStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-500 font-mono text-[10px] tracking-[0.5em] animate-pulse uppercase">
          Initializing Interface...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-48 pb-20 px-8 md:px-16 bg-[#0a0a0a] relative overflow-hidden selection:bg-amber-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-10%,#fbbf2408,transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-amber-500" />
              <span className="text-amber-500 uppercase tracking-[0.8em] text-[10px] font-bold">Initiate Protocol</span>
            </div>
            <h1 className="text-6xl md:text-[8.5rem] font-light tracking-tighter leading-[0.85] text-white whitespace-pre-line">
              {renderTitle(heroTitle)}
            </h1>
          </motion.div>
        </header>
        
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <SuccessState reset={() => { setStatus('idle'); setFormData({name:'', email:'', vision:'', _honeypot:''}); }} />
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <input type="text" className="hidden" value={formData._honeypot} onChange={(e) => setFormData({...formData, _honeypot: e.target.value})} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24">
                <InputGroup label="01. Identity" value={formData.name} onChange={(val: string) => setFormData({...formData, name: val})} placeholder="Your Name" />
                <InputGroup label="02. Reach" value={formData.email} onChange={(val: string) => setFormData({...formData, email: val})} placeholder="Email Address" type="email" />
              </div>

              <div className="group border-b border-white/10 py-8 focus-within:border-amber-500/50 transition-all duration-700">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600 group-focus-within:text-amber-500 transition-all">03. The Vision</p>
                  <span className="text-[10px] font-mono text-neutral-700">{formData.vision.length} / 500</span>
                </div>
                <textarea required maxLength={500} value={formData.vision} onChange={(e) => setFormData({...formData, vision: e.target.value})} className="w-full bg-transparent outline-none pt-4 pb-2 text-xl md:text-3xl font-light text-white h-32 md:h-48 resize-none placeholder:text-neutral-900" placeholder="Project goals..." />
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center pt-16 gap-8">
                <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em]">Transmission via primary mail client.</p>
                <button disabled={status === 'sending'} className="relative group px-14 py-7 rounded-full border border-white/10 bg-white/[0.02] text-white transition-all hover:border-amber-500/50">
                  <span className="relative z-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.5em] font-black">
                    {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <>Transmit <ArrowRight size={16} /></>}
                  </span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <footer className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-16 pt-20 border-t border-white/5">
          <ContactDetail label="Direct" value={contactEmail} subValue={settings?.contact_phone || "+44 (20) 0000 0000"} />
          <ContactDetail label="Location" value={locationText} subValue={<LiveClock />} />
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600">{brandName}</p>
            <div className="flex gap-8">
              {/* Updated social mapping to respect individual visibility */}
              {settings?.socials?.filter((social: any) => social.isVisible !== false).map((social: any) => (
                <a 
                  key={social.label} 
                  href={social.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-white hover:text-amber-500 transition-all font-mono"
                >
                  [{social.label.substring(0, 2).toUpperCase()}]
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

// --- SUB-COMPONENTS ---

function InputGroup({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="group border-b border-white/10 py-8 focus-within:border-amber-500/50 transition-all duration-700">
      <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600 group-focus-within:text-amber-500 transition-all">{label}</p>
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent outline-none pt-4 pb-2 text-xl md:text-3xl font-light text-white placeholder:text-neutral-900" placeholder={placeholder} />
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()));
    update();
    const inv = setInterval(update, 60000);
    return () => clearInterval(inv);
  }, []);
  return <span className="flex items-center gap-2 font-mono text-zinc-400"><Globe size={12} className="text-amber-500" /> {time} GMT</span>;
}

function ContactDetail({ label, value, subValue }: any) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600">{label}</p>
      <p className="text-lg font-light text-neutral-200">{value}</p>
      <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{subValue}</div>
    </div>
  );
}

function SuccessState({ reset }: { reset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex flex-col items-center text-center gap-8">
      <div className="h-24 w-24 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20"><CheckCircle2 size={48} className="text-amber-500" /></div>
      <h3 className="text-5xl font-serif italic text-white">Inquiry Initialized.</h3>
      <button onClick={reset} className="mt-12 text-[10px] uppercase tracking-[0.4em] text-amber-500 border-b border-amber-500/20 pb-2">Return to terminal</button>
    </motion.div>
  );
}
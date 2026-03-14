"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Instagram, Linkedin, Mail, ArrowUp, Twitter } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Added interface to satisfy TypeScript and fix the ClientLayout build error
interface FooterProps {
  settings?: any;
}

const Footer = ({ settings }: FooterProps) => {
  const [data, setData] = useState<any>(null);

  // 1. Fetch live data from Supabase (Fallback logic)
  useEffect(() => {
    const fetchFooterData = async () => {
      // If footer_json is already in the passed settings, use it to avoid extra fetch
      if (settings?.footer_json) {
        setData(settings.footer_json);
        return;
      }

      const { data: config, error } = await supabase
        .from('site_config')
        .select('footer_json')
        .eq('id', 'hero_content')
        .single();
      
      if (!error && config) {
        setData(config.footer_json);
      }
    };
    fetchFooterData();
  }, [settings]);

  // 2. Map data to variables (Prioritizing passed settings for speed)
  const footerSource = data || settings?.footer_json;
  
  const studioName = footerSource?.copyright || "LIZA STUDIO";
  const email = footerSource?.email || "hello@liza.studio";
  const location = footerSource?.location || "London, UK";
  const narrative = footerSource?.narrative || "Available for select commissions 2026 —>";
  const availability = footerSource?.availability || "Status: Active";
  const socials = footerSource?.socials || {};
  const accentColor = settings?.accentColor || "#f59e0b";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: <Github size={18} />, href: socials.github, id: 'github' },
    { icon: <Linkedin size={18} />, href: socials.linkedin, id: 'linkedin' },
    { icon: <Instagram size={18} />, href: socials.instagram, id: 'instagram' },
    { icon: <Twitter size={18} />, href: socials.twitter, id: 'twitter' },
    { icon: <Mail size={18} />, href: email ? `mailto:${email}` : null, id: 'email' }
  ].filter(link => link.href);

  return (
    <footer className="relative z-30 pt-32 pb-10 px-8 md:px-16 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-[1px]" style={{ backgroundColor: `${accentColor}80` }} />
              <span className="text-[9px] uppercase tracking-[0.6em] font-bold italic" style={{ color: accentColor }}>
                Project Inquiry
              </span>
            </div>
            
            <Link href="/inquiry" className="group block cursor-pointer">
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-white uppercase leading-[0.9] mb-8 transition-colors">
                Let&apos;s <span className="italic font-serif lowercase group-hover:text-white" style={{ color: `${accentColor}E6` }}>create</span>
              </h2>
              <p className="text-neutral-500 text-[10px] tracking-[0.3em] uppercase font-light group-hover:text-neutral-300 transition-colors max-w-xs leading-relaxed">
                {narrative}
              </p>
            </Link>
          </motion.div>

          <div className="flex flex-col items-end gap-6">
            <button 
              onClick={scrollToTop}
              className="group flex flex-col items-center gap-4 text-neutral-600 hover:text-white transition-colors text-[8px] uppercase tracking-[0.5em] font-bold"
            >
              <span className="mb-2 tracking-[0.8em] mr-[-0.8em]">Top</span>
              <div 
                className="w-12 h-20 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/[0.01] transition-all relative overflow-hidden"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <ArrowUp size={16} className="transition-colors group-hover:text-amber-500" />
                </motion.div>
              </div>
            </button>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="text-neutral-600 text-[9px] tracking-[0.4em] uppercase font-medium order-2 md:order-1 text-center md:text-left">
            <span className="text-neutral-400">© {new Date().getFullYear()} {studioName}</span>
            <span className="mx-4 opacity-20">/</span> 
            {location}
          </div>

          <div className="flex justify-center gap-10 order-1 md:order-2">
            {socialLinks.map((social) => (
              <Link 
                key={social.id}
                href={social.href}
                target="_blank"
                className="text-neutral-700 transition-all duration-500 hover:-translate-y-1.5"
                onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              >
                {social.icon}
              </Link>
            ))}
          </div>

          <div className="text-neutral-700 text-[8px] tracking-[0.5em] uppercase font-mono text-center md:text-right order-3">
            {availability} <span className="text-neutral-500 mx-2">//</span> v1.0.4
          </div>
        </div>
      </div>

      <div 
        className="absolute -bottom-20 -right-20 w-[40vw] h-[40vw] blur-[150px] rounded-full pointer-events-none" 
        style={{ backgroundColor: `${accentColor}05` }} 
      />
    </footer>
  );
};

export default Footer;
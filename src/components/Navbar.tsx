"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

interface NavbarProps {
  settings: {
    brand?: { 
      studio_name: string; 
      logo_url?: string;
      logo_initial?: string;
    };
    accentColor?: string;
    socials?: Array<{ label: string, url: string }>;
  };
}

export default function Navbar({ settings }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef(null);

  const brand = settings?.brand || { studio_name: "STUDIO" };
  const name = brand.studio_name;
  const logoImage = brand.logo_url;
  const logoInitial = brand.logo_initial || name.charAt(0);
  const accentColor = "#F59E0B"; // Hard-synced to Precision Amber

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const dX = useSpring(mouseX, springConfig);
  const dY = useSpring(mouseY, springConfig);

  const handleMagnetic = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    mouseX.set(x * 0.4);
    mouseY.set(y * 0.4);
  };

  const resetMagnetic = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Work", href: "/projects" },
    { name: 'Philosophy', href: '/philosophy' },
    { name: 'Stack', href: '/tech-stack' },
    { name: 'Inquiry', href: '/inquiry' },
  ];

  return (
    <>
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-[120] transition-all duration-1000 ${
          scrolled ? "py-6 bg-[#050505]/80 backdrop-blur-xl border-b border-[#1F2937]/30" : "py-10 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          
          <motion.div
            style={{ x: dX, y: dY }}
            onMouseMove={handleMagnetic}
            onMouseLeave={resetMagnetic}
            className="relative z-[130]"
          >
            <Link href="/" className="group flex items-center gap-5">
              <div className="relative h-11 w-11 flex items-center justify-center">
                {/* Industrial Logo Container */}
                <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-[#1F2937]/20 border border-[#4B5563]/30 transition-all duration-500 group-hover:border-[#F59E0B]/50 group-hover:bg-[#1F2937]/40 shadow-2xl">
                  {logoImage ? (
                    <Image
                      src={logoImage}
                      alt={`${name} Logo`}
                      fill
                      className="object-cover p-2.5 transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[#F9FAFB] font-serif italic text-xl font-bold">{logoInitial}</span>
                  )}
                </div>
                {/* Precision Amber Pulse */}
                <div className="absolute inset-0 rounded-xl border border-[#F59E0B] scale-125 opacity-0 group-hover:opacity-20 group-hover:scale-100 transition-all duration-700" />
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-light tracking-[0.5em] text-[#F9FAFB] uppercase leading-none">
                  {name}<span className="text-[#F59E0B]">.</span>
                </span>
                <span className="text-[7px] tracking-[0.4em] text-[#4B5563] uppercase mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-1">
                  Engine_v2.6
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Nav Pills */}
          <div className="hidden md:flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-[#1F2937]/10 border border-[#1F2937]/30 backdrop-blur-md shadow-2xl">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="px-6 py-2 relative text-[9px] uppercase tracking-[0.3em] font-bold transition-colors duration-500"
                >
                  <span className={`relative z-10 ${isActive ? "text-[#F9FAFB]" : "text-[#4B5563] hover:text-[#F9FAFB]"}`}>
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#F59E0B]/10 rounded-full border border-[#F59E0B]/20"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-8">
            <Link 
              href="/inquiry" 
              className="hidden lg:flex items-center gap-4 text-[9px] uppercase tracking-[0.5em] font-bold group"
            >
              <span className="text-[#4B5563] group-hover:text-[#F9FAFB] transition-colors">Start Project</span>
              <div className="w-6 h-[1px] bg-[#4B5563] group-hover:w-10 group-hover:bg-[#F59E0B] transition-all duration-500" />
            </Link>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative w-11 h-11 flex flex-col items-center justify-center gap-1.5 z-[150] bg-[#1F2937]/20 border border-[#1F2937]/30 rounded-full hover:border-[#F59E0B]/40 transition-all group"
              aria-label="Menu"
            >
              <motion.div 
                animate={mobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                className="w-5 h-[1.2px] bg-[#F9FAFB] rounded-full"
              />
              <motion.div 
                animate={mobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                className="w-5 h-[1.2px] bg-[#F9FAFB] rounded-full"
              />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-[#050505] z-[110] flex flex-col justify-center px-10 md:px-24"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none bg-[radial-gradient(circle_at_70%_50%,rgba(245,158,11,0.03),transparent_70%)]" />
            
            <div className="flex flex-col gap-6">
              <span className="text-[10px] uppercase tracking-[1em] text-[#4B5563] mb-6 block font-mono">/ Directory</span>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + (i * 0.08), duration: 0.8 }}
                >
                  <Link 
                    href={link.href}
                    className="group flex items-baseline gap-6 text-5xl md:text-8xl font-light tracking-tighter"
                  >
                    <span className="text-[#1F2937] font-serif italic text-2xl group-hover:text-[#F59E0B] transition-colors duration-500">
                      0{i + 1}
                    </span>
                    <span className={`transition-all duration-700 ${
                      pathname === link.href ? "text-[#F59E0B] italic" : "text-[#F9FAFB]/40 hover:text-[#F9FAFB] hover:translate-x-4"
                    }`}>
                      {link.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-16 left-10 md:left-24"
            >
              <p className="text-[9px] uppercase tracking-[0.5em] text-[#4B5563] mb-6 font-mono">Transmission</p>
              <div className="flex gap-8 text-[10px] text-[#F9FAFB]/60 uppercase tracking-[0.3em] font-bold">
                {settings.socials?.map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#F59E0B] transition-colors">{s.label}</a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
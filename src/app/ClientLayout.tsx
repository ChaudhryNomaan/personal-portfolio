"use client";

import { usePathname } from 'next/navigation';
import { motion, useSpring } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function CustomCursor({ accentColor }: { accentColor: string }) {
  const mouseX = useSpring(0, { damping: 25, stiffness: 250 });
  const mouseY = useSpring(0, { damping: 25, stiffness: 250 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('a, button, [role="button"], .group'));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div 
      className="fixed top-0 left-0 w-4 h-4 rounded-full z-[9999] pointer-events-none mix-blend-difference hidden lg:block"
      style={{ 
        x: mouseX, 
        y: mouseY, 
        translateX: "-50%", 
        translateY: "-50%",
        backgroundColor: accentColor
      }}
      animate={{ scale: isHovering ? 3.5 : 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
    />
  );
}

export default function ClientLayout({ 
  children, 
  settings 
}: { 
  children: React.ReactNode;
  settings: any;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const accentColor = settings?.accentColor || "#f59e0b";

  return (
    <>
      {!isAdmin && <CustomCursor accentColor={accentColor} />}

      {!isAdmin && (
        <>
          {/* Global Aesthetic Overlays - Fixed z-index to stay behind content */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-grain opacity-[0.03] mix-blend-overlay" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(10,10,10,0.2)_100%)]" />
          </div>
          
          {/* Structural Frame - STRICTLY desktop only with display: none for mobile */}
          <div className="fixed inset-0 pointer-events-none z-[50] hidden md:flex items-center justify-center p-6">
             <div className="w-full h-full border border-white/5" />
          </div>
        </>
      )}

      {/* 
          IMPORTANT: Removed 'relative' from the outer div to prevent 
          it from creating a new stacking context that might clip children.
      */}
      <div className="flex flex-col min-h-screen">
        {!isAdmin && <Navbar settings={settings} />}
        
        {/* Added w-full to ensure main is never squeezed */}
        <main className="flex-grow w-full overflow-x-hidden">
          {children}
        </main>

        {!isAdmin && <Footer settings={settings} />}
      </div>

      <div id="cursor-portal" />
    </>
  );
}
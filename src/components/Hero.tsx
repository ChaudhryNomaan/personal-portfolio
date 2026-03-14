"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, Variants } from 'framer-motion';

interface HeroProps {
  data: {
    upperLabel: string;
    mainTitleLine1: string;
    mainTitleLine2: string;
    subtext: string;
    location: string;
    availability: string;
    accentColor: string;
  }
}

export default function Hero({ data }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const accentColor = data.accentColor || "#f59e0b";
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 200]), {
    stiffness: 40,
    damping: 20
  });
  
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.4 },
    },
  };

  const titleVariants: Variants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 1.8, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  return (
    <section 
      ref={containerRef}
      className="relative h-[110vh] flex flex-col justify-center items-center text-center px-6 md:px-12 overflow-hidden bg-[#0a0a0a]"
    >
      {/* ADAPTIVE RADIAL GLOW */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000 hidden lg:block opacity-30"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, ${accentColor}10, transparent 40%)`
        }}
      />

      {/* DEPTH ELEMENT - Subtle 5% opacity background to match original high-end feel */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] rounded-full blur-[180px] pointer-events-none"
        style={{ 
          opacity: textOpacity, 
          scale: scale, 
          backgroundColor: `${accentColor}0D` // 0D adds ~5% alpha to the hex color
        }}
      />

      <motion.div
        style={{ y: smoothY, opacity: textOpacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl"
      >
        {/* UPPER LABEL */}
        <div className="overflow-hidden mb-12">
          <motion.div variants={titleVariants} className="flex items-center justify-center gap-6">
            <span className="w-12 h-[1px]" style={{ backgroundColor: `${accentColor}30` }} />
            <span className="text-[10px] uppercase tracking-[1em] font-bold" style={{ color: accentColor }}>
              {data.upperLabel}
            </span>
            <span className="w-12 h-[1px]" style={{ backgroundColor: `${accentColor}30` }} />
          </motion.div>
        </div>

        {/* MAIN TITLE */}
        <div className="overflow-hidden py-2 md:py-4">
          <motion.h1 
            variants={titleVariants}
            className="text-[13vw] md:text-[8.5vw] font-light tracking-tighter leading-[0.8] uppercase text-white"
          >
            {data.mainTitleLine1}
          </motion.h1>
        </div>
        <div className="overflow-hidden py-2 md:py-4 -mt-2 md:-mt-6 mb-12">
          <motion.h1 
            variants={titleVariants}
            className="text-[13vw] md:text-[8.5vw] font-light tracking-tighter leading-[0.8] italic font-serif lowercase"
            style={{ color: `${accentColor}E6` }}
          >
            {data.mainTitleLine2}
          </motion.h1>
        </div>

        {/* SUBTEXT & CTA */}
        <motion.div variants={titleVariants} className="flex flex-col items-center gap-16">
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg md:text-2xl font-light leading-relaxed text-balance">
            {data.subtext}
          </p>

          <motion.a
            href="/projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-16 py-6 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-700"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <span className="relative z-10 text-[11px] uppercase tracking-[0.6em] font-bold text-neutral-300 group-hover:text-white transition-colors">
              Explore Works
            </span>
            <motion.div 
              className="absolute inset-0"
              style={{ backgroundColor: accentColor }}
              initial={{ y: "100%" }}
              whileHover={{ y: 0 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="h-16 w-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full"
            style={{ background: `linear-gradient(to bottom, transparent, ${accentColor}80, transparent)` }}
          />
        </div>
        <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-600 font-bold">Scroll Down</span>
      </div>

      {/* FOOTER DATA */}
      <div className="hidden lg:flex absolute left-12 bottom-12 items-center gap-4 text-[10px] font-mono text-neutral-800 tracking-[0.2em] uppercase">
        <span style={{ color: `${accentColor}33` }}>●</span>
        <span>Availability: {data.availability}</span>
        <span className="ml-8">{data.location}</span>
      </div>
    </section>
  );
}
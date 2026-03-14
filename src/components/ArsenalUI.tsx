"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

/**
 * Metadata for core technologies.
 * Explicit typing prevents deployment-blocking inference errors.
 */
const toolMetadata: Record<string, { category: string, desc: string }> = {
  "Next.js": { 
    category: "Framework", 
    desc: "Architecting high-performance, SEO-optimized digital environments with server-side excellence." 
  },
  "Motion Design": { 
    category: "Animation", 
    desc: "Bringing cinematic fluidity and physics-based motion to modern user interfaces." 
  },
  "Architectural UI/UX": { 
    category: "Design", 
    desc: "Crafting meticulous, user-centric interfaces rooted in structural elegance and functional precision." 
  },
  "TypeScript": { 
    category: "Language", 
    desc: "Ensuring type-safety and robust logic across complex, scalable digital ecosystems." 
  },
  "Tailwind CSS": { 
    category: "Styling", 
    desc: "Crafting pixel-perfect minimalist layouts with utility-first precision and fluid design." 
  },
};

interface TechProps {
  data: {
    accentColor?: string;
    capabilities: string[];
  };
}

export default function ArsenalUI({ data }: TechProps) {
  /**
   * The 'as const' assertion fixes the red line under 'ease'.
   * It tells TypeScript this is a specific tuple of 4 numbers, not just any array.
   */
  const easeExpo = [0.19, 1, 0.22, 1] as const;
  const accentColor = data.accentColor || "#f59e0b";
  const dynamicTools = data.capabilities || [];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1, 
        delayChildren: 0.3 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 40 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 1.2, 
        ease: easeExpo 
      } 
    }
  };

  return (
    <main className="min-h-screen pt-48 pb-40 px-8 md:px-16 lg:px-24 bg-[#0a0a0a] overflow-hidden relative">
      {/* Dynamic Ambient Background */}
      <div 
        className="fixed top-0 right-0 w-[50vw] h-[50vw] blur-[150px] rounded-full pointer-events-none opacity-[0.03]" 
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <header className="mb-32 space-y-8">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: 40 }} 
              className="h-px" 
              style={{ backgroundColor: accentColor }}
            />
            <span className="uppercase tracking-[0.8em] text-[10px] font-bold" style={{ color: accentColor }}>
              The Arsenal
            </span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-[9vw] font-light tracking-tighter leading-[0.8] text-white uppercase"
          >
            Core <span className="italic font-serif lowercase" style={{ color: `${accentColor}E6` }}>Stack</span>
          </motion.h1>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-white/5"
        >
          {dynamicTools.map((toolName, index) => {
            const meta = toolMetadata[toolName] || { 
              category: "Technology", 
              desc: "Specialized expertise utilized to deliver high-performance digital solutions." 
            };

            return (
              <motion.div
                key={toolName}
                variants={itemVariants}
                className="relative p-12 border-r border-b border-white/5 group overflow-hidden cursor-crosshair"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-16">
                    <span className="text-[10px] font-mono text-neutral-600 tracking-[0.4em] uppercase italic">
                      REF.0{index + 1}
                    </span>
                    <div 
                      className="h-2 w-2 rounded-full bg-white/10 group-hover:bg-current transition-colors" 
                      style={{ color: accentColor }} 
                    />
                  </div>
                  
                  <h3 className="text-3xl font-light text-white mb-4 group-hover:italic transition-all font-serif">
                    {toolName}
                  </h3>
                  
                  <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-500 mb-10 font-bold">
                    {meta.category}
                  </p>
                  
                  <p className="text-sm text-neutral-400 leading-relaxed font-light opacity-60 group-hover:opacity-100 transition-all">
                    {meta.desc}
                  </p>
                </div>

                <span className="absolute -bottom-4 -right-2 text-white/[0.02] text-[12rem] font-black select-none pointer-events-none group-hover:text-white/[0.04] transition-all font-serif italic">
                  {index + 1}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </main>
  );
}
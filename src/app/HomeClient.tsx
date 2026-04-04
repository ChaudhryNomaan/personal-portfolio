"use client";

import React, { useEffect } from 'react';
import { motion, useSpring, LayoutGroup } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  initialProjects: any[];
  heroData?: any; // Made optional to prevent runtime crashes
}

export default function HomeClient({ initialProjects, heroData = {} }: Props) {
  const gMouseX = useSpring(0, { damping: 25, stiffness: 150 });
  const gMouseY = useSpring(0, { damping: 25, stiffness: 150 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      gMouseX.set(e.clientX);
      gMouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [gMouseX, gMouseY]);

  return (
    /* Background: Slate Blue-Gray (#334155) */
    <div className="relative z-10 min-h-screen overflow-x-hidden bg-[#334155] selection:bg-[#38BDF8] selection:text-[#1E293B]">
      
      {/* Precision Grid Overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#38BDF8 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

      {/* COMMENTED OUT REPEATED HERO / NARRATIVE SECTION 
      <section className="py-48 md:py-72 px-6 flex flex-col items-center justify-center relative z-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#F59E0B] font-bold mb-8 block">
            [ SYSTEM_INITIALIZED_2026 ]
          </span>

          <h1 className="text-5xl md:text-9xl font-bold tracking-tighter leading-[0.9] text-[#F8FAFC] uppercase">
            {heroData?.mainTitleLine1} <br />
            <span className="text-[#38BDF8]">{heroData?.mainTitleLine2}</span>
          </h1>

          <p className="mt-12 text-[#94A3B8] max-w-xl mx-auto font-medium leading-relaxed text-lg font-mono">
            // {heroData?.subtext}
          </p>
        </motion.div>
      </section>
      */}

      {/* Projects Section - Added pt-32 to give room since the above section is gone */}
      <section className="px-6 md:px-12 pt-32 pb-60 relative z-20">
        <div className="max-w-[1400px] mx-auto">
          <LayoutGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 px-1 bg-[#94A3B8]/10 border-[0.5px] border-[#94A3B8]/20">
              {initialProjects.map((project: any, index: number) => (
                <motion.div 
                  key={project.id} 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#334155] p-8 md:p-12 border-[0.5px] border-[#94A3B8]/20 group cursor-none relative overflow-hidden"
                >
                  <Link href={`/projects/${project.id}`} className="block space-y-10">
                    
                    <div className="relative overflow-hidden bg-[#1E293B] border-[0.5px] border-[#94A3B8]/30 transition-all duration-700 group-hover:border-[#38BDF8]">
                      <motion.img 
                        src={project.cover_image} 
                        alt={project.title}
                        className="w-full aspect-[16/10] object-cover block transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-105"
                      />
                      
                      <div className="absolute top-0 left-0 w-full h-full bg-[#1E293B]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute bottom-6 right-6 p-4 bg-[#38BDF8] text-[#1E293B] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        <ArrowUpRight size={24} strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-3xl font-bold text-[#F8FAFC] tracking-tighter uppercase group-hover:text-[#38BDF8] transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-[#94A3B8] text-sm font-mono tracking-tight">
                            {project.category}
                          </p>
                        </div>
                        <span className="text-[#F59E0B] font-mono text-xs font-bold">
                          MOD_0{index + 1}
                        </span>
                      </div>
                      
                      <p className="text-[#94A3B8] text-base leading-relaxed max-w-md opacity-80">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-4">
                        {project.stack?.map((tech: string) => (
                          <span 
                            key={tech} 
                            className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8] border border-[#38BDF8]/20 px-3 py-1 bg-[#38BDF8]/5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </LayoutGroup>
        </div>
      </section>
    </div>
  );
}
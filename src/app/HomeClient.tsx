"use client";

import React, { useEffect } from 'react';
import { motion, useSpring, LayoutGroup } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  initialProjects: any[];
  heroData: any;
}

export default function HomeClient({ initialProjects, heroData }: Props) {
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
    <div className="relative z-10 min-h-screen overflow-x-hidden bg-[#0a0a0a]">
      
      {/* Narrative Section */}
      <section className="py-48 md:py-80 px-6 flex flex-col items-center justify-center relative z-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <h1 className="text-4xl md:text-8xl font-light tracking-tight leading-[1.1] text-white">
            {heroData.mainTitleLine1} <br />
            <span className="font-serif italic text-white inline-block relative">
              {heroData.mainTitleLine2}
              <motion.span 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-2 left-0 w-full h-[1px] bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] origin-left"
              />
            </span>
          </h1>
          {heroData.subtext && (
            <p className="mt-10 text-zinc-400 max-w-md mx-auto font-light leading-relaxed text-lg">
              {heroData.subtext}
            </p>
          )}
        </motion.div>
      </section>

      {/* Projects Section */}
      <section className="px-6 md:px-12 pb-60 relative z-20">
        <div className="max-w-[1300px] mx-auto">
          <LayoutGroup>
            <div className="columns-1 md:columns-2 gap-x-12 space-y-24 md:space-y-0">
              {initialProjects.map((project: any, index: number) => (
                <motion.div 
                  key={project.id} 
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index % 2 * 0.1, // Subtle stagger for side-by-side items
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="break-inside-avoid mb-24 group cursor-none"
                >
                  <Link href={`/projects/${project.id}`} className="block space-y-6">
                    
                    {/* Image Container with Curved Edges */}
                    <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 shadow-2xl">
                      <motion.img 
                        src={project.cover_image} 
                        alt={project.title}
                        className="w-full h-auto block transition-all duration-1000 ease-[0.22, 1, 0.36, 1]"
                        whileHover={{ scale: 1.04 }}
                      />
                      
                      {/* Interactive Glow Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      <div className="absolute top-6 right-6 p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 opacity-0 -translate-y-2 translate-x-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500">
                        <ArrowUpRight className="text-white" size={20} />
                      </div>
                    </div>

                    {/* Text Content with Subtle Slide-up */}
                    <motion.div 
                      className="space-y-4 px-2"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <h3 className="text-2xl font-light text-white tracking-tight uppercase italic font-serif group-hover:text-amber-400 transition-colors duration-300">
                          {project.title}
                        </h3>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
                          {project.category}
                        </span>
                      </div>
                      
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.stack?.map((tech: string) => (
                          <span key={tech} className="text-[9px] uppercase tracking-widest text-zinc-300 border border-zinc-800 px-3 py-1 rounded-full bg-white/[0.02] group-hover:border-zinc-700 transition-colors">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </motion.div>
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
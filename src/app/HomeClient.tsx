"use client";

import React, { useRef, useState, useEffect } from 'react';
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
    // Changed bg-black to a slightly lighter bg-[#0a0a0a]
    <div className="relative z-10 min-h-screen overflow-x-hidden bg-[#0a0a0a]">
      
      {/* Narrative / Sub-Hero Section */}
      <section className="py-48 md:py-80 px-6 flex flex-col items-center justify-center relative z-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
        >
          {/* Lightened text from #e5e5e5 to white */}
          <p className="text-4xl md:text-8xl font-light tracking-tight leading-[1.1] text-white">
            {heroData.mainTitleLine1} <br />
            <span className="font-serif italic text-white inline-block relative">
              {heroData.mainTitleLine2}
              <motion.span 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                // Added a soft shadow/glow to the amber line to make it pop
                className="absolute -bottom-2 left-0 w-full h-[1px] bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)] origin-left"
              />
            </span>
          </p>
          {heroData.subtext && (
            // Lightened subtext from zinc-500 to zinc-400
            <p className="mt-8 text-zinc-400 max-w-md mx-auto font-light leading-relaxed">
              {heroData.subtext}
            </p>
          )}
        </motion.div>
      </section>

      {/* Projects Section */}
      <section className="px-6 md:px-12 pb-60 relative z-20">
        <div className="max-w-[1200px] mx-auto">
          <LayoutGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-40">
              {initialProjects.map((project: any, index: number) => (
                <motion.div 
                  key={project.id} 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${index % 2 !== 0 ? 'md:mt-32' : ''} group cursor-none`}
                >
                  <Link href={`/projects/${project.id}`} className="block space-y-8">
                    {/* Image Container - slightly lighter border */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-zinc-900 border border-white/5">
                      <motion.img 
                        src={project.cover_image} 
                        alt={project.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                      
                      <div className="absolute top-6 right-6 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowUpRight className="text-white" size={20} />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-4 px-2">
                      <div className="flex justify-between items-end">
                        <h3 className="text-2xl font-light text-white tracking-tight uppercase italic font-serif">
                          {project.title}
                        </h3>
                        {/* Lightened category text */}
                        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
                          {project.category}
                        </span>
                      </div>
                      
                      {/* Lightened project description text */}
                      <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap break-words max-w-sm">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.stack?.map((tech: string) => (
                          <span key={tech} className="text-[9px] uppercase tracking-widest text-zinc-300 border border-zinc-700 px-2 py-1 rounded-full bg-white/5">
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
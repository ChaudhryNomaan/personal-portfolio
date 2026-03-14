"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Cpu, Layers, ExternalLink, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { supabase } from '@/lib/supabase'; 

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProject(data);
      }
      setLoading(false);
    };

    fetchProject();
  }, [id]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (project?.gallery) {
      setActiveImageIndex((prev) => 
        prev !== null ? (prev - 1 + project.gallery!.length) % project.gallery!.length : null
      );
    }
  }, [project?.gallery]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (project?.gallery) {
      setActiveImageIndex((prev) => 
        prev !== null ? (prev + 1) % project.gallery!.length : null
      );
    }
  }, [project?.gallery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'Escape') setActiveImageIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (activeImageIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeImageIndex, handlePrev, handleNext]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-amber-500 font-mono text-[10px] tracking-widest uppercase"
        >
          Accessing Archive...
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-amber-500 font-mono text-[10px] tracking-widest uppercase">Archive Entry Missing</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#000] text-white selection:bg-amber-500/30 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex flex-col pt-32">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full"
          >
            <Image 
              src={project.cover_image} 
              alt={project.title}
              fill
              className="object-cover opacity-40 grayscale-[20%]"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#000]" />
          </motion.div>
        </div>

        <div className="relative z-10 flex-grow max-w-[1400px] mx-auto px-8 w-full flex flex-col justify-between pb-20">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gray-400 hover:text-white transition-all w-fit group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Archive
          </motion.button>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-6">
               <div className="h-px w-8 bg-amber-500" />
               <span className="text-amber-500 font-medium text-[10px] uppercase tracking-[1em]">
                {project.category}
              </span>
            </div>
            
            {/* REDUCED TITLE SIZE: From 8vw to 4xl/6xl */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.1] uppercase break-words max-w-4xl">
              {project.title.split(' ').map((word: string, i: number) => (
                <span key={i} className={i % 2 !== 0 ? "italic font-serif text-white/70" : ""}>
                  {word}{" "}
                </span>
              ))}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* CORE INFO GRID */}
      <section className="relative z-20 max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20">
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-amber-500/50">
              <Layers size={14} />
              <span className="text-[9px] uppercase tracking-[0.5em] font-bold">Project Concept</span>
            </div>
            
            {/* REDUCED DESCRIPTION SIZE: From 4xl to xl/2xl */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-light leading-relaxed whitespace-pre-wrap break-words max-w-3xl">
              {project.description}
            </p>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        <aside className="lg:col-span-5">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 text-gray-500">
                <Cpu size={14} />
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Technology Stack</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.stack?.map((tech: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-full text-[9px] uppercase tracking-widest text-gray-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.live_link && (
              <a 
                href={project.live_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-amber-500 hover:text-black transition-all duration-500"
              >
                Launch Experience <ExternalLink size={14} />
              </a>
            )}
          </div>
        </aside>
      </section>

      {/* GALLERY GRID */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-8 mt-40">
          <div className="flex items-center gap-6 mb-16">
            <h2 className="text-[10px] uppercase tracking-[0.8em] text-gray-600 font-bold whitespace-nowrap">Visual Archive</h2>
            <div className="h-px w-full bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.gallery.map((img: string, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setActiveImageIndex(i)}
                className={`relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 group cursor-pointer ${
                  i % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square md:aspect-[16/10]'
                }`}
              >
                <Image 
                  src={img} 
                  alt={`Project image ${i}`}
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 flex items-center justify-center">
                  <Maximize2 size={32} className="text-white/0 group-hover:text-white/60 transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {activeImageIndex !== null && project.gallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setActiveImageIndex(null)}
          >
            <button 
              onClick={(e) => handlePrev(e)}
              className="absolute left-4 md:left-8 p-3 md:p-4 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all z-[10002]"
            >
              <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
            </button>
            <button 
              onClick={(e) => handleNext(e)}
              className="absolute right-4 md:right-8 p-3 md:p-4 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all z-[10002]"
            >
              <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />
            </button>

            <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
              <motion.div 
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} 
              >
                <div className="relative w-full h-full max-h-full md:max-h-[85vh] z-0 overflow-hidden rounded-[1rem] md:rounded-[2rem] border border-white/10 shadow-2xl">
                  <Image 
                    src={project.gallery[activeImageIndex]} 
                    alt="Gallery preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    quality={90}
                    priority
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(null);
                    }}
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white transition-all z-[50] p-2 rounded-full bg-black/40 border border-white/20 backdrop-blur-md shadow-lg"
                  >
                    <X size={20} className="md:w-6 md:h-6" strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            </div>
            
            <div className="absolute bottom-6 md:bottom-8 text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-white/20">
              {activeImageIndex + 1} / {project.gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-40 py-32 flex flex-col items-center gap-8 border-t border-white/5">
        <button 
          onClick={() => router.push('/projects')}
          className="group flex flex-col items-center gap-4"
        >
          <span className="text-[9px] uppercase tracking-[1em] text-gray-500 group-hover:text-amber-500 transition-colors">Archive Index</span>
          <div className="h-12 w-px bg-gradient-to-b from-amber-500 to-transparent" />
        </button>
      </footer>
    </main>
  );
}
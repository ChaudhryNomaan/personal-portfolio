'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function PhilosophyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pageRes, brandRes] = await Promise.all([
          supabase.from('site_config').select('content').eq('id', 'about_page_content').single(),
          supabase.from('site_config').select('content').eq('id', 'brand_identity').maybeSingle()
        ]);

        if (pageRes.data?.content) {
          const content = pageRes.data.content;
          
          setData({
            ...content,
            // Match the Admin Dashboard fields exactly
            headlineLine1: content.headlineLine1 || "",
            headlineLine2: content.headlineLine2 || "",
            subheading: content.subheading || "",
            narrative: content.philosophy || "", // Admin calls it 'philosophy', we'll use it for the main text
            experienceYears: content.experienceYears || "0",
            aboutImage: content.imageUrl || null, // Admin saves to 'imageUrl'
            capabilities: content.capabilities || [],
            accentColor: content.accentColor || brandRes.data?.content?.accentColor || "#f59e0b",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 180]), 
    { stiffness: 50, damping: 20 }
  );

  const maskReveal = {
    initial: { y: "100%" },
    animate: { y: "0%" },
  };

  const activeAccent = data?.accentColor || "#f59e0b";

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      
      <div 
        className="fixed top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] pointer-events-none opacity-20 transition-colors duration-1000" 
        style={{ backgroundColor: activeAccent }} 
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center font-mono z-50 bg-[#0a0a0a]">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        ) : !data ? (
          <div className="min-h-screen flex items-center justify-center text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">
            Configuration Missing
          </div>
        ) : (
          <motion.div 
            key="content" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="max-w-[1400px] mx-auto px-8 md:px-16 pt-56 pb-40 relative z-10"
          >
            <header className="mb-40">
              <div className="flex items-center gap-4 mb-10">
                <motion.div initial={{ width: 0 }} whileInView={{ width: 40 }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-[1px]" style={{ backgroundColor: activeAccent }} />
                <span className="uppercase tracking-[0.8em] text-[10px] font-bold" style={{ color: activeAccent }}>The Philosophy</span>
              </div>
              
              <h1 className="text-[12vw] md:text-[8.5vw] font-light leading-[0.85] tracking-tighter uppercase text-white break-words">
                <div className="overflow-hidden pb-2">
                  <motion.span className="block" variants={maskReveal} initial="initial" animate="animate" transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}>
                    {data.headlineLine1 || "Design"}
                  </motion.span>
                </div>
                <div className="overflow-hidden pb-4 -mt-2 md:-mt-6">
                  <motion.span className="block italic font-serif lowercase" style={{ color: activeAccent }} variants={maskReveal} initial="initial" animate="animate" transition={{ delay: 0.15, duration: 1.2 }}>
                    {data.headlineLine2 || "Philosophy"}
                  </motion.span>
                </div>
              </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24 items-start">
              <div className="lg:col-span-7 space-y-16">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                  <h2 className="text-3xl md:text-5xl font-light text-[#fafafa] leading-[1.15] tracking-tight">
                    {data.subheading}
                  </h2>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 1.02 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  className="relative aspect-[16/9] w-full overflow-hidden bg-[#111] border border-white/5 grayscale hover:grayscale-0 transition-all duration-1000 group rounded-2xl shadow-2xl"
                >
                  {data.aboutImage ? (
                    <Image 
                      src={data.aboutImage} 
                      alt="Philosophy Portfolio" 
                      fill 
                      className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50">
                       <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold">Waiting for Visual Asset</span>
                    </div>
                  )}
                </motion.div>

                <div className="space-y-10 text-neutral-400 text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
                  {/* We use data.narrative because the Admin saves the large text box to 'philosophy' */}
                  <p>{data.narrative}</p>
                </div>
              </div>

              <motion.aside style={{ y: smoothY }} className="lg:col-span-5 space-y-16 lg:pl-16 relative mt-20 lg:mt-0">
                <div className="hidden lg:block absolute left-0 top-0 w-px h-full bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
                
                <div className="space-y-8">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-bold">Capabilities</p>
                  <ul className="space-y-6">
                    {data.capabilities?.length > 0 ? data.capabilities.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-6 group">
                        <span className="text-[10px] font-mono opacity-50" style={{ color: activeAccent }}>0{i+1}</span>
                        <span className="text-sm uppercase tracking-widest text-neutral-300 group-hover:text-white transition-all">{item}</span>
                      </li>
                    )) : (
                      <li className="text-[10px] text-zinc-700 uppercase tracking-widest italic">Awaiting Parameters</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-bold">Experience</p>
                  <div className="flex items-end gap-3">
                    <span className="text-8xl font-light text-white italic font-serif leading-none tabular-nums">
                      {data.experienceYears}
                    </span>
                    <div className="pb-2 text-neutral-500">
                       <p className="text-[9px] uppercase tracking-widest leading-tight">Years of</p>
                       <p className="text-[9px] uppercase tracking-widest leading-tight">Industry Craft</p>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';

interface ProjectProps {
  project: {
    id: string;
    title: string;
    category: string;
    cover_image: string;
  };
}

export default function ProjectCard({ project }: ProjectProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseSpringX = useSpring(x, { stiffness: 150, damping: 25 });
  const mouseSpringY = useSpring(y, { stiffness: 150, damping: 25 });

  const rotateX = useTransform(mouseSpringY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseSpringX, [-0.5, 0.5], ["-5deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div whileHover={{ y: -12 }} style={{ perspective: '1000px', width: '100%' }}>
      <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ 
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: '#0a0a0a',
            aspectRatio: '16/11',
            rotateX,
            rotateY,
            transformStyle: "preserve-3d"
          }}
          whileHover="hover"
        >
          <motion.img 
            src={project.cover_image} 
            alt={project.title} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              borderRadius: '11px' 
            }} 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          
          <motion.div
            variants={{ hover: { x: '200%', transition: { duration: 0.9, ease: "easeInOut" } } }}
            initial={{ x: '-100%', skewX: -45 }}
            style={{
              position: 'absolute', top: 0, left: 0, width: '60%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              zIndex: 1
            }}
          />
        </motion.div>

        <div style={{ padding: '20px 5px' }}>
          <div style={{ fontSize: '10px', color: '#fff', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {project.category}
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '8px 0', fontWeight: 400 }}>
            {project.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
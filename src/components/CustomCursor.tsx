"use client";

import React, { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const mouseX = useSpring(0, { damping: 25, stiffness: 150 });
  const mouseY = useSpring(0, { damping: 25, stiffness: 150 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div 
      className="fixed top-0 left-0 w-4 h-4 bg-amber-500 rounded-full z-[9999] pointer-events-none mix-blend-difference hidden lg:block"
      style={{ 
        x: mouseX, 
        y: mouseY, 
        translateX: "-50%", 
        translateY: "-50%" 
      }}
    />
  );
}
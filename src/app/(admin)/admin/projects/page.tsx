"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase"; 
import { Edit3, Trash2, Globe, Image as ImageIcon, Star, X, Upload, Plus, AlertTriangle, CheckCircle2, Layers, Smartphone, FileCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CLIENT-SIDE PORTAL ---
function GlobalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

// --- MODAL SHELL ---
function ModalShell({ isOpen, onClose, children, accentColor = "amber" }: any) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <GlobalPortal>
      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-crosshair" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${accentColor === 'red' ? 'bg-red-600/20' : 'bg-amber-600/20'} rounded-full blur-[60px] -mr-16 -mt-16`} />
              <div className="relative z-10 text-center">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GlobalPortal>
  );
}

export default function ManageProjects() {
  const formRef = useRef<HTMLFormElement>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingProject, setEditingProject] = useState<any>(null);
  
  // --- CRITICAL FIX: Controlled UI State ---
  const [selectedCategory, setSelectedCategory] = useState("Web");

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [apkFile, setApkFile] = useState<File | null>(null);
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: "" });

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Sync category state when editing an existing project
  useEffect(() => {
    if (editingProject) {
      setSelectedCategory(editingProject.category);
    }
  }, [editingProject]);

  const handleCoverChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...newFiles]);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newUrls]);
    }
  };

  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setApkFile(file);
  };

  const removeNewGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index: number) => {
    if (!editingProject) return;
    const updatedGallery = [...editingProject.gallery];
    updatedGallery.splice(index, 1);
    setEditingProject({ ...editingProject, gallery: updatedGallery });
  };

  const resetForm = useCallback(() => {
    setEditingProject(null);
    setCoverPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setApkFile(null);
    setSelectedCategory("Web");
    formRef.current?.reset();
  }, []);

  async function uploadFile(file: File, folder: string = 'projects') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
    return data.publicUrl;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const coverFile = formData.get('coverFile') as File;
      let coverUrl = editingProject?.cover_image || "";
      if (coverFile && coverFile.size > 0) coverUrl = await uploadFile(coverFile);

      let apkUrl = editingProject?.apk_url || "";
      if (apkFile) apkUrl = await uploadFile(apkFile, 'builds');

      let finalGalleryUrls = editingProject?.gallery || [];
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => uploadFile(file));
        const newUrls = await Promise.all(uploadPromises);
        finalGalleryUrls = [...finalGalleryUrls, ...newUrls];
      }

      const projectData = {
        title: formData.get('title'),
        category: selectedCategory, // Use the state variable
        description: formData.get('description'),
        live_link: formData.get('liveLink'),
        apk_url: apkUrl,
        stack: (formData.get('stack') as string).split(',').map(s => s.trim()),
        featured: formData.get('featured') === 'on',
        cover_image: coverUrl,
        gallery: finalGalleryUrls,
        updated_at: new Date().toISOString(),
      };

      if (editingProject) {
        await supabase.from('projects').update(projectData).eq('id', editingProject.id);
      } else {
        await supabase.from('projects').insert([projectData]);
      }

      setSuccessModal({ isOpen: true, message: "Synchronized" });
      resetForm();
      fetchProjects();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 pb-20 selection:bg-amber-500/30">
      
      <ModalShell isOpen={successModal.isOpen} onClose={() => setSuccessModal({ ...successModal, isOpen: false })}>
        <CheckCircle2 className="mx-auto text-amber-500 mb-6" size={56} strokeWidth={1.5} />
        <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-4">Verified</h3>
        <button onClick={() => setSuccessModal({ ...successModal, isOpen: false })} className="w-full bg-white text-black font-black py-6 rounded-2xl uppercase tracking-[0.4em]">Continue</button>
      </ModalShell>

      <ModalShell isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} accentColor="red">
        <AlertTriangle className="mx-auto text-red-500 mb-6" size={56} strokeWidth={1.5} />
        <button onClick={async () => {
             await supabase.from('projects').delete().eq('id', deleteModal.id);
             setDeleteModal({ ...deleteModal, isOpen: false });
             fetchProjects();
        }} className="w-full bg-red-600 text-white font-black py-6 rounded-2xl uppercase tracking-[0.4em]">Confirm Purge</button>
      </ModalShell>

      <div className="max-w-5xl mx-auto px-6 pt-10">
        <header className="mb-12 flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white uppercase italic">{editingProject ? "Edit Entry" : "New Archive"}</h1>
          </div>
          {editingProject && <button onClick={resetForm} className="text-[10px] font-bold uppercase text-red-500 border border-red-900/50 px-6 py-3 rounded-full">Cancel</button>}
        </header>

        <section className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl mb-12">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Project Title</label>
                <input name="title" defaultValue={editingProject?.title} className="w-full bg-zinc-950 border-b border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-amber-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Category</label>
                <select 
                  name="category" 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-zinc-950 border-b border-zinc-800 p-4 rounded-xl text-white outline-none cursor-pointer"
                >
                  <option value="Web">Web Dev</option>
                  <option value="Design">Visual Design</option>
                  <option value="Mobile">Mobile App</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-2"><ImageIcon size={12}/> Hero Identity</label>
                <div className="relative h-48 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[2rem] overflow-hidden flex items-center justify-center group hover:border-amber-500 transition-all">
                  <input type="file" name="coverFile" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                  {coverPreview || editingProject?.cover_image ? (
                    <img src={coverPreview || editingProject?.cover_image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Upload className="text-zinc-700" />
                  )}
                </div>
              </div>

              {/* APK UPLOAD - This check MUST match the option value "Mobile" */}
              <AnimatePresence mode="wait">
                {selectedCategory === "Mobile" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-2"><Smartphone size={12}/> Mobile Build (APK)</label>
                    <div className="relative h-48 bg-zinc-950 border-2 border-dashed border-amber-500/30 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center group hover:border-amber-500 transition-all">
                      <input type="file" accept=".apk" onChange={handleApkChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      {apkFile ? (
                        <div className="text-center px-4">
                          <CheckCircle2 className="text-amber-500 mx-auto mb-2" />
                          <span className="text-[9px] uppercase font-bold text-white truncate block">{apkFile.name}</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="text-zinc-700 mx-auto" />
                          <span className="text-[8px] uppercase font-bold text-zinc-700 mt-2">Upload .apk build</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <input name="stack" defaultValue={editingProject?.stack?.join(", ")} placeholder="Stack (React, GSAP...)" className="w-full bg-zinc-950 border-b border-zinc-800 p-4 rounded-xl text-white outline-none" />
                <input name="liveLink" defaultValue={editingProject?.live_link} placeholder={selectedCategory === "Mobile" ? "App Store Link" : "Live URL"} className="w-full bg-zinc-950 border-b border-zinc-800 p-4 rounded-xl text-white outline-none" />
            </div>

            <textarea name="description" defaultValue={editingProject?.description} placeholder="Project narrative..." className="w-full bg-zinc-950 p-6 rounded-[2rem] text-sm text-white min-h-[150px] outline-none border border-zinc-800" />

            <div className="flex justify-between items-center border-t border-zinc-800 pt-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="featured" defaultChecked={editingProject?.featured} className="w-5 h-5 accent-amber-500" />
                <span className="text-[10px] uppercase font-bold text-zinc-500">Feature on mainstage</span>
              </label>
              <button type="submit" disabled={saving} className="bg-amber-500 text-black font-black py-5 px-12 rounded-full text-[11px] uppercase tracking-[0.3em]">
                {saving ? "Synchronizing..." : "Commit Entry"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
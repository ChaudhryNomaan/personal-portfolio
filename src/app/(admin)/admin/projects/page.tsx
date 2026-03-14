"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase"; 
import { Edit3, Trash2, Globe, Image as ImageIcon, Star, X, Upload, Plus, AlertTriangle, CheckCircle2, Layers } from "lucide-react";
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
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: "" });

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

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
    formRef.current?.reset();
  }, []);

  async function uploadImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `projects/${fileName}`;
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
      if (coverFile && coverFile.size > 0) {
        coverUrl = await uploadImage(coverFile);
      }

      let finalGalleryUrls = editingProject?.gallery || [];
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => uploadImage(file));
        const newUrls = await Promise.all(uploadPromises);
        finalGalleryUrls = [...finalGalleryUrls, ...newUrls];
      }

      const projectData = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        live_link: formData.get('liveLink'),
        stack: (formData.get('stack') as string).split(',').map(s => s.trim()),
        featured: formData.get('featured') === 'on',
        cover_image: coverUrl,
        gallery: finalGalleryUrls,
        updated_at: new Date().toISOString(),
      };

      if (editingProject) {
        const { error } = await supabase.from('projects').update(projectData).eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert([projectData]);
        if (error) throw error;
      }

      setSuccessModal({ isOpen: true, message: editingProject ? "Updated" : "Published" });
      resetForm();
      fetchProjects();
    } catch (err: any) {
      alert("Sync Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 pb-20 selection:bg-amber-500/30">
      
      <ModalShell isOpen={successModal.isOpen} onClose={() => setSuccessModal({ ...successModal, isOpen: false })}>
        <CheckCircle2 className="mx-auto text-amber-500 mb-6" size={56} strokeWidth={1.5} />
        <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-4">Verified</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-10">Entry synchronized with archive.</p>
        <button onClick={() => setSuccessModal({ ...successModal, isOpen: false })} className="w-full bg-white text-black font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em]">Continue</button>
      </ModalShell>

      <ModalShell isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} accentColor="red">
        <AlertTriangle className="mx-auto text-red-500 mb-6" size={56} strokeWidth={1.5} />
        <button onClick={async () => {
             await supabase.from('projects').delete().eq('id', deleteModal.id);
             setDeleteModal({ ...deleteModal, isOpen: false });
             fetchProjects();
        }} className="w-full bg-red-600 text-white font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em]">Confirm Purge</button>
      </ModalShell>

      <div className="max-w-5xl mx-auto px-6 pt-10">
        <header className="mb-12 flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-12 bg-amber-500"></span>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-500">System.Admin</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">{editingProject ? "Edit Entry" : "New Archive"}</h1>
          </div>
          {editingProject && <button onClick={resetForm} className="text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-900/50 px-6 py-3 rounded-full">Cancel</button>}
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
                <select name="category" defaultValue={editingProject?.category} className="w-full bg-zinc-950 border-b border-zinc-800 p-4 rounded-xl text-white outline-none">
                  <option value="Web">Web Dev</option>
                  <option value="Design">Visual Design</option>
                  <option value="App">Mobile App</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-2"><ImageIcon size={12}/> Hero Identity</label>
                <div className="relative h-48 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[2rem] overflow-hidden flex items-center justify-center group hover:border-amber-500 transition-all">
                  <input type="file" name="coverFile" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                  {coverPreview || editingProject?.cover_image ? (
                    <img src={coverPreview || editingProject?.cover_image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Upload className="text-zinc-700 group-hover:text-amber-500 transition-colors" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-2">
                  <Layers size={12}/> Visual Archive ({galleryPreviews.length + (editingProject?.gallery?.length || 0)})
                </label>
                <div className="relative h-48 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[2rem] p-4 overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-3 gap-3">
                    {editingProject?.gallery?.map((url: string, i: number) => (
                      <div key={`old-${i}`} className="relative aspect-square group">
                        <img src={url} className="w-full h-full object-cover rounded-xl border border-zinc-800 opacity-60" alt="" />
                        <button type="button" onClick={() => removeExistingGalleryImage(i)} className="absolute top-1 right-1 bg-red-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                      </div>
                    ))}
                    {galleryPreviews.map((url, i) => (
                      <div key={`new-${i}`} className="relative aspect-square group">
                        <img src={url} className="w-full h-full object-cover rounded-xl border border-amber-500/50" alt="" />
                        <button type="button" onClick={() => removeNewGalleryImage(i)} className="absolute top-1 right-1 bg-red-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                      </div>
                    ))}
                    <div className="relative aspect-square bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer">
                      <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Plus size={16} className="text-zinc-500" />
                      <span className="text-[7px] uppercase font-bold text-zinc-600 mt-1 text-center">Add More</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <input name="stack" defaultValue={editingProject?.stack?.join(", ")} placeholder="Stack (React, GSAP...)" className="bg-zinc-950 border-b border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-amber-500" />
              <input name="liveLink" defaultValue={editingProject?.live_link} placeholder="Live URL" className="bg-zinc-950 border-b border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-amber-500" />
            </div>

            {/* DESCRIPTION: Fixed with whitespace-pre-wrap and break-words */}
            <textarea 
              name="description" 
              defaultValue={editingProject?.description} 
              placeholder="Project narrative..." 
              className="w-full bg-zinc-950 p-6 rounded-[2rem] text-sm text-white min-h-[180px] outline-none border border-transparent focus:border-amber-500/50 resize-none whitespace-pre-wrap break-words leading-relaxed" 
            />

            <div className="flex justify-between items-center border-t border-zinc-800 pt-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="featured" defaultChecked={editingProject?.featured} className="w-5 h-5 accent-amber-500 rounded-md bg-zinc-950 border-zinc-800" />
                <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover:text-amber-500 transition-colors">Feature on mainstage</span>
              </label>
              <button type="submit" disabled={saving} className="bg-amber-500 hover:bg-white text-black font-black py-5 px-12 rounded-full text-[11px] uppercase tracking-[0.3em] transition-all disabled:opacity-50">
                {saving ? "Synchronizing..." : editingProject ? "Commit Updates" : "Publish Archive"}
              </button>
            </div>
          </form>
        </section>

        <div className="grid grid-cols-1 gap-4">
          {projects.map(proj => (
            <div key={proj.id} className="bg-zinc-900 p-4 rounded-[2rem] border border-zinc-800 flex items-center justify-between group hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-4 overflow-hidden">
                <img src={proj.cover_image} className="w-20 h-14 object-cover rounded-xl border border-zinc-800 shrink-0" alt="" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold tracking-tight truncate">{proj.title}</h3>
                    {proj.featured && <Star size={10} className="text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest">{proj.category}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditingProject(proj); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 bg-zinc-800 rounded-xl hover:bg-white hover:text-black transition-all"><Edit3 size={16}/></button>
                <button onClick={() => setDeleteModal({ isOpen: true, id: proj.id, name: proj.title })} className="p-3 bg-zinc-800 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
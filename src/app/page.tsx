import { supabase } from '@/lib/supabase';
import Hero from '@/components/Hero';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomeData() {
  // Fetch hero content and only projects marked as 'featured'
  const [heroRes, projectsRes] = await Promise.all([
    supabase.from('site_config').select('content').eq('id', 'hero_content').maybeSingle(),
    supabase
      .from('projects')
      .select('*')
      .eq('featured', true) // Only show projects checked in admin
      .order('created_at', { ascending: false }) // Order by newest first
  ]);

  return {
    hero: heroRes.data?.content || {
      upperLabel: "Studio",
      mainTitleLine1: "Simplicity is the",
      mainTitleLine2: "ultimate sophistication",
      subtext: "Digital experience designer.",
      location: "Remote",
      availability: "Available"
    },
    projects: projectsRes.data || []
  };
}

export default async function Page() {
  const { hero, projects } = await getHomeData();

  return (
    <main className="min-h-screen bg-black">
      {/* 1. Pass data to the Hero component */}
      <Hero data={hero} />
      
      {/* 2. Pass data to the HomeClient component */}
      <HomeClient initialProjects={projects} heroData={hero} />
    </main>
  );
}
import { supabase } from '@/lib/supabase';
import ArsenalUI from '../../components/ArsenalUI'; 

export const revalidate = 0; // Ensures instant updates

async function getTechData() {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('content')
      .eq('id', 'about_page_content')
      .single();

    // If the row doesn't exist yet or there's an error, use defaults
    if (error || !data?.content) {
      return {
        accentColor: "#f59e0b",
        capabilities: ["Next.js", "Motion Design", "Architectural UI/UX", "TypeScript", "Tailwind CSS"]
      };
    }

    // Return merged data: database values first, fallback to defaults if keys are missing
    return {
      accentColor: data.content.accentColor || "#f59e0b",
      capabilities: data.content.capabilities || []
    };
  } catch (error) {
    console.error("Sync Error:", error);
    return {
      accentColor: "#f59e0b",
      capabilities: ["Error Loading Stack", "Database Sync Required"]
    };
  }
}

export default async function Page() {
  const data = await getTechData();
  return <ArsenalUI data={data} />;
}
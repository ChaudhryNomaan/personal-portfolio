import { Montserrat, Playfair_Display } from 'next/font/google';
import { supabase } from '@/lib/supabase';
import ClientLayout from './ClientLayout';
import './globals.css';

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat',
  display: 'swap', 
  weight: ['300', '400', '500', '700'],
});

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif', 
  style: ['italic', 'normal'],
  display: 'swap',
});

async function getSiteSettings() {
  try {
    const { data } = await supabase
      .from('site_config')
      .select('content')
      .eq('id', 'brand_identity')
      .single();
    return data?.content || {};
  } catch (error) {
    return {};
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`${montserrat.variable} ${playfair.variable} font-sans bg-[#0a0a0a] text-[#fafafa] antialiased selection:bg-amber-500/30 selection:text-amber-200 lg:cursor-none`}
      >
        <ClientLayout settings={settings}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
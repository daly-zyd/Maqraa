import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTopButton } from './ScrollToTopButton';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen flex flex-col relative transition-colors duration-300 font-sans selection:bg-gold-500/30 text-stone-850 dark:text-stone-100 bg-[#f5efe6] dark:bg-[#021710]"
      dir="rtl"
    >
      {/* ─── Global Ambient Background Lighting & Authentic Arabesque ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Warm Gold Radial Bloom (Top Right) */}
        <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-gold-500/12 dark:bg-gold-500/8 blur-[120px]" />
        
        {/* Emerald Radial Bloom (Center Left) */}
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-600/10 dark:bg-emerald-600/15 blur-[130px]" />
        
        {/* Warm Amber Bloom (Bottom Right) */}
        <div className="absolute -bottom-40 right-1/4 w-[700px] h-[700px] rounded-full bg-gold-600/10 dark:bg-gold-600/6 blur-[140px]" />

        {/* Authentic 8-Pointed Star Arabesque SVG Pattern */}
        <div className="absolute inset-0 islamic-arabesque-bg pointer-events-none opacity-90 dark:opacity-60" />
      </div>

      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;

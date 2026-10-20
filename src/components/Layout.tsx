import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTopButton } from './ScrollToTopButton';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col relative bg-paper dark:bg-night text-stone-800 dark:text-stone-100 transition-colors duration-300">
    {/* Page ground: khatam lattice, then the mushaf margin rule on large screens */}
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 islamic-arabesque-bg" />
    <div aria-hidden className="hidden lg:block fixed inset-3 pointer-events-none z-40 mushaf-frame rounded-[2px]" />

    <Navbar />

    <main className="flex-grow relative z-10">{children}</main>

    <Footer />
    <ScrollToTopButton />
  </div>
);

export default Layout;

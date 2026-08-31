import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/Logo Bel Quroan Nahyaa.png';

const navLinks = [
  { name: 'الرئيسية', path: '/' },
  { name: 'من نحن', path: '/about' },
  { name: 'البرامج', path: '/programs' },
  { name: 'المشايخ وفريق العمل', path: '/team' },
  { name: 'الفضاء القرآني', path: '/quran' },
  { name: 'اتصل بنا', path: '/contact' }
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  );
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Sync dark mode with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Scroll shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? isDarkMode
            ? 'shadow-[0_8px_32px_rgba(0,0,0,0.5)] shadow-emerald-950/80'
            : 'shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
          : ''
      }`}
    >
      {/* ─── Gold top border glow ─── */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70" />

      {/* ─── Main Glass Bar ─── */}
      <div
        className={`transition-all duration-500 border-b ${
          isDarkMode
            ? 'bg-[#031c15]/90 border-gold-500/20 backdrop-blur-xl'
            : 'bg-white/85 border-gold-400/25 backdrop-blur-xl'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative w-13 h-13 sm:w-14 sm:h-14"
              >
                {/* Ambient glow ring behind logo */}
                <div className="absolute inset-0 rounded-full bg-gold-400/30 blur-lg scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={logoImg}
                  alt="مقرأة بالقرآن نحيا"
                  className="relative w-full h-full object-contain drop-shadow-md"
                />
              </motion.div>

              <div className="flex flex-col leading-tight">
                <motion.span
                  className={`font-amiri text-xl sm:text-2xl font-extrabold tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-emerald-950'
                  }`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  بالقرآن نحيا
                </motion.span>
                <motion.span
                  className={`text-[11px] font-semibold ${
                    isDarkMode ? 'text-gold-300' : 'text-emerald-700'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  مقرأة قرآنية مجانية 100%
                </motion.span>
              </div>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map((link, i) => {
                const active = isActive(link.path);
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                  >
                    <Link
                      to={link.path}
                      className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group overflow-hidden ${
                        active
                          ? isDarkMode
                            ? 'text-white'
                            : 'text-emerald-900'
                          : isDarkMode
                            ? 'text-white/80 hover:text-white'
                            : 'text-stone-700 hover:text-emerald-900'
                      }`}
                    >
                      {/* Active bg */}
                      {active && (
                        <motion.span
                          layoutId="navActiveBackground"
                          className={`absolute inset-0 rounded-xl ${
                            isDarkMode
                              ? 'bg-gold-500/20 border border-gold-400/50'
                              : 'bg-emerald-50 border border-emerald-200'
                          }`}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      {/* Hover bg */}
                      <span
                        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                          isDarkMode ? 'bg-white/8' : 'bg-stone-100/80'
                        }`}
                      />
                      <span className="relative z-10">{link.name}</span>
                      {/* Animated underline */}
                      {active && (
                        <motion.span
                          layoutId="navUnderline"
                          className="absolute bottom-1 inset-x-3 h-[2px] rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Action Buttons ── */}
            <motion.div
              className="hidden sm:flex items-center gap-2.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Dark mode toggle */}
              <motion.button
                onClick={() => setIsDarkMode(!isDarkMode)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className={`relative p-2.5 rounded-2xl border transition-all duration-300 overflow-hidden group ${
                  isDarkMode
                    ? 'bg-emerald-900/60 border-emerald-700/50 text-white hover:bg-emerald-800/70'
                    : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                }`}
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait">
                  {isDarkMode ? (
                    <motion.span
                      key="sun"
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun className="w-4 h-4 text-gold-300" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon className="w-4 h-4 text-emerald-700" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Admin shortcut */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Link
                  to="/admin"
                  className={`p-2.5 rounded-2xl border transition-all duration-300 flex items-center justify-center ${
                    isDarkMode
                      ? 'bg-emerald-900/60 border-emerald-700/50 text-white hover:bg-emerald-800/70'
                      : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                  }`}
                  title="لوحة تحكم الإدارة"
                >
                  <Lock className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* CTA — Join Free */}
              <motion.a
                href="/#online-learning"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="relative group px-5 py-2.5 rounded-full text-xs font-bold text-emerald-950 bg-gradient-to-l from-gold-500 via-gold-400 to-gold-300 shadow-lg overflow-hidden flex items-center gap-1.5"
              >
                {/* Shimmer overlay */}
                <span className="absolute inset-0 bg-gradient-to-l from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <Sparkles className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">انضم مجاناً</span>
              </motion.a>
            </motion.div>

            {/* ── Mobile Toggles ── */}
            <div className="flex items-center gap-2 xl:hidden">
              <motion.button
                onClick={() => setIsDarkMode(!isDarkMode)}
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 rounded-xl ${
                  isDarkMode ? 'text-white bg-emerald-900/60' : 'text-stone-700 bg-stone-100'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-gold-300" /> : <Moon className="w-5 h-5 text-emerald-700" />}
              </motion.button>
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 rounded-xl ${
                  isDarkMode ? 'text-white bg-emerald-900/60' : 'text-stone-700 bg-stone-100'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="w-6 h-6" />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="w-6 h-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`xl:hidden overflow-hidden border-t ${
                isDarkMode
                  ? 'bg-[#021710]/98 border-emerald-900/40'
                  : 'bg-white/98 border-stone-100'
              }`}
            >
              <div className="px-4 pt-3 pb-5 space-y-1 text-right">
                {navLinks.map((link, i) => {
                  const active = isActive(link.path);
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.05, duration: 0.3 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
                          active
                            ? isDarkMode
                              ? 'text-white bg-gold-500/25 border border-gold-400/60'
                              : 'text-emerald-950 bg-emerald-50 border border-emerald-200'
                            : isDarkMode
                              ? 'text-white hover:bg-white/8'
                              : 'text-stone-800 hover:bg-stone-50'
                        }`}
                      >
                        <span>{link.name}</span>
                        {active && (
                          <span className="w-2 h-2 rounded-full bg-gold-400" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="pt-3 border-t border-stone-200/30 dark:border-emerald-900/40"
                >
                  <a
                    href="/#online-learning"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-emerald-950 bg-gradient-to-l from-gold-500 via-gold-400 to-gold-300 shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    انضم إلى المقرأة مجاناً
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom gold line ─── */}
      <div
        className={`h-[1px] bg-gradient-to-r from-transparent via-gold-400/50 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </motion.nav>
  );
};

export default Navbar;

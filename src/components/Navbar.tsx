import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Lock } from 'lucide-react';
import { ThemeSelector } from '../features/theme/ThemeSelector';
import { UserMenu } from '../features/auth/UserMenu';
import { StarMark } from './StarMark';
import logoImg from '../assets/Logo Bel Quroan Nahyaa.png';

const navLinks = [
  { name: 'الرئيسية', path: '/' },
  { name: 'من نحن', path: '/about' },
  { name: 'البرامج', path: '/programs' },
  { name: 'المشايخ وفريق العمل', path: '/team' },
  { name: 'الفضاء القرآني', path: '/quran' },
  { name: 'اتصل بنا', path: '/contact' }
];

const iconButton =
  'p-2.5 rounded-full text-emerald-900 dark:text-gold-200 hover:bg-emerald-900/8 dark:hover:bg-gold-400/10 transition-colors';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path));

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow] duration-300 backdrop-blur-md ${
        scrolled
          ? 'bg-paper/92 dark:bg-night/92 border-gold-600/35 shadow-[0_6px_24px_-12px_rgba(4,24,18,0.35)]'
          : 'bg-paper/70 dark:bg-night/70 border-gold-600/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-[76px] flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="مقرأة بالقرآن نحيا — الرئيسية">
          <img
            src={logoImg}
            alt=""
            width={52}
            height={52}
            decoding="async"
            className="w-[52px] h-[52px] object-contain drop-shadow-[0_2px_6px_rgba(4,24,18,0.35)]"
          />
          <span className="flex flex-col">
            <span className="text-[22px] font-extrabold leading-tight text-emerald-800 dark:text-gold-300">بالقرآن نحيا</span>
            <span className="text-[12px] leading-tight font-semibold text-gold-700 dark:text-gold-400">
              مقرأة قرآنية مجانية
            </span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-1" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-2 px-4 py-2 text-[15px] font-bold transition-colors ${
                  active
                    ? 'text-emerald-800 dark:text-gold-300'
                    : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-gold-200'
                }`}
              >
                {active && <StarMark className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeSelector />
          <Link to="/admin" className={`${iconButton} hidden sm:inline-flex`} aria-label="لوحة الإدارة">
            <Lock className="w-[18px] h-[18px]" />
          </Link>
          <div className="hidden sm:block ms-2"><UserMenu /></div>
          <a
            href="/#online-learning"
            className="hidden sm:inline-flex ms-1 items-center px-6 py-2.5 rounded-full text-sm font-bold text-emerald-950 bg-gradient-to-b from-gold-300 to-gold-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_6px_16px_-6px_rgba(156,118,35,0.7)] hover:from-gold-200 hover:to-gold-400 transition-colors"
          >
            انضم مجاناً
          </a>
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className={`${iconButton} xl:hidden`}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          id="mobile-menu"
          aria-label="القائمة"
          className="xl:hidden border-t border-gold-600/25 bg-paper dark:bg-night px-4 pt-2 pb-5"
        >
          <ul className="divide-y divide-gold-600/15">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between py-3.5 text-lg font-bold ${
                      active ? 'text-emerald-800 dark:text-gold-300' : 'text-stone-700 dark:text-stone-200'
                    }`}
                  >
                    {link.name}
                    {active && <StarMark className="w-4 h-4 text-gold-600 dark:text-gold-400" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4"><UserMenu block onNavigate={() => setIsOpen(false)} /></div>
          <a
            href="/#online-learning"
            className="mt-3 flex items-center justify-center py-3.5 rounded-full font-bold text-emerald-950 bg-gradient-to-b from-gold-300 to-gold-500"
          >
            انضم إلى المقرأة مجاناً
          </a>
        </nav>
      )}
    </header>
  );
};

export default Navbar;

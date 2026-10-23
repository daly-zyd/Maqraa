import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Lock } from 'lucide-react';
import { ThemeSelector } from '../features/theme/ThemeSelector';
import { UserMenu } from '../features/auth/UserMenu';
import { StarBullet } from './Rosette';
import logoImg from '../assets/logo-brand.webp';

const navLinks = [
  { name: 'الرئيسية', path: '/' },
  { name: 'من نحن', path: '/about' },
  { name: 'البرامج', path: '/programs' },
  { name: 'المشايخ وفريق العمل', path: '/team' },
  { name: 'الفضاء القرآني', path: '/quran' },
  { name: 'اتصل بنا', path: '/contact' }
];

const iconButton =
  'grid place-items-center w-11 h-11 rounded-full border border-gold-500/35 text-gold-300 hover:border-gold-500 hover:text-gold-200 transition-colors';

/**
 * Always on the night ground (the `dark` class scopes every dark: variant inside, menus included):
 * transparent over the home hero, solid with blur once the page scrolls or on any other page.
 */
export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path));
  const solid = scrolled || isOpen || pathname !== '/';
  const join = () => {
    setIsOpen(false);
    navigate('/', { state: { scrollTo: 'join' } });
  };

  return (
    <header
      className={`dark sticky top-0 z-50 text-mist-100 transition-[background-color,box-shadow,border-color] duration-500 ${
        solid
          ? 'bg-night/90 backdrop-blur-md border-b border-gold-500/20 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* h-[76px]: the home hero slides under the bar by the same amount (-mt-[76px]) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="مقرأة بالقرآن نحيا — الرئيسية">
          <img
            src={logoImg}
            alt=""
            width={52}
            height={52}
            decoding="async"
            className="w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full object-cover shadow-[0_0_0_1px_rgba(212,175,106,0.5)]"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[26px] text-gold-300">بالقرآن نحيا</span>
            <span className="text-xs text-mist-400">مقرأة قرآنية مجانية عن بُعد</span>
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
                className={`relative flex items-center gap-2 px-3.5 py-2 text-[15px] font-medium transition-colors ${
                  active ? 'text-gold-300' : 'text-mist-200 hover:text-gold-200'
                }`}
              >
                {active && <StarBullet className="w-2.5 h-2.5 text-gold-500" />}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSelector />
          <Link to="/admin" className={`${iconButton} hidden sm:grid`} aria-label="لوحة الإدارة">
            <Lock className="w-[17px] h-[17px]" />
          </Link>
          <div className="hidden sm:block"><UserMenu /></div>
          <button
            type="button"
            onClick={join}
            className="btn-glow hidden md:inline-flex items-center h-11 px-6 rounded-full text-sm font-bold text-emerald-950 bg-gold-500 hover:bg-gold-400"
          >
            انضم مجاناً
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className={`${iconButton} xl:hidden`}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav id="mobile-menu" aria-label="القائمة" className="xl:hidden border-t border-gold-500/20 bg-night px-4 pt-2 pb-6">
          <ul className="divide-y divide-gold-500/15">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between py-4 text-lg font-medium ${active ? 'text-gold-300' : 'text-mist-200'}`}
                  >
                    {link.name}
                    {active && <StarBullet className="w-3 h-3 text-gold-500" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4"><UserMenu block onNavigate={() => setIsOpen(false)} /></div>
          <button
            type="button"
            onClick={join}
            className="mt-3 w-full h-13 rounded-full font-bold text-emerald-950 bg-gold-500"
          >
            انضم إلى المقرأة مجاناً
          </button>
        </nav>
      )}
    </header>
  );
};

export default Navbar;

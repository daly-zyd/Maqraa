import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Phone } from 'lucide-react';
import { Rosette, StarBullet } from './Rosette';
import logoImg from '../assets/logo-brand.webp';

const quickLinks = [
  { name: 'الرئيسية', path: '/' },
  { name: 'من نحن', path: '/about' },
  { name: 'البرامج والدورات', path: '/programs' },
  { name: 'المشايخ وفريق العمل', path: '/team' },
  { name: 'الفضاء القرآني والتجويد', path: '/quran' },
  { name: 'اتصل بنا', path: '/contact' }
];

const headingClass = 'flex items-center gap-2.5 mb-5 text-lg font-semibold text-gold-300';

export const Footer: React.FC = () => {
  const gregorian = new Date().getFullYear();
  const hijri = Math.round(((gregorian - 622) * 33) / 32);

  return (
    <footer className="dark relative z-10 overflow-hidden bg-night text-mist-300 border-t border-gold-500/25">
      <div aria-hidden className="absolute inset-0 islamic-arabesque-bg opacity-70" />
      <Rosette weight={0.6} className="turn-slow absolute -bottom-56 -end-48 w-[560px] aspect-square text-gold-500 opacity-15" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1.2fr] gap-12">
          <section>
            <Link to="/" className="inline-flex items-center gap-4 mb-5" aria-label="مقرأة بالقرآن نحيا — الرئيسية">
              <img
                src={logoImg}
                alt=""
                width={64}
                height={64}
                loading="lazy"
                className="w-16 h-16 rounded-full object-cover shadow-[0_0_0_1px_rgba(212,175,106,0.5)]"
              />
              <span className="leading-tight">
                <span className="block font-display text-3xl text-gold-400">بالقرآن نحيا</span>
                <span className="block mt-1 text-xs text-mist-400">مقرأة قرآنية مجانية عن بُعد</span>
              </span>
            </Link>
            <p className="max-w-md text-[15px] leading-8">
              منصة تعليمية تُعنى بحفظ القرآن الكريم وضبط تلاوته بالسند المتصل عن بُعد، تحت إشراف فضيلة الشيخ شريف سعد،
              مؤسس المقرأة والمشرف العام عليها. الالتحاق مجاني لجميع الراغبين في العالم.
            </p>
          </section>

          <nav aria-label="أقسام المنصة">
            <h2 className={headingClass}>
              <StarBullet className="w-2.5 h-2.5 text-gold-500" />
              أقسام المنصة
            </h2>
            <ul className="grid gap-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-[15px] text-mist-300 hover:text-gold-200 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section>
            <h2 className={headingClass}>
              <StarBullet className="w-2.5 h-2.5 text-gold-500" />
              التواصل
            </h2>
            <ul className="space-y-4 text-[15px]">
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gold-500 shrink-0 mt-1.5" aria-hidden />
                <span>حلقات التعليم القرآني عن بُعد، عبر الإنترنت لجميع أنحاء العالم</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-500 shrink-0" aria-hidden />
                <bdi className="tabular-nums">+216 58 445 289 · +20 10 62666368</bdi>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-500 shrink-0" aria-hidden />
                <a href="mailto:maqraa.belquorannehya@gmail.com" className="break-all hover:text-gold-200 transition-colors">
                  <bdi>maqraa.belquorannehya@gmail.com</bdi>
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div aria-hidden className="mt-12 mb-6 flex items-center gap-4 text-gold-500/70">
          <span className="h-px flex-1 bg-gradient-to-l from-gold-500/50 to-transparent" />
          <StarBullet className="w-3.5 h-3.5" />
          <span className="h-px flex-1 bg-gradient-to-r from-gold-500/50 to-transparent" />
        </div>

        <p className="text-sm text-mist-400 text-center">
          جميع الحقوق محفوظة لمقرأة بالقرآن نحيا © {hijri}هـ / {gregorian}م
        </p>
      </div>
    </footer>
  );
};

export default Footer;

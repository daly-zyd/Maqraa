import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Phone } from 'lucide-react';
import { StarMark } from './StarMark';
import logoImg from '../assets/Logo Bel Quroan Nahyaa.png';

const quickLinks = [
  { name: 'الرئيسية', path: '/' },
  { name: 'من نحن', path: '/about' },
  { name: 'البرامج والدورات', path: '/programs' },
  { name: 'المشايخ وفريق العمل', path: '/team' },
  { name: 'الفضاء القرآني والتجويد', path: '/quran' },
  { name: 'اتصل بنا', path: '/contact' }
];

const headingClass = 'font-bold text-gold-300 text-lg mb-4 flex items-center gap-2.5';

export const Footer: React.FC = () => {
  const gregorian = new Date().getFullYear();
  const hijri = Math.round(((gregorian - 622) * 33) / 32);

  return (
    <footer className="relative bg-emerald-950 text-stone-300 border-t border-gold-500/50 overflow-hidden">
      <div aria-hidden className="absolute inset-0 islamic-arabesque-bg opacity-70 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1.2fr] gap-12">
          <section>
            <div className="flex items-center gap-4 mb-5">
              <img src={logoImg} alt="" width={64} height={64} loading="lazy" className="w-16 h-16 object-contain" />
              <div className="leading-none">
                <p className="font-thuluth text-3xl text-gilded">بالقرآن نحيا</p>
                <p className="mt-2 text-xs font-semibold text-gold-400">مقرأة قرآنية مجانية</p>
              </div>
            </div>
            <p className="max-w-md text-[15px] leading-8 text-stone-300">
              منصة تعليمية تُعنى بحفظ القرآن الكريم وضبط تلاوته بالسند المتصل عن بُعد، تحت إشراف فضيلة الشيخ شريف سعد،
              مؤسس المقرأة والمشرف العام عليها. الالتحاق مجاني لجميع الراغبين في العالم.
            </p>
          </section>

          <nav aria-label="أقسام المنصة">
            <h3 className={headingClass}>
              <StarMark className="w-3.5 h-3.5" />
              أقسام المنصة
            </h3>
            <ul className="grid grid-cols-1 gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-[15px] text-stone-300 hover:text-gold-300 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section>
            <h3 className={headingClass}>
              <StarMark className="w-3.5 h-3.5" />
              التواصل
            </h3>
            <ul className="space-y-3.5 text-[15px]">
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gold-400 shrink-0 mt-1.5" aria-hidden />
                <span>حلقات التعليم القرآني عن بُعد، عبر الإنترنت لجميع أنحاء العالم</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-400 shrink-0" aria-hidden />
                <span dir="ltr" className="text-start">+216 58 445 289 · +20 10 62666368</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-400 shrink-0" aria-hidden />
                <span dir="ltr" className="text-start break-all">maqraa.belquorannehya@gmail.com</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-10 mb-6 flex items-center gap-4 text-gold-500/70" aria-hidden>
          <span className="h-px flex-1 bg-gradient-to-l from-gold-500/50 to-transparent" />
          <StarMark className="w-5 h-5" />
          <span className="h-px flex-1 bg-gradient-to-r from-gold-500/50 to-transparent" />
        </div>

        <p className="text-sm text-stone-400 text-center">
          جميع الحقوق محفوظة لمقرأة بالقرآن نحيا © {hijri}هـ / {gregorian}م
        </p>
      </div>
    </footer>
  );
};

export default Footer;

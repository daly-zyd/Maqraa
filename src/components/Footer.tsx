import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Phone, Heart, Sparkles } from 'lucide-react';
import logoImg from '../assets/Logo Bel Quroan Nahyaa.png';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const hijriYear = currentYear - 622 + Math.round((currentYear - 622) / 32);

  const quickLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'من نحن', path: '/about' },
    { name: 'البرامج والدورات', path: '/programs' },
    { name: 'المشايخ وفريق العمل', path: '/team' },
    { name: 'الفضاء القرآني والتجويد', path: '/quran' },
    { name: 'اتصل بنا', path: '/contact' }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-emerald-950 via-emerald-950 to-stone-950 text-stone-300 overflow-hidden border-t-2 border-gold-500/40 text-right">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 islamic-pattern pointer-events-none opacity-8" />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* About Column */}
          <div className="flex flex-col gap-5 text-right">
            <div className="flex items-center gap-3.5 justify-start">
              <img
                src={logoImg}
                alt="مقرأة بالقرآن نحيا"
                className="w-14 h-14 object-contain drop-shadow-xl flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-amiri text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-gold-200 via-gold-400 to-gold-500 tracking-wide">
                  مقرأة بالقرآن نحيا
                </span>
                <span className="text-[11px] text-gold-400 font-bold">
                  مقرأة قرآنية مجانية 100%
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light text-right">
              منصة قرآنية تعليمية مجانية تُعنى بحفظ القرآن الكريم وضبط تلاوته بالسند المتصل عن بُعد، تحت إشراف فضيلة الشيخ شريف سعد مؤسس المقرأة والمشرف العام عليها.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400 font-medium justify-start">
              <Sparkles className="w-4 h-4 animate-pulse text-gold-400" />
              <span>متاحة لجميع الراغبين في العالم مجاناً</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-4 text-right">
            <h3 className="font-amiri text-lg font-semibold text-white border-s-2 border-gold-500 ps-3 text-right">
              أقسام المنصة
            </h3>
            <ul className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm text-right">
              {quickLinks.map((link) => (
                <li key={link.path} className="text-right">
                  <Link
                    to={link.path}
                    className="hover:text-gold-400 transition-all duration-200 flex items-center gap-1.5 group text-stone-400"
                  >
                    <span className="text-gold-500/70 group-hover:text-gold-400 group-hover:translate-x-[-3px] transition-transform duration-200 text-xs">←</span>
                    <span className="group-hover:text-stone-200 transition-colors">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-4 text-right">
            <h3 className="font-amiri text-lg font-semibold text-white border-s-2 border-gold-500 ps-3 text-right">
              التواصل والدعم الفني
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-400 text-right">
              <li className="flex items-start gap-3 justify-start">
                <Globe className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-right">حلقات التعليم القرآني عن بُعد (عالمية عبر الإنترنت)</span>
              </li>
              <li className="flex items-center gap-3 justify-start">
                <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span dir="ltr" className="text-right text-xs sm:text-sm">+216 58 445 289 | +20 10 62666368</span>
              </li>
              <li className="flex items-center gap-3 justify-start">
                <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="text-right text-xs sm:text-sm">maqraa.belquorannehya@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="my-8 border-t border-emerald-900/60" />

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-right">
          <p className="text-right">
            جميع الحقوق محفوظة لمقرأة بالقرآن نحيا © {currentYear}هـ / {hijriYear}م • تحت إشراف فضيلة الشيخ شريف سعد
          </p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1 justify-start">
              خدمة لكتاب الله عز وجل
              <Heart className="w-3.5 h-3.5 text-gold-500 fill-current" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

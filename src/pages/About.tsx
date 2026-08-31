import React, { useState, useEffect } from 'react';
import { Target, Eye, Sparkles, BookOpen, ShieldCheck, Heart, CheckCircle2, Award, HeartHandshake } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem } from '../components/Animations';
import { IslamicAvatar } from '../components/Avatars';
import { getSettings } from '../data';
import type { MaqraaSettings } from '../data';
import logoImg from '../assets/Logo Bel Quroan Nahyaa.png';

export const About: React.FC = () => {
  const [settings, setSettings] = useState<MaqraaSettings | null>(null);

  const fetchSettings = () => {
    getSettings().then(setSettings);
  };

  useEffect(() => {
    fetchSettings();
    window.addEventListener('maqraa_data_updated', fetchSettings);
    return () => window.removeEventListener('maqraa_data_updated', fetchSettings);
  }, []);

  const founderName = settings?.founderName || 'فضيلة الشيخ شريف سعد';
  const founderTitle = settings?.founderTitle || 'مؤسس المقرأة والمشرف العام عليها';
  const founderBio = settings?.founderBio || 'مقرئ مجاز بالقراءات العشر الصغرى والكبرى بالسند المتصل إلى رسول الله ﷺ، صاحب مسيرة علمية وتربوية حافلة في خدمة كتاب الله وتعليم النشء وتخريج الحفاظ المتقنين على هدي النبوة والسند المتصل.';

  const values = [
    {
      id: 'ihsan',
      title: 'الإحسان والتميز',
      desc: 'نسعى لبلوغ مراتب الإتقان في تلاوة كتاب الله وتعليمه، وغرس قيم الجودة والتدبر في كل حلقة دراسية.',
      icon: ShieldCheck
    },
    {
      id: 'free',
      title: 'المجانية لوجه الله',
      desc: 'تقديم التعليم القرآني بالمجان دون أي مقابل مالي، تيسيراً لكتاب الله ونشراً لعلومه في أرجاء العالم.',
      icon: HeartHandshake
    },
    {
      id: 'brotherhood',
      title: 'التربية والأخوة',
      desc: 'نوفر بيئة حاضنة مبنية على التناصح، التراحم، والاحترام المتبادل، لتتحول الحلقات إلى أسر إيمانية متعاونة.',
      icon: Heart
    },
    {
      id: 'authenticity',
      title: 'الأصالة والمعاصرة',
      desc: 'نحافظ على السند والإسناد وطرق التلقي العريقة، مستعينين بأحدث الوسائل والتقنيات الرقمية للتعليم عن بُعد.',
      icon: BookOpen
    }
  ];

  const pillars = [
    'إسناد متصل وصحيح إلى النبي ﷺ',
    'تعليم مجاني 100% متاح لجميع دول العالم',
    'فصل تام وخصوصية كاملة بين قسمي الرجال والنساء',
    'دراسة تفاعلية عن بُعد عبر مجموعات WhatsApp المخصصة',
    'كوادر إدارية وتعليمية معتمدة ومتخصصة',
    'متابعة فردية ونظام تقييم واختبارات دورية'
  ];

  return (
    <div className="py-12 sm:py-16 text-right max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. Header Hero */}
      <FadeInUp className="mb-16 text-center flex flex-col items-center">
        {/* Logo emblem */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
          <img 
            src={logoImg} 
            alt="مقرأة بالقرآن نحيا" 
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold text-xs sm:text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>منارة قرآنية مجانية للتعليم عن بُعد</span>
        </div>

        <h1 className="font-amiri text-4xl sm:text-5xl lg:text-6xl font-bold text-emerald-950 dark:text-gold-100 mb-4">
          عن مقرأة "بالقرآن نحيا"
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 mx-auto rounded-full mb-6" />
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-3xl mx-auto leading-relaxed font-light">
          صرح قرآني تعليمي وتربوي تطوعي يُعنى بخدمة كتاب الله عز وجل حفظاً وتجويداً وتدبراً، ويسعى لبناء أجيال قرآنية متمكنة تحمل رسالة الوحي المبارك.
        </p>
      </FadeInUp>

      {/* 2. Founder Section Spotlight (فضيلة الشيخ شريف) */}
      <FadeInUp delay={0.1} className="mb-20">
        <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-stone-900 text-white rounded-3xl p-8 sm:p-12 border border-gold-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute inset-0 islamic-pattern opacity-8 pointer-events-none" />
          
          <div className="flex-shrink-0 flex flex-col items-center gap-3 relative z-10">
            <IslamicAvatar role="sheikh" gender="male" size="xl" className="shadow-2xl" />
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
              المؤسس والمشرف العام
            </span>
          </div>

          <div className="flex flex-col gap-4 relative z-10 text-right">
            <span className="text-xs font-bold text-gold-400 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>إشراف وتوجيه علمي مباشر</span>
            </span>
            <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-gold-200">
              {founderName}
            </h2>
            <span className="text-sm font-semibold text-stone-300">
              {founderTitle}
            </span>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
              {founderBio}
            </p>
            <div className="p-3.5 rounded-2xl bg-emerald-900/60 border border-gold-500/20 text-xs text-gold-300">
              «نذرنا أنفسنا لخدمة راغبي تعلم كتاب الله وتيسير سبل الحفظ والإجازة بالسند المتصل دون أي مقابل مادي، راجين من الله القبول والإخلاص.»
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* 3. Mission & Vision Cards */}
      <div className="mb-20 text-right">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
          
          {/* Mission Card */}
          <FadeInUp className="bg-white dark:bg-emerald-900/25 p-8 sm:p-10 rounded-3xl border border-gold-500/20 dark:border-gold-500/15 shadow-xl flex flex-col gap-6 items-start text-right group hover:border-gold-500/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-500 to-gold-300" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-800/60 dark:to-emerald-900/80 text-emerald-800 dark:text-gold-400 flex items-center justify-center group-hover:scale-105 shadow-inner transition-all duration-300">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="font-amiri text-3xl font-bold text-emerald-950 dark:text-gold-200 text-right">
              رسالتنا السامية
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-light text-right">
              تمكين مختلف فئات المجتمع في كل مكان من الارتباط اليومي بالقرآن الكريم، وضبط التلاوة والمخارج عن طريق الحفظ والتسميع المنهجي مجاناً عن بُعد، مع بث روح التزكية والتربية الإيمانية.
            </p>
          </FadeInUp>

          {/* Vision Card */}
          <FadeInUp delay={0.2} className="bg-white dark:bg-emerald-900/25 p-8 sm:p-10 rounded-3xl border border-gold-500/20 dark:border-gold-500/15 shadow-xl flex flex-col gap-6 items-start text-right group hover:border-gold-500/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-500 to-gold-300" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-800/60 dark:to-emerald-900/80 text-emerald-800 dark:text-gold-400 flex items-center justify-center group-hover:scale-105 shadow-inner transition-all duration-300">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="font-amiri text-3xl font-bold text-emerald-950 dark:text-gold-200 text-right">
              رؤيتنا المستقبلية
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-light text-right">
              أن نكون المرجعية الرائدة عالمياً في التعليم القرآني عن بُعد، متميزين ببيئتنا الإيمانية الميسرة، وضبط السند والإجازات، وتخريج أجيال متقنة لكتاب الله عاملاً به وخادمة لأمتها.
            </p>
          </FadeInUp>

        </div>
      </div>

      {/* 4. Methodology & Pillars Section */}
      <div className="bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-emerald-950/40 py-16 rounded-3xl border border-gold-500/20 mb-20 p-8 sm:p-12">
        <FadeInUp className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-gold-100 mb-2">
            منهجية المقرأة وركائزها
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            تعتمد المقرأة على ضوابط علمية رصينة تجمع بين الأصالة والتقنية الحديثة
          </p>
        </FadeInUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((pillar, idx) => (
            <FadeInUp key={idx} delay={idx * 0.05} className="p-5 rounded-2xl bg-white dark:bg-emerald-900/30 border border-stone-200/60 dark:border-gold-500/10 shadow-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">{pillar}</span>
            </FadeInUp>
          ))}
        </div>
      </div>

      {/* 5. Core Values */}
      <div className="text-right">
        <FadeInUp className="text-center max-w-2xl mx-auto mb-14 flex flex-col items-center gap-3">
          <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-gold-100">
            القيم التي تحكم مسيرتنا
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded-full" />
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-light">
            مبادئ إيمانية ثابتة نتواصى بها ونجعلها أساساً لكل حلقة ودرس.
          </p>
        </FadeInUp>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-right">
          {values.map((val) => {
            const Icon = val.icon;
            return (
              <StaggerItem 
                key={val.id}
                className="bg-white dark:bg-emerald-900/25 p-7 rounded-3xl border border-stone-200/60 dark:border-gold-500/15 shadow-lg text-center flex flex-col items-center gap-4 group hover:border-gold-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-800/60 dark:to-emerald-900/80 text-emerald-800 dark:text-gold-400 flex items-center justify-center group-hover:scale-110 shadow-inner transition-transform duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-gold-200">
                  {val.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                  {val.desc}
                </p>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>

    </div>
  );
};

export default About;

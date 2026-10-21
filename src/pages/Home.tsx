import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPrograms, getSettings, getTeachers } from '../data';
import type { Program, MaqraaSettings, Teacher } from '../data';
import { Card } from '../components/Card';
import { IslamicAvatar } from '../components/Avatars';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  HeartHandshake
} from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem } from '../components/Animations';
import { StarMark } from '../components/StarMark';
import { VersePanel } from '../components/VersePanel';
import { getPublishableVerses } from '../data/verses';
import logoImg from '../assets/Logo Bel Quroan Nahyaa.png';

export const Home: React.FC = () => {
  const [featuredPrograms, setFeaturedPrograms] = useState<Program[]>([]);
  const [settings, setSettings] = useState<MaqraaSettings | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [p, s, t] = await Promise.all([getPrograms(), getSettings(), getTeachers()]);
      if (!mounted) return;
      setFeaturedPrograms(p.slice(0, 3));
      setSettings(s);
      setTeachers(t.slice(0, 3));
      setLoading(false);
    };
    load();
    window.addEventListener('maqraa_data_updated', load);
    return () => {
      mounted = false;
      window.removeEventListener('maqraa_data_updated', load);
    };
  }, []);

  const stats = [
    { id: 1, name: 'طالب وطالبة ملتحقين', value: '+500', icon: Users },
    { id: 2, name: 'شيخ ومعلمة مجازين بالسند', value: '+25', icon: GraduationCap },
    { id: 3, name: 'تكلفة الدراسة والالتحاق', value: 'مجانية 100%', icon: HeartHandshake },
    { id: 4, name: 'برامج قرآنية متخصصة', value: '10', icon: BookOpen }
  ];

  const featuredVerse = getPublishableVerses().find((v) => v.kind === 'ayah');

  const menWhatsappUrl = settings?.whatsappMenUrl || 'https://chat.whatsapp.com/G4g5nZL24LsJ7wjUIt6pgV';
  const womenWhatsappUrl = settings?.whatsappWomenUrl || 'https://chat.whatsapp.com/Iz6Txl9YYFFKSAacjm4Oyx';
  const founderName = settings?.founderName || 'فضيلة الشيخ شريف سعد';
  const founderTitle = settings?.founderTitle || 'مؤسس المقرأة والمشرف العام عليها';
  const founderBio = settings?.founderBio || 'مقرئ مجاز بالقراءات العشر الصغرى والكبرى بالسند المتصل، صاحب مسيرة علمية حافلة في خدمة كتاب الله وتعليم النشء وتخريج الحفاظ المتقنين.';

  return (
    <div className="relative overflow-hidden min-h-screen text-right">
      
      {/* 1. Hero */}
      <section className="relative bg-emerald-950 text-white border-b border-gold-500/50 overflow-hidden">
        <div aria-hidden className="absolute inset-0 islamic-arabesque-bg opacity-80 drift-slow" />
        <div aria-hidden className="absolute inset-0 glow-breathe bg-[radial-gradient(ellipse_at_28%_45%,rgba(191,149,52,0.22),transparent_55%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20 lg:py-24 grid lg:grid-cols-[1.15fr_0.85fr] items-center gap-10 lg:gap-6">
          {/* Words */}
          <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-start gap-6">
            <p className="flex items-center gap-3 text-sm sm:text-base font-semibold text-gold-300">
              <span>عن بُعد</span>
              <StarMark className="w-3.5 h-3.5" />
              <span>مجانية 100%</span>
              <StarMark className="w-3.5 h-3.5" />
              <span>للرجال والنساء</span>
            </p>

            <h1 className="font-thuluth text-gilded text-6xl sm:text-7xl xl:text-8xl leading-[1.5] select-none">
              بالقرآن نحيا
            </h1>

            <p className="max-w-xl text-lg sm:text-xl leading-9 text-stone-200">
              تعلّم القرآن الكريم وحفظه وتجويده وتدبّر معانيه مع نخبة من المشايخ والأساتذة المجازين بالسند المتصل،
              في حلقات مستقلة للرجال والنساء.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
              <a
                href="#online-learning"
                className="inline-flex items-center justify-center gap-2.5 px-9 py-3.5 rounded-full font-bold text-emerald-950 bg-gradient-to-b from-gold-300 to-gold-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_24px_-8px_rgba(0,0,0,0.6)] hover:from-gold-200 hover:to-gold-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5" aria-hidden />
                انضم إلى المقرأة مجاناً
              </a>
              <Link
                to="/programs"
                className="inline-flex items-center justify-center gap-2.5 px-9 py-3.5 rounded-full font-bold text-gold-200 border border-gold-400/70 hover:bg-gold-400/10 transition-colors"
              >
                <BookOpen className="w-5 h-5" aria-hidden />
                البرامج التعليمية
              </Link>
            </div>

            <p className="text-[15px] text-stone-300 mt-1">
              تحت إشراف <strong className="text-gold-300 font-bold">{founderName}</strong>
            </p>
          </div>

          {/* Emblem: the logo sits inside a star ring that draws itself once on load */}
          <div className="order-1 lg:order-2 relative mx-auto w-[min(80vw,440px)] lg:w-full max-w-[520px] aspect-square">
            <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full text-gold-400" aria-hidden fill="none" stroke="currentColor">
              <g className="turn-slow origin-center" strokeWidth="1">
                <circle cx="200" cy="200" r="196" strokeOpacity="0.35" strokeDasharray="2 7" />
              </g>
              <g strokeWidth="1.6" strokeOpacity="0.75">
                <rect pathLength={1} className="ring-draw" x="70" y="70" width="260" height="260" />
                <rect pathLength={1} className="ring-draw" x="70" y="70" width="260" height="260" transform="rotate(45 200 200)" />
              </g>
              <circle cx="200" cy="200" r="168" strokeOpacity="0.3" />
            </svg>
            <img
              src={logoImg}
              alt="شعار مقرأة بالقرآن نحيا"
              width={420}
              height={420}
              fetchPriority="high"
              className="absolute inset-[9%] w-[82%] h-[82%] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>
      </section>

      {/* 2. Stats band: figures divided by gilt rules, no cards */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 rounded-[28px] bg-paper dark:bg-emerald-950 mushaf-frame shadow-[0_24px_48px_-24px_rgba(4,24,18,0.55)]">
          {stats.map((stat, i) => (
            <StaggerItem
              key={stat.id}
              className={`py-7 px-4 text-center ${i % 2 === 1 ? 'border-s' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i > 0 ? 'lg:border-s' : ''} border-gold-600/25`}
            >
              <div className="font-amiri text-3xl sm:text-4xl font-bold text-emerald-800 dark:text-gold-300">{stat.value}</div>
              <div className="mt-1 text-sm sm:text-[15px] text-stone-600 dark:text-stone-300">{stat.name}</div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Verse of the day: only approved entries are public (see data/verses.ts) */}
      {featuredVerse && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16">
          <FadeInUp>
            <VersePanel verse={featuredVerse} />
          </FadeInUp>
        </section>
      )}

      {/* 3. Founder Spotlight Section (فضيلة الشيخ شريف) */}
      <section className="py-10 sm:py-12 bg-amber-500/5 dark:bg-emerald-950/20 border-y border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="bg-white/85 dark:bg-emerald-900/30 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-gold-500/30 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
            
            {/* Founder Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2.5">
              <IslamicAvatar role="sheikh" gender="male" size="xl" className="shadow-xl" />
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                مؤسس المقرأة
              </span>
            </div>

            {/* Founder Info */}
            <div className="flex flex-col gap-3 text-right flex-grow">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-gold-600 dark:text-gold-400">
                <Sparkles className="w-4 h-4" />
                <span>الإشراف العلمي والتربوي العام</span>
              </div>
              <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-100 leading-snug">
                {founderName}
              </h2>
              <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-gold-300">
                {founderTitle}
              </span>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                {founderBio}
              </p>
              <div className="pt-1 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-gold-500" />
                  <span>إسناد متصل إلى النبي ﷺ</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-gold-500" />
                  <span>إشراف وتوجيه لكافة حلقات الرجال والنساء</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Link
                to="/about"
                className="px-5 py-2.5 rounded-2xl font-bold text-xs text-white dark:text-emerald-950 bg-emerald-800 dark:bg-gold-500 hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <span>اقرأ المزيد عن المقرأة</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* 4. Complete Online Learning Section (WhatsApp Groups & Registration) */}
      <section id="online-learning" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-gold-400 font-bold text-xs sm:text-sm mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>تعليم قرآني عن بُعد • متاح لجميع دول العالم مجاناً</span>
          </div>
          <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-gold-100 mb-3">
            نظام التعلّم عن بُعد
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 mx-auto rounded-full mb-4" />
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed">
            تتيح المقرأة حفظ القرآن الكريم وضبط تلاوته من أي مكان في العالم عبر مجموعات WhatsApp المخصصة، مع فصل تام بين الرجال والنساء.
          </p>
        </FadeInUp>

        {/* 2 Main Cards: Men WhatsApp Group + Women WhatsApp Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* 1. Men WhatsApp Card */}
          <FadeInUp className="bg-white dark:bg-emerald-900/25 p-7 sm:p-9 rounded-3xl border border-stone-200/70 dark:border-gold-500/20 shadow-xl relative overflow-hidden flex flex-col justify-between gap-6">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-l from-emerald-600 to-emerald-400" />
            
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-inner flex-shrink-0">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200">
                    قسم الرجال
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">حلقات مخصصة بإشراف المشايخ الفضلاء</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                حلقات قرآنية تفاعلية للرجال والشباب لحفظ كتاب الله وضبط أحكام التجويد والإجازة بالسند المتصل إلى رسول الله ﷺ.
              </p>

              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span>إشراف مباشر من نخبة من المشايخ المقرئين المجازين</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span>مرونة في المواعيد الصباحية والمسائية</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span>تعليم مجاني 100% لوجه الله تعالى</span>
                </li>
              </ul>
            </div>

            <a
              href={menWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-center text-sm text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-700 shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5" />
              <span>انضم إلى مجموعة الرجال عبر WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </FadeInUp>

          {/* 2. Women WhatsApp Card */}
          <FadeInUp delay={0.1} className="bg-white dark:bg-emerald-900/25 p-7 sm:p-9 rounded-3xl border border-stone-200/70 dark:border-gold-500/20 shadow-xl relative overflow-hidden flex flex-col justify-between gap-6">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-l from-lapis-600 to-lapis-400" />
            
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-lapis-100 dark:bg-lapis-900/50 text-lapis-700 dark:text-lapis-300 flex items-center justify-center shadow-inner flex-shrink-0">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200">
                    قسم النساء
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">خصوصية تامة بإشراف المعلمات الفضليات</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                حلقات نسائية مستقلة تماماً تشرف عليها معلمات مجازات، مخصصة لربات البيوت، الطالبات، والأخوات المبتدئات في التلاوة والحفظ.
              </p>

              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lapis-600 dark:text-gold-400 flex-shrink-0" />
                  <span>فصل تام وخصوصية مطلقة للأخوات 100%</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lapis-600 dark:text-gold-400 flex-shrink-0" />
                  <span>إشراف وتسميع مباشر من معلمات متخصصات</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lapis-600 dark:text-gold-400 flex-shrink-0" />
                  <span>بيئة إيمانية تربوية محفزة لجميع الأعمار</span>
                </li>
              </ul>
            </div>

            <a
              href={womenWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-center text-sm text-white bg-gradient-to-l from-lapis-800 to-lapis-700 hover:from-lapis-700 hover:to-lapis-600 shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5" />
              <span>انضمي إلى مجموعة النساء عبر WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </FadeInUp>
        </div>

        {/* Privacy Note */}
        <FadeInUp delay={0.15} className="mb-10 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-800/20 text-xs text-stone-700 dark:text-stone-300 flex items-center gap-3 justify-center text-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
          <span>نلتزم بالخصوصية والآداب الإسلامية التامة، ولا يُسمح باختلاط المجموعات مطلقاً.</span>
        </FadeInUp>

        {/* 3 Simple Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FadeInUp delay={0.2} className="bg-white dark:bg-emerald-900/20 p-5 rounded-2xl border border-stone-200/60 dark:border-gold-500/10 text-center flex flex-col items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-md">1</span>
            <h4 className="font-bold text-emerald-950 dark:text-gold-200 text-sm">الانضمام لمجموعة WhatsApp</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-light">انضم للمجموعة المخصصة لجنسك لتلقي الإعلانات ومواعيد الحلقات.</p>
          </FadeInUp>

          <FadeInUp delay={0.25} className="bg-white dark:bg-emerald-900/20 p-5 rounded-2xl border border-stone-200/60 dark:border-gold-500/10 text-center flex flex-col items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gold-600 text-white font-bold text-sm flex items-center justify-center shadow-md">2</span>
            <h4 className="font-bold text-emerald-950 dark:text-gold-200 text-sm">مفتوحة لجميع المستويات</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-light">لا توجد اختبارات أو شروط، المقرأة ترحب بالجميع من المبتدئين حتى الخاتمين.</p>
          </FadeInUp>

          <FadeInUp delay={0.3} className="bg-white dark:bg-emerald-900/20 p-5 rounded-2xl border border-stone-200/60 dark:border-gold-500/10 text-center flex flex-col items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-md">3</span>
            <h4 className="font-bold text-emerald-950 dark:text-gold-200 text-sm">بدء الحلقات مجاناً 100%</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-light">حضور الحلقات وتسميع القرآن ومراجعة الأحكام بمتابعة مستمرة.</p>
          </FadeInUp>
        </div>
      </section>

      {/* 5. Teachers & Staff Preview */}
      <section className="py-10 sm:py-12 bg-stone-100/50 dark:bg-emerald-950/20 border-y border-gold-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-100">
                المشايخ وفريق العمل
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-light max-w-xl">
                نخبة من المقرئين والمعلمات أصحاب السند المتصل وفريق الإشراف والدعم الفني، متفرغون لخدمة طلاب كتاب الله.
              </p>
            </div>
            <Link
              to="/team"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-850 dark:text-gold-400 hover:text-emerald-700 hover:underline"
            >
              عرض كامل المشايخ وفريق العمل ←
            </Link>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white dark:bg-emerald-900/25 p-5 sm:p-6 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-md flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <IslamicAvatar
                    gender={teacher.gender}
                    role={teacher.category === 'female_teachers' ? 'teacher' : 'sheikh'}
                    size="md"
                  />
                  <div>
                    <h3 className="font-amiri text-lg sm:text-xl font-bold text-emerald-950 dark:text-gold-200">
                      {teacher.name}
                    </h3>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                      {teacher.title}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-light line-clamp-2">
                  {teacher.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Featured Programs */}
      <section className="py-10 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-100">
              برامجنا القرآنية المتميزة
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-light max-w-xl">
              اختر المسار الذي يناسب مستواك وانضم إلى حلقات الحفظ والتجويد مجاناً.
            </p>
          </div>
          <Link
            to="/programs"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-850 dark:text-gold-400 hover:text-emerald-700 hover:underline"
          >
            عرض كافة البرامج ←
          </Link>
        </FadeInUp>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-stone-200 dark:bg-emerald-900/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPrograms.map((program) => (
              <StaggerItem key={program.id}>
                <Card program={program} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* 7. Final Free Registration CTA */}
      <section className="py-10 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-stone-950 text-white rounded-3xl p-8 sm:p-12 border border-gold-500/30 shadow-xl text-center flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-8 pointer-events-none" />
          <div className="w-14 h-14 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-amiri text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-gold-300 to-gold-500">
            ابدأ رحلتك المباركة في حفظ كتاب الله اليوم
          </h2>
          <p className="text-stone-300 max-w-xl text-xs sm:text-sm font-light leading-relaxed">
            المقرأة مفتوحة لجميع الراغبين في شتى بقاع الأرض، وبالمجان احتساباً للأجر وثواب نشر كتاب الله عز وجل.
          </p>
          <a
            href="#online-learning"
            className="px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm text-emerald-950 bg-gradient-to-l from-gold-500 via-gold-400 to-gold-300 hover:from-gold-400 hover:to-gold-200 shadow-xl hover:scale-105 transition-all duration-300"
          >
            انضم إلى مجموعات المقرأة الآن
          </a>
        </FadeInUp>
      </section>

    </div>
  );
};

export default Home;

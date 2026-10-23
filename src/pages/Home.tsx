import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, ShieldCheck } from 'lucide-react';
import { getPrograms, getSettings, getTeachers } from '../data';
import type { Program, MaqraaSettings, Teacher } from '../data';
import { ArchPortrait } from '../components/ArchPortrait';
import { Card } from '../components/Card';
import { Reveal } from '../components/Reveal';
import { Rosette, StarBullet } from '../components/Rosette';
import { VersePanel } from '../components/VersePanel';
import { getPublishableVerses } from '../data/verses';
import logoImg from '../assets/logo-brand.webp';

const STATS = [
  { value: '+500', label: 'طالب وطالبة ملتحقين' },
  { value: '+25', label: 'شيخ ومعلمة مجازين بالسند' },
  { value: '100%', label: 'مجانية الدراسة والالتحاق' },
  { value: '10', label: 'برامج قرآنية متخصصة' }
];

const STEPS = [
  { n: '١', title: 'انضم لمجموعة واتساب', text: 'المجموعة المخصصة لقسمك، لتصلك الإعلانات ومواعيد الحلقات.' },
  { n: '٢', title: 'مفتوحة لجميع المستويات', text: 'لا اختبار ولا شروط، من المبتدئ حتى الخاتم.' },
  { n: '٣', title: 'ابدأ الحلقات مجاناً', text: 'حضور وتسميع ومراجعة الأحكام بمتابعة مستمرة.' }
];

const SECTIONS = [
  {
    id: 'men',
    eyebrow: 'قسم الرجال',
    title: 'حلقات المشايخ الفضلاء',
    text: 'حلقات تفاعلية للرجال والشباب لحفظ كتاب الله وضبط أحكام التجويد والإجازة بالسند المتصل إلى رسول الله ﷺ.',
    points: ['إشراف مباشر من مشايخ مقرئين مجازين', 'مواعيد صباحية ومسائية مرنة', 'تعليم مجاني لوجه الله تعالى'],
    cta: 'انضم إلى مجموعة الرجال',
    card: 'bg-emerald-900 border-emerald-800 text-mist-100',
    accent: 'text-gold-300',
    title_: 'text-gold-400',
    body: 'text-mist-300',
    button: 'bg-gold-500 hover:bg-gold-400 text-emerald-950',
    turn: 'turn-slow'
  },
  {
    id: 'women',
    eyebrow: 'قسم النساء',
    title: 'بإشراف المعلمات الفضليات',
    text: 'حلقات نسائية مستقلة تماماً تشرف عليها معلمات مجازات، لربات البيوت والطالبات والمبتدئات في التلاوة والحفظ.',
    points: ['فصل تام وخصوصية مطلقة', 'تسميع مباشر من معلمات متخصصات', 'بيئة إيمانية محفزة لجميع الأعمار'],
    cta: 'انضمي إلى مجموعة النساء',
    card: 'bg-oxblood-900 border-oxblood-800 text-oxblood-50',
    accent: 'text-oxblood-200',
    title_: 'text-oxblood-200',
    body: 'text-oxblood-100/85',
    button: 'bg-oxblood-300 hover:bg-oxblood-200 text-oxblood-900',
    turn: 'turn-back-slow'
  }
] as const;

const sectionHeading = 'font-display font-bold text-5xl sm:text-[56px] leading-tight text-emerald-900 dark:text-gold-300';
const eyebrow = 'text-sm font-semibold tracking-[0.08em] text-gold-700 dark:text-gold-400';

export const Home: React.FC = () => {
  const [featuredPrograms, setFeaturedPrograms] = useState<Program[]>([]);
  const [settings, setSettings] = useState<MaqraaSettings | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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

  // "Join" buttons elsewhere navigate here with { scrollTo: 'join' } (a #hash would be a route under HashRouter)
  const scrollTarget = (location.state as { scrollTo?: string } | null)?.scrollTo;
  useEffect(() => {
    if (!scrollTarget) return;
    document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navigate('.', { replace: true, state: null });
  }, [scrollTarget, navigate]);

  const scrollToJoin = () => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const featuredVerse = getPublishableVerses().find((v) => v.kind === 'ayah');
  const whatsapp = {
    men: settings?.whatsappMenUrl || 'https://chat.whatsapp.com/G4g5nZL24LsJ7wjUIt6pgV',
    women: settings?.whatsappWomenUrl || 'https://chat.whatsapp.com/Iz6Txl9YYFFKSAacjm4Oyx'
  };
  const founderName = settings?.founderName || 'فضيلة الشيخ شريف سعد';

  return (
    <div className="relative overflow-hidden">
      {/* ===== Hero (slides under the transparent header: 76px = the Navbar's h-[76px]) ===== */}
      <section className="dark relative -mt-[76px] pt-[76px] min-h-[min(100svh,960px)] overflow-hidden bg-night text-mist-100 bg-[radial-gradient(120%_80%_at_20%_30%,var(--color-emerald-800)_0%,var(--color-night)_60%)]">
        <div aria-hidden className="absolute -inset-20 islamic-arabesque-bg opacity-90 drift-slow" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-40 lg:pt-12 flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 min-w-0 text-center lg:text-start">
            <p className="rise rise-1 flex flex-wrap justify-center lg:justify-start gap-2.5 mb-7">
              <span className="px-4 py-2 rounded-full text-sm font-semibold text-gold-300 bg-gold-500/12 border border-gold-500/35">مجانية 100%</span>
              <span className="px-4 py-2 rounded-full text-sm text-mist-200 border border-mist-100/20">عن بُعد من كل مكان</span>
              <span className="px-4 py-2 rounded-full text-sm text-mist-200 border border-mist-100/20">حلقات مستقلة للرجال والنساء</span>
            </p>
            <h1 className="rise rise-2 font-display font-bold text-[clamp(4.5rem,10vw,9.75rem)] leading-[1.05] text-gold-400 [text-shadow:0_0_60px_rgba(212,175,106,0.25)]">
              بالقرآن نحيا
            </h1>
            <p className="rise rise-3 mt-6 mx-auto lg:mx-0 max-w-xl text-lg sm:text-[21px] leading-[1.9] font-light text-mist-300">
              تعلّم القرآن الكريم وحفظه وتجويده وتدبّر معانيه مع نخبة من المشايخ والمعلمات المجازين بالسند المتصل.
            </p>
            <div className="rise rise-4 mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5">
              <button
                type="button"
                onClick={scrollToJoin}
                className="btn-glow relative overflow-hidden inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-full bg-gold-500 text-emerald-950 text-[17px] font-bold"
              >
                <span aria-hidden className="sheen absolute inset-0" />
                <span className="relative">انضم إلى المقرأة مجاناً</span>
                <ChevronLeft className="relative w-5 h-5" aria-hidden />
              </button>
              <Link
                to="/programs"
                className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-mist-100/30 text-[17px] font-semibold text-mist-100 hover:border-gold-500 hover:text-gold-200 transition-colors"
              >
                البرامج التعليمية
              </Link>
            </div>
            <Link
              to="/about"
              className="rise rise-5 mt-9 inline-flex items-center gap-3 text-[15px] text-mist-400 hover:text-gold-200 transition-colors"
            >
              <span aria-hidden className="w-10 h-px bg-gold-500" />
              تحت إشراف {founderName}
            </Link>
          </div>

          {/* Rosette around the logo medallion */}
          <div className="relative flex-1 min-w-0 w-full grid place-items-center h-[min(86vw,620px)]">
            <div aria-hidden className="glow-breathe absolute w-[84%] aspect-square rounded-full bg-[radial-gradient(circle,rgba(212,175,106,0.28),rgba(212,175,106,0)_65%)]" />
            <Rosette className="turn-slow absolute w-full max-w-[620px] aspect-square text-gold-500" />
            <Rosette variant="star" weight={0.6} className="turn-back-slow absolute w-[64%] max-w-[400px] aspect-square text-gold-300/60" />
            <div className="relative w-[40%] max-w-[250px] aspect-square rounded-full p-2 bg-emerald-900 shadow-[0_0_0_1px_rgba(212,175,106,0.6),0_0_0_10px_rgba(212,175,106,0.06),0_40px_90px_-20px_rgba(0,0,0,0.7)]">
              <img
                src={logoImg}
                alt="شعار مقرأة بالقرآن نحيا"
                width={250}
                height={250}
                fetchPriority="high"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span aria-hidden className="twinkle absolute top-[12%] left-[16%] w-1 h-1 rounded-full bg-gold-50" />
            <span aria-hidden className="twinkle absolute bottom-[18%] right-[10%] w-[3px] h-[3px] rounded-full bg-gold-50 [animation-delay:1.3s]" />
            <span aria-hidden className="twinkle absolute top-[32%] right-[5%] w-[5px] h-[5px] rounded-full bg-gold-300 [animation-delay:2.2s]" />
          </div>
        </div>
      </section>

      {/* ===== Stats, overlapping the hero ===== */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 -mt-24">
        <Reveal className="grid grid-cols-2 lg:grid-cols-4 rounded-[28px] border border-stone-300 dark:border-gold-500/20 bg-stone-100 dark:bg-emerald-900 px-4 py-8 sm:py-9 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-3 py-3 text-center ${i % 2 === 1 ? 'border-s' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i > 0 ? 'lg:border-s' : ''} border-stone-300/80 dark:border-gold-500/15`}
            >
              <p className="font-serif font-bold text-4xl sm:text-[52px] leading-none text-emerald-900 dark:text-gold-300">{s.value}</p>
              <p className="mt-2.5 text-sm sm:text-[15px] text-stone-600 dark:text-mist-300">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ===== Verse: only approved entries are public (see data/verses.ts) ===== */}
      {featuredVerse && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20">
          <Reveal>
            <VersePanel verse={featuredVerse} />
          </Reveal>
        </section>
      )}

      {/* ===== Men / women ===== */}
      <section id="join" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">
        <Reveal className="text-center mb-14">
          <p className={eyebrow}>نظام التعلّم عن بُعد</p>
          <h2 className={`mt-2.5 ${sectionHeading}`}>قسمان مستقلان، منهج واحد</h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg leading-[1.9] text-stone-600 dark:text-mist-300">
            حفظ القرآن الكريم وضبط تلاوته من أي مكان في العالم عبر مجموعات واتساب مخصصة، مع فصل تام بين الرجال والنساء.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-7">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.12} as="article" className={`lift arch relative overflow-hidden border px-8 sm:px-11 pt-28 pb-11 ${s.card}`}>
              <Rosette variant="star" weight={1} className={`${s.turn} absolute -top-32 left-1/2 -ml-[150px] w-[300px] aspect-square opacity-25 ${s.accent}`} />
              <p className={`relative text-center text-sm font-semibold ${s.accent}`}>{s.eyebrow}</p>
              <h3 className={`relative mt-2 text-center font-display text-4xl sm:text-[40px] ${s.title_}`}>{s.title}</h3>
              <p className={`mt-5 text-center text-[17px] leading-[1.9] ${s.body}`}>{s.text}</p>
              <ul className="mt-7 flex flex-col gap-3.5 text-base">
                {s.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-3">
                    <StarBullet className={`w-3.5 h-3.5 shrink-0 ${s.accent}`} />
                    {pt}
                  </li>
                ))}
              </ul>
              <a
                href={whatsapp[s.id]}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-glow mt-9 flex items-center justify-center gap-2.5 h-14 rounded-full font-bold transition-colors ${s.button}`}
              >
                <MessageCircle className="w-5 h-5" aria-hidden />
                {s.cta}
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex items-center justify-center gap-3 text-center text-sm text-stone-600 dark:text-mist-300">
          <ShieldCheck className="w-5 h-5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
          نلتزم بالخصوصية والآداب الإسلامية التامة، ولا يُسمح باختلاط المجموعات مطلقاً.
        </Reveal>
      </section>

      {/* ===== Steps ===== */}
      <section className="bg-paper-deep dark:bg-emerald-950 border-y border-stone-300/70 dark:border-gold-500/10 py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal as="div" className="text-center mb-16">
            <h2 className={sectionHeading}>ثلاث خطوات للانطلاق</h2>
          </Reveal>
          <div className="relative">
          <div aria-hidden className="hidden md:block absolute top-11 inset-x-[16%] border-t border-dashed border-gold-600/60" />
          <ol className="relative grid md:grid-cols-3 gap-12 md:gap-10">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} as="li" delay={i * 0.12} className="relative text-center">
                <div className="relative mx-auto w-[88px] h-[88px] grid place-items-center">
                  <svg viewBox="-110 -110 220 220" aria-hidden className="absolute inset-0 w-full h-full">
                    <polygon points="100,0 -70.71,70.71 0,-100 70.71,70.71 -100,0 70.71,-70.71 0,100 -70.71,-70.71" className="fill-emerald-900 stroke-gold-500" strokeWidth={4} />
                  </svg>
                  <span className="relative font-serif font-bold text-3xl text-gold-300">{s.n}</span>
                </div>
                <h3 className="mt-5 mb-2 text-[21px] font-bold text-emerald-900 dark:text-gold-200">{s.title}</h3>
                <p className="mx-auto max-w-xs text-base leading-8 text-stone-600 dark:text-mist-300">{s.text}</p>
              </Reveal>
            ))}
          </ol>
          </div>
        </div>
      </section>

      {/* ===== Team ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
          <div>
            <p className={eyebrow}>أهل القرآن</p>
            <h2 className={`mt-2 ${sectionHeading}`}>المشايخ وفريق العمل</h2>
          </div>
          <Link to="/team" className="self-start sm:self-auto pb-1 border-b border-gold-600 font-semibold text-emerald-900 dark:text-gold-300 hover:text-emerald-700 dark:hover:text-gold-200">
            عرض الفريق كاملاً
          </Link>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {teachers.map((t, i) => (
            <Reveal key={t.id} as="article" delay={i * 0.1} className="lift rounded-3xl border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40 p-7 text-center">
              <ArchPortrait name={t.name} className="mx-auto" />
              <h3 className="mt-6 mb-1 text-[21px] font-bold text-emerald-900 dark:text-gold-200">{t.name}</h3>
              <p className="text-[15px] font-semibold text-gold-700 dark:text-gold-400">{t.title}</p>
              <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-mist-300 line-clamp-2">{t.bio}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Programmes ===== */}
      <section className="bg-stone-50 dark:bg-emerald-950 border-t border-stone-300/70 dark:border-gold-500/10 py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
            <div>
              <p className={eyebrow}>مسارات الحفظ والتجويد</p>
              <h2 className={`mt-2 ${sectionHeading}`}>برامجنا القرآنية</h2>
            </div>
            <Link to="/programs" className="self-start sm:self-auto pb-1 border-b border-gold-600 font-semibold text-emerald-900 dark:text-gold-300 hover:text-emerald-700 dark:hover:text-gold-200">
              عرض كافة البرامج
            </Link>
          </Reveal>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 rounded-3xl bg-stone-200 dark:bg-emerald-900/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPrograms.map((program, i) => (
                <Reveal key={program.id} delay={i * 0.1}>
                  <Card program={program} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== Final call ===== */}
      <section className="dark relative overflow-hidden px-4 sm:px-6 py-32 text-center bg-night text-mist-100 bg-[radial-gradient(90%_120%_at_50%_0%,var(--color-emerald-800),var(--color-night)_70%)]">
        <Rosette className="turn-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] max-w-none aspect-square opacity-15 text-gold-500" weight={0.6} />
        <Reveal className="relative">
          <h2 className="font-display font-bold text-[clamp(2.75rem,6vw,4.75rem)] leading-tight text-gold-400">ابدأ رحلتك مع كتاب الله اليوم</h2>
          <p className="mt-5 mx-auto max-w-2xl text-[19px] leading-[1.9] text-mist-300">
            المقرأة مفتوحة للجميع في شتى بقاع الأرض، بالمجان، احتساباً للأجر.
          </p>
          <button
            type="button"
            onClick={scrollToJoin}
            className="btn-glow mt-10 inline-flex items-center h-15 px-10 rounded-full bg-gold-500 text-emerald-950 text-lg font-bold"
          >
            انضم إلى المقرأة الآن
          </button>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;

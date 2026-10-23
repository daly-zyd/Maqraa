import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Award, Calendar, ChevronLeft, ChevronRight, Clock, Loader2, User } from 'lucide-react';
import { getProgramBySlug } from '../data';
import type { Program } from '../data';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { Rosette, StarBullet } from '../components/Rosette';

const SECTION_LABEL: Record<Program['section'], string> = {
  both: 'متاح للرجال والنساء (حلقات منفصلة)',
  rijel: 'قسم الرجال',
  nissa: 'قسم النساء'
};

const panel = 'rounded-3xl border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40 p-7 sm:p-9';
const panelTitle = 'font-display font-bold text-3xl sm:text-4xl text-emerald-900 dark:text-gold-300 mb-5';

export const ProgramDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (slug ? getProgramBySlug(slug) : Promise.resolve(undefined)).then((data) => {
      if (!mounted) return;
      setProgram(data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <p className="py-32 flex items-center justify-center gap-2 text-stone-500 dark:text-mist-400" role="status">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
        جاري تحميل تفاصيل البرنامج…
      </p>
    );
  }

  if (!program) {
    return (
      <PageHeader title="البرنامج غير موجود" lead="عذراً، لم نتمكن من العثور على البرنامج الذي تبحث عنه.">
        <Link to="/programs" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gold-500 text-emerald-950 font-bold">
          <ChevronRight className="w-4 h-4 ltr:rotate-180" aria-hidden />
          العودة إلى البرامج
        </Link>
      </PageHeader>
    );
  }

  const facts = [
    { label: 'المعلم / المشرف', value: program.teacher, icon: User },
    { label: 'مدة البرنامج', value: program.duration, icon: Clock },
    { label: 'أيام ومواعيد الحلقات', value: program.schedule, icon: Calendar },
    { label: 'القسم المستهدف', value: SECTION_LABEL[program.section], icon: Award }
  ];

  return (
    <div>
      <PageHeader eyebrow={`برنامج قرآني · ${program.level}`} title={program.title} lead={program.shortDescription}>
        <Link to="/programs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-mist-300 hover:text-gold-200">
          <ChevronRight className="w-4 h-4 ltr:rotate-180" aria-hidden />
          العودة إلى البرامج التعليمية
        </Link>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Reveal as="section" className={panel}>
            <h2 className={panelTitle}>عن البرنامج</h2>
            <p className="whitespace-pre-line text-[17px] leading-[1.95] text-stone-700 dark:text-mist-200">{program.description}</p>
          </Reveal>

          {[
            { title: 'أهداف البرنامج', items: program.objectives },
            { title: 'شروط ومتطلبات التسجيل', items: program.prerequisites }
          ]
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <Reveal key={g.title} as="section" className={panel}>
                <h2 className={panelTitle}>{g.title}</h2>
                <ul className="flex flex-col gap-4">
                  {g.items.map((item) => (
                    <li key={item} className="flex gap-3.5 text-[17px] leading-8 text-stone-700 dark:text-mist-200">
                      <StarBullet className="w-3.5 h-3.5 mt-2.5 shrink-0 text-gold-600 dark:text-gold-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
        </div>

        <aside className="lg:sticky lg:top-28 flex flex-col gap-6">
          <Reveal className={`${panel} p-7!`}>
            <h2 className="font-display font-bold text-3xl text-emerald-900 dark:text-gold-300 mb-6">بطاقة البرنامج</h2>
            <dl className="flex flex-col gap-5">
              {facts.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3.5">
                  <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-emerald-900 text-gold-300">
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <div>
                    <dt className="text-sm text-stone-500 dark:text-mist-400">{label}</dt>
                    <dd className="m-0 font-semibold leading-normal text-stone-800 dark:text-mist-100">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => navigate('/', { state: { scrollTo: 'join' } })}
              className="btn-glow mt-8 w-full h-14 rounded-full bg-gold-500 text-emerald-950 font-bold"
            >
              انضم إلى الحلقات مجاناً
            </button>
          </Reveal>

          <Reveal className="dark relative overflow-hidden rounded-3xl border border-gold-500/30 bg-emerald-900 text-mist-100 p-7">
            <Rosette weight={0.9} className="turn-slow absolute -top-16 -end-16 w-48 aspect-square text-gold-500 opacity-20" />
            <h3 className="relative font-display text-2xl text-gold-400">لديك استفسار حول البرنامج؟</h3>
            <p className="relative mt-2 text-[15px] leading-7 text-mist-300">
              تواصل مع قسم الدعم والتسجيل لتوضيح شروط القبول ومواعيد الحلقات.
            </p>
            <Link to="/contact" className="relative mt-4 inline-flex items-center gap-1 font-semibold text-gold-300 hover:text-gold-200">
              تواصل معنا الآن
              <ChevronLeft className="w-4 h-4 ltr:rotate-180" aria-hidden />
            </Link>
          </Reveal>
        </aside>
      </div>
    </div>
  );
};

export default ProgramDetail;

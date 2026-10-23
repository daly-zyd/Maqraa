import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Headphones } from 'lucide-react';
import { getTajweedRules, getStudiedSurahs } from '../data';
import type { TajweedRule, StudiedSurah } from '../data';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { Rosette, StarBullet } from '../components/Rosette';

const panel = 'rounded-[32px] border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40 p-6 sm:p-9';
const panelTitle = 'font-display font-bold text-3xl sm:text-4xl text-emerald-900 dark:text-gold-300';

export const Quran: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<TajweedRule[]>([]);
  const [surahs, setSurahs] = useState<StudiedSurah[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState<string | null>('noon-sakinah');

  useEffect(() => {
    let mounted = true;
    Promise.all([getTajweedRules(), getStudiedSurahs()]).then(([r, s]) => {
      if (!mounted) return;
      setRules(r);
      setSurahs(s);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="علوم القرآن وأحكام الترتيل"
        title="الفضاء القرآني"
        lead="موارد تعليمية لشرح أصول التجويد وتيسير حفظ السور المقررة في مناهج المقرأة."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Tajweed rules: accordion */}
          <Reveal as="section" className={panel}>
            <h2 className={panelTitle}>قواعد التجويد المبسطة</h2>
            <p className="mt-2 mb-7 text-stone-600 dark:text-mist-300">اختر الحكم لعرض الشرح والمثال التطبيقي.</p>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-2xl bg-stone-200 dark:bg-emerald-900/60 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rules.map((rule) => {
                  const open = expandedRule === rule.id;
                  const panelId = `rule-${rule.id}`;
                  return (
                    <div
                      key={rule.id}
                      className={`rounded-2xl border transition-colors ${
                        open ? 'border-gold-500 bg-white dark:bg-emerald-950/60' : 'border-stone-300 dark:border-gold-500/15'
                      }`}
                    >
                      <h3>
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => setExpandedRule(open ? null : rule.id)}
                          className="w-full flex items-center justify-between gap-4 p-5 text-start"
                        >
                          <span className="flex items-center gap-3 text-lg font-bold text-emerald-900 dark:text-mist-100">
                            <StarBullet className={`w-3 h-3 shrink-0 transition-colors ${open ? 'text-gold-500' : 'text-stone-300 dark:text-emerald-700'}`} />
                            {rule.title}
                          </span>
                          <ChevronDown className={`w-5 h-5 shrink-0 text-gold-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden />
                        </button>
                      </h3>
                      {open && (
                        <div id={panelId} className="px-5 pb-6 flex flex-col gap-4 text-[17px] leading-[1.9] text-stone-700 dark:text-mist-200">
                          <p>{rule.explanation}</p>
                          <figure className="mushaf-frame rounded-md bg-stone-100 dark:bg-emerald-900/60 px-5 py-4">
                            <figcaption className="text-sm font-semibold text-gold-700 dark:text-gold-400">مثال تطبيقي</figcaption>
                            <p lang="ar" className="font-quran text-2xl text-emerald-900 dark:text-gold-100">{rule.example}</p>
                          </figure>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Reveal>

          {/* Studied surahs */}
          <Reveal as="section" className={panel}>
            <h2 className={panelTitle}>السور المقررة للحفظ</h2>
            <p className="mt-2 mb-7 text-stone-600 dark:text-mist-300">نماذج السور المعتمدة في المناهج التحفيظية.</p>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-32 rounded-2xl bg-stone-200 dark:bg-emerald-900/60 animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-4">
                {surahs.map((s) => (
                  <li key={s.id} className="lift rounded-2xl border border-stone-300 dark:border-gold-500/15 bg-white/70 dark:bg-emerald-950/50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-serif font-bold text-2xl text-emerald-900 dark:text-gold-200">{s.name}</h3>
                      <span
                        className={`shrink-0 px-3 py-0.5 rounded-full text-xs font-semibold ${
                          s.type === 'مكي'
                            ? 'bg-gold-200 text-gold-800 dark:bg-gold-900/60 dark:text-gold-200'
                            : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-800/60 dark:text-emerald-100'
                        }`}
                      >
                        {s.type} · {s.versesCount} آية
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-mist-300">{s.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>

        {/* Listening: no player until real recordings are chosen and licensed */}
        <aside className="lg:sticky lg:top-28">
          <Reveal className="dark relative overflow-hidden rounded-[32px] border border-gold-500/30 bg-emerald-900 text-mist-100 p-8">
            <Rosette weight={0.8} className="turn-slow absolute -top-20 -end-20 w-64 aspect-square text-gold-500 opacity-20" />
            <span className="relative grid place-items-center w-14 h-14 rounded-full border border-gold-500/50 text-gold-300">
              <Headphones className="w-6 h-6" aria-hidden />
            </span>
            <h2 className="relative mt-5 font-display text-3xl text-gold-400">التلاوات النموذجية</h2>
            <p className="relative mt-3 text-[15px] leading-7 text-mist-300">
              تُشارَك التلاوات التعليمية المتقنة برواية حفص عن عاصم داخل مجموعات المقرأة، مع التسميع والتصحيح المباشر من المشايخ والمعلمات.
            </p>
            <button
              type="button"
              onClick={() => navigate('/', { state: { scrollTo: 'join' } })}
              className="btn-glow relative mt-7 w-full h-13 rounded-full bg-gold-500 text-emerald-950 font-bold"
            >
              انضم إلى مجموعات المقرأة
            </button>
          </Reveal>
        </aside>
      </div>
    </div>
  );
};

export default Quran;

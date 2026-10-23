import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, User, X } from 'lucide-react';
import { getArticles, getReflections } from '../data';
import type { Article, Reflection } from '../data';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { Rosette, StarBullet } from '../components/Rosette';

const heading = 'font-display font-bold text-3xl sm:text-4xl text-emerald-900 dark:text-gold-300';

export const Tazkiya: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Article | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getArticles(), getReflections()]).then(([a, r]) => {
      if (!mounted) return;
      setArticles(a);
      setReflections(r);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Native modal dialog: focus trap, Escape and inert page come with showModal()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (selected && dialog && !dialog.open) dialog.showModal();
  }, [selected]);

  const close = () => dialogRef.current?.close();

  return (
    <div>
      <PageHeader
        eyebrow="مدرسة القلوب والتربية الإيمانية"
        title="تزكية وإيمانيات"
        lead="مقالات تربوية وخواطر إيمانية مستوحاة من هدي القرآن الكريم وسنة رسوله ﷺ، تعينك على صلاح القلب وزكاة النفس."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-3 gap-10 items-start">
        <section className="lg:col-span-2">
          <Reveal as="div" className="mb-8">
            <h2 className={heading}>مقالات تربوية</h2>
          </Reveal>
          {loading ? (
            <div className="flex flex-col gap-6">
              {[1, 2].map((n) => (
                <div key={n} className="h-56 rounded-3xl bg-stone-200 dark:bg-emerald-900/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {articles.map((a, i) => (
                <Reveal key={a.id} as="article" delay={i * 0.08} className="lift group overflow-hidden rounded-3xl border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40 flex flex-col sm:flex-row">
                  <div aria-hidden className="dark relative shrink-0 h-28 sm:h-auto sm:w-44 overflow-hidden bg-emerald-900 grid place-items-center">
                    <div className="absolute inset-0 islamic-arabesque-bg opacity-80" />
                    <Rosette weight={1} className="turn-slow relative w-24 aspect-square text-gold-500/70" />
                  </div>
                  <div className="p-6 sm:p-7 flex flex-col gap-3 grow min-w-0">
                    <p className="flex flex-wrap items-center gap-3 text-sm text-stone-500 dark:text-mist-400">
                      <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-800/60 dark:text-emerald-100">{a.category}</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gold-600" aria-hidden />
                        {a.date}
                      </span>
                    </p>
                    <h3 className="text-[22px] leading-normal font-bold text-emerald-900 dark:text-gold-200">{a.title}</h3>
                    <p className="text-[16px] leading-8 text-stone-600 dark:text-mist-300 line-clamp-2">{a.content}</p>
                    <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-300/70 dark:border-gold-500/10">
                      <span className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-mist-300">
                        <User className="w-4 h-4 text-gold-600" aria-hidden />
                        بقلم: <strong className="font-semibold">{a.author}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelected(a)}
                        className="inline-flex items-center gap-1 font-bold text-emerald-900 dark:text-gold-300 hover:text-emerald-700 dark:hover:text-gold-200"
                      >
                        اقرأ المقال
                        <ChevronLeft className="w-4 h-4 ltr:rotate-180 transition-transform group-hover:-translate-x-1" aria-hidden />
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        <aside>
          <Reveal as="div" className="mb-8">
            <h2 className={heading}>خواطر ونفحات</h2>
          </Reveal>
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-36 rounded-3xl bg-stone-200 dark:bg-emerald-900/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {reflections.map((r, i) => (
                <Reveal key={r.id} as="article" delay={i * 0.08}>
                  <figure className="mushaf-frame rounded-md bg-stone-50 dark:bg-emerald-900/40 px-6 py-7 text-center">
                    <StarBullet className="mx-auto mb-4 w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                    <blockquote className="font-serif text-lg leading-[1.95] text-emerald-900 dark:text-mist-100">«{r.content}»</blockquote>
                    <figcaption className="mt-4 text-sm font-semibold text-gold-700 dark:text-gold-400">{r.source}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </aside>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="article-title"
        onClose={() => setSelected(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(100%-2rem,44rem)] max-h-[88vh] overflow-y-auto rounded-[28px] border border-gold-500/30 bg-paper dark:bg-emerald-950 text-stone-800 dark:text-mist-100 p-0 shadow-2xl backdrop:bg-night/75 backdrop:backdrop-blur-sm"
      >
        {selected && (
          <article>
            <header className="dark relative overflow-hidden bg-night px-7 sm:px-9 pt-12 pb-9 text-mist-100">
              <div aria-hidden className="absolute inset-0 islamic-arabesque-bg opacity-90" />
              <Rosette weight={0.8} className="absolute -top-16 -end-16 w-56 aspect-square text-gold-500 opacity-25" />
              <button
                type="button"
                onClick={close}
                aria-label="إغلاق المقال"
                className="absolute top-4 end-4 grid place-items-center w-11 h-11 rounded-full border border-gold-500/40 text-gold-300 hover:border-gold-500"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <p className="relative text-sm font-semibold text-gold-300">{selected.category}</p>
              <h2 id="article-title" className="relative mt-2 font-display font-bold text-3xl sm:text-4xl leading-snug text-gold-400">
                {selected.title}
              </h2>
              <p className="relative mt-4 flex flex-wrap gap-5 text-sm text-mist-300">
                <span className="inline-flex items-center gap-1.5"><User className="w-4 h-4 text-gold-500" aria-hidden />{selected.author}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gold-500" aria-hidden />{selected.date}</span>
              </p>
            </header>
            <p className="px-7 sm:px-9 py-8 whitespace-pre-line text-[17px] leading-[2] text-stone-700 dark:text-mist-200">{selected.content}</p>
            <footer className="px-7 sm:px-9 pb-8 text-center">
              <button type="button" onClick={close} className="h-12 px-8 rounded-full bg-gold-500 text-emerald-950 font-bold hover:bg-gold-400">
                إغلاق المقال
              </button>
            </footer>
          </article>
        )}
      </dialog>
    </div>
  );
};

export default Tazkiya;

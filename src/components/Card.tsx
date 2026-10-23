import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { Program } from '../data/programs';

interface CardProps {
  program?: Program;
  /** Accepted for existing callers; the card has a single (programme) layout. */
  type?: 'program';
  title?: string;
  description?: string;
  /** Accepted for existing callers; the card no longer shows a picture. */
  image?: string;
  badge?: string;
  level?: string;
  duration?: string;
  schedule?: string;
  teacher?: string;
  linkTo?: string;
}

const LEVEL_TONE: Record<string, string> = {
  مبتدئ: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-800/60 dark:text-emerald-100',
  متوسط: 'bg-gold-200 text-gold-800 dark:bg-gold-900/60 dark:text-gold-200',
  متقدم: 'bg-oxblood-100 text-oxblood-700 dark:bg-oxblood-900/70 dark:text-oxblood-200'
};

const sectionBadge = (section: Program['section']) => (section === 'both' ? 'للجنسين' : section === 'rijel' ? 'رجال' : 'نساء');

/** Programme card ("Mihrab nocturne"): parchment leaf, level pill, facts list, link to the programme. */
export const Card: React.FC<CardProps> = (props) => {
  const p = props.program;
  const title = p?.title ?? props.title ?? '';
  const description = p ? p.shortDescription || p.description : props.description ?? '';
  const level = p?.level ?? props.level;
  const badge = p ? sectionBadge(p.section) : props.badge;
  const facts = [
    { label: 'المعلم', value: p?.teacher ?? props.teacher },
    { label: 'المدة', value: p?.duration ?? props.duration },
    { label: 'الموعد', value: p?.schedule ?? props.schedule }
  ].filter((f) => f.value);
  const to = p ? `/programs/${p.slug || p.id}` : props.linkTo ?? '#';

  return (
    <article className="lift group h-full flex flex-col gap-4 rounded-3xl border border-stone-300 dark:border-gold-500/15 bg-stone-100 dark:bg-emerald-900/40 p-7 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        {level && (
          <span className={`px-3.5 py-1 rounded-full text-[13px] font-semibold ${LEVEL_TONE[level] ?? LEVEL_TONE['مبتدئ']}`}>{level}</span>
        )}
        {badge && (
          <span className="px-3.5 py-1 rounded-full text-[13px] font-semibold border border-gold-600/30 text-gold-700 dark:text-gold-300">{badge}</span>
        )}
      </div>
      <h3 className="text-[22px] leading-normal font-bold text-emerald-900 dark:text-gold-200">{title}</h3>
      <p className="text-base leading-8 text-stone-600 dark:text-mist-300 line-clamp-3">{description}</p>
      {facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
          {facts.map((f) => (
            <React.Fragment key={f.label}>
              <dt className="text-gold-700 dark:text-gold-400">{f.label}</dt>
              <dd className="m-0 text-stone-700 dark:text-mist-200 line-clamp-1">{f.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      <Link
        to={to}
        className="mt-auto pt-2 inline-flex items-center gap-1 self-start font-bold text-emerald-900 dark:text-gold-300 hover:text-emerald-700 dark:hover:text-gold-200"
      >
        تفاصيل البرنامج
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden />
      </Link>
    </article>
  );
};

export default Card;

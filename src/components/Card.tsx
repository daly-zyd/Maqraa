import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, BookOpen, ChevronLeft } from 'lucide-react';
import type { Program } from '../data/programs';
import type { Event } from '../data/events';

interface CardProps {
  program?: Program;
  event?: Event;
  type?: 'program' | 'event';
  title?: string;
  description?: string;
  image?: string;
  badge?: string;
  level?: string;
  duration?: string;
  schedule?: string;
  teacher?: string;
  date?: string;
  time?: string;
  location?: string;
  linkTo?: string;
}

export const Card: React.FC<CardProps> = (props) => {
  // If a full program object is passed
  if (props.program) {
    const p = props.program;
    return (
      <div className="group relative flex flex-col h-full bg-white dark:bg-emerald-900/25 rounded-3xl overflow-hidden border border-stone-200/70 dark:border-emerald-800/30 shadow-md hover:shadow-2xl dark:hover:shadow-emerald-950/60 hover:-translate-y-1.5 transition-all duration-350">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300 z-10" />
        <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 islamic-pattern opacity-15 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold-500/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-500/15 blur-2xl" />
          
          <span className="absolute top-4 start-4 px-3.5 py-1 rounded-full text-xs font-bold text-white bg-emerald-800/85 backdrop-blur-md border border-gold-500/40 shadow-md">
            برنامج قرآني
          </span>
          {p.level && (
            <span className="absolute top-4 end-4 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-950 bg-gradient-to-l from-gold-400 to-gold-300 border border-gold-200/50 shadow-md">
              {p.level}
            </span>
          )}

          <div className="relative z-10 flex flex-col items-center gap-2 max-w-[85%]">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-300 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-gold-500/30 transition-all duration-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-amiri text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-md line-clamp-2 group-hover:text-gold-300 transition-colors duration-200">
              {p.title}
            </h3>
          </div>
        </div>

        <div className="flex-grow p-5 sm:p-6 flex flex-col justify-between gap-4">
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light line-clamp-3">
            {p.shortDescription || p.description}
          </p>
          <div className="space-y-2 border-t border-stone-100 dark:border-emerald-800/20 pt-4 text-xs text-stone-500 dark:text-stone-400">
            {p.teacher && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                <span className="line-clamp-1"><strong>المعلم:</strong> {p.teacher}</span>
              </div>
            )}
            {p.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                <span><strong>المدة:</strong> {p.duration}</span>
              </div>
            )}
            {p.schedule && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                <span className="line-clamp-1"><strong>الموعد:</strong> {p.schedule}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Link
              to={`/programs/${p.slug || p.id}`}
              className="flex items-center gap-1 text-sm font-bold text-emerald-800 dark:text-gold-400 hover:text-emerald-600 dark:hover:text-gold-300 group/link"
            >
              تفاصيل أكثر
              <ChevronLeft className="w-4 h-4 transform group-hover/link:-translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to individual props
  const {
    type = 'program',
    title = '',
    description = '',
    badge,
    level,
    duration,
    schedule,
    teacher,
    date,
    time,
    location,
    linkTo = '#'
  } = props;

  return (
    <div className="group relative flex flex-col h-full bg-white dark:bg-emerald-900/25 rounded-3xl overflow-hidden border border-stone-200/70 dark:border-emerald-800/30 shadow-md hover:shadow-2xl dark:hover:shadow-emerald-950/60 hover:-translate-y-1.5 transition-all duration-350">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300 z-10" />
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 flex items-center justify-center p-6 text-center">
        <div className="absolute inset-0 islamic-pattern opacity-15 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold-500/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-500/15 blur-2xl" />
        {badge && (
          <span className="absolute top-4 start-4 px-3.5 py-1 rounded-full text-xs font-bold text-white bg-emerald-800/85 backdrop-blur-md border border-gold-500/40 shadow-md">
            {badge}
          </span>
        )}
        {level && (
          <span className="absolute top-4 end-4 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-950 bg-gradient-to-l from-gold-400 to-gold-300 border border-gold-200/50 shadow-md">
            {level}
          </span>
        )}
        <div className="relative z-10 flex flex-col items-center gap-2 max-w-[85%]">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-300 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-gold-500/30 transition-all duration-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-amiri text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-md line-clamp-2 group-hover:text-gold-300 transition-colors duration-200">
            {title}
          </h3>
        </div>
      </div>

      <div className="flex-grow p-5 sm:p-6 flex flex-col justify-between gap-4">
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light line-clamp-3">
          {description}
        </p>
        <div className="space-y-2 border-t border-stone-100 dark:border-emerald-800/20 pt-4 text-xs text-stone-500 dark:text-stone-400">
          {type === 'program' ? (
            <>
              {teacher && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span className="line-clamp-1"><strong>المعلم:</strong> {teacher}</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span><strong>المدة:</strong> {duration}</span>
                </div>
              )}
              {schedule && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span className="line-clamp-1"><strong>الموعد:</strong> {schedule}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span><strong>التاريخ:</strong> {date}</span>
                </div>
              )}
              {time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span><strong>الوقت:</strong> {time}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-emerald-600 dark:text-gold-400 flex-shrink-0" />
                  <span className="line-clamp-1"><strong>المكان:</strong> {location}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <Link
            to={linkTo}
            className="flex items-center gap-1 text-sm font-bold text-emerald-800 dark:text-gold-400 hover:text-emerald-600 dark:hover:text-gold-300 group/link"
          >
            تفاصيل أكثر
            <ChevronLeft className="w-4 h-4 transform group-hover/link:-translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default Card;

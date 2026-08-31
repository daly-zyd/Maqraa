import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProgramBySlug } from '../data';
import type { Program } from '../data';
import { Clock, User, Award, Calendar, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { FadeInUp } from '../components/Animations';

export const ProgramDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<Program | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async () => {
      setLoading(true);
      if (slug) {
        const data = await getProgramBySlug(slug);
        setProgram(data);
      }
      setLoading(false);
    };
    fetchProgram();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-stone-500 dark:text-stone-400">جاري تحميل تفاصيل البرنامج...</span>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-amiri text-3xl font-bold text-red-600 mb-4">البرنامج غير موجود</h2>
        <p className="text-stone-550 mb-6">عذراً، لم نتمكن من العثور على البرنامج الذي تبحث عنه.</p>
        <Link 
          to="/programs" 
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-800 text-white font-bold hover:bg-emerald-700 transition-colors"
        >
          العودة للبرامج
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Back button */}
      <div className="mb-8">
        <Link
          to="/programs"
          className="inline-flex items-center gap-1 text-sm font-bold text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-gold-400 transition-colors group"
        >
          <ChevronRight className="w-4 h-4" />
          العودة إلى البرامج التعليمية
        </Link>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Details (Col 2) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Header & Title */}
          <FadeInUp className="flex flex-col gap-3">
            <span className="inline-block self-start px-4 py-1 rounded-full text-xs font-bold text-emerald-950 bg-gradient-to-l from-gold-400 to-gold-300 shadow-md">
              {program.level}
            </span>
            <h1 className="font-amiri text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-950 dark:text-gold-100 leading-tight">
              {program.title}
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded-full my-1" />
          </FadeInUp>

          {/* Featured Image with luxury border */}
          <FadeInUp delay={0.1} className="h-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border border-gold-500/30 relative group">
            <img
              src={program.image}
              alt={program.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />
          </FadeInUp>

          {/* Detailed Description */}
          <FadeInUp delay={0.2} className="bg-white dark:bg-emerald-900/25 p-7 sm:p-9 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
            <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200 mb-4 border-s-4 border-gold-500 ps-3">
              عن البرنامج
            </h2>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-light whitespace-pre-line text-sm sm:text-base">
              {program.description}
            </p>
          </FadeInUp>

          {/* Program Objectives */}
          <FadeInUp delay={0.3} className="bg-white dark:bg-emerald-900/25 p-7 sm:p-9 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
            <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200 mb-5 border-s-4 border-gold-500 ps-3">
              أهداف البرنامج
            </h2>
            <ul className="space-y-4">
              {program.objectives.map((obj, index) => (
                <li key={index} className="flex gap-3 text-sm sm:text-base text-stone-700 dark:text-stone-300 font-light">
                  <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </FadeInUp>

          {/* Prerequisites */}
          <FadeInUp delay={0.4} className="bg-white dark:bg-emerald-900/25 p-7 sm:p-9 rounded-3xl border border-stone-200/70 dark:border-gold-500/15 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
            <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200 mb-5 border-s-4 border-gold-500 ps-3">
              شروط ومتطلبات التسجيل
            </h2>
            <ul className="space-y-4">
              {program.prerequisites.map((prereq, index) => (
                <li key={index} className="flex gap-3 text-sm sm:text-base text-stone-700 dark:text-stone-300 font-light">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-gold-400 flex-shrink-0 mt-0.5" />
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </FadeInUp>

        </div>

        {/* Sidebar Info Card (Col 1) */}
        <div className="flex flex-col gap-6">
          
          {/* Main Info Card */}
          <FadeInUp delay={0.2} className="bg-white dark:bg-emerald-900/25 p-7 rounded-3xl border border-stone-200/70 dark:border-gold-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
            
            <h3 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-gold-200 mb-6 pb-4 border-b border-stone-100 dark:border-emerald-800/30">
              بطاقة البرنامج
            </h3>
            
            <div className="space-y-5 text-sm">
              
              {/* Teacher */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-gold-400">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-400 text-xs">المعلم / المشرف</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{program.teacher}</span>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-gold-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-400 text-xs">مدة البرنامج</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{program.duration}</span>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-gold-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-400 text-xs">أيام ومواعيد الحلقات</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 leading-normal">{program.schedule}</span>
                </div>
              </div>

              {/* Section */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-gold-400">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-400 text-xs">القسم المستهدف</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {program.section === 'both' ? 'متاح للرجال والنساء (حلقات منفصلة)' : program.section === 'rijel' ? 'قسم الرجال فقط' : 'قسم النساء فقط'}
                  </span>
                </div>
              </div>

            </div>

            {/* Registration CTA inside card */}
            <div className="mt-8 pt-6 border-t border-stone-100 dark:border-emerald-800/30">
              <Link
                to="/contact"
                className="block w-full py-3.5 px-4 rounded-2xl text-center font-bold text-white dark:text-emerald-950 bg-gradient-to-l from-emerald-800 to-emerald-600 dark:from-gold-500 dark:to-gold-400 hover:shadow-lg transition-all duration-200"
              >
                طلب انضمام للحلقة
              </Link>
            </div>

          </FadeInUp>

          {/* Quick Support Card */}
          <FadeInUp delay={0.3} className="bg-gradient-to-b from-emerald-950 to-emerald-900 text-white p-7 rounded-3xl border border-gold-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-8" />
            <h4 className="font-amiri text-xl font-bold text-gold-300 mb-2">لديك استفسار حول البرنامج؟</h4>
            <p className="text-xs text-stone-300 leading-relaxed font-light mb-5">
              يمكنك التواصل مع قسم الدعم والتسجيل للحصول على توضيحات إضافية حول شروط القبول ومواعيد الاختبار التمهيدي.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
            >
              تواصل معنا الآن ←
            </Link>
          </FadeInUp>

        </div>

      </div>

    </div>
  );
};
export default ProgramDetail;

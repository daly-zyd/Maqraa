import React, { useState, useEffect } from 'react';
import { getPrograms } from '../data';
import type { Program } from '../data';
import { Card } from '../components/Card';
import { FadeInUp } from '../components/Animations';

export const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      const data = await getPrograms();
      setPrograms(data);
      setLoading(false);
    };
    fetchPrograms();
  }, []);

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <FadeInUp className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-amiri text-4xl sm:text-5xl font-bold text-emerald-900 dark:text-gold-100 mb-4">
          البرامج التعليمية والحلقات
        </h1>
        <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full mb-6" />
        <p className="text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed">
          نقدم مسارات تعليمية مدروسة ومتنوعة تناسب الأطفال، المبتدئين، الحفظة، والراغبين في تحصيل الإجازات القرآنية بالسند المتصل.
        </p>
      </FadeInUp>

      {/* Programs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-stone-200 dark:bg-emerald-900/20 animate-pulse border border-stone-200/50 dark:border-emerald-800/10" />
          ))}
        </div>
      ) : programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <Card
              key={program.id}
              type="program"
              title={program.title}
              description={program.shortDescription}
              image={program.image}
              badge={program.section === 'both' ? 'للجنسين' : program.section === 'rijel' ? 'رجال' : 'نساء'}
              level={program.level}
              duration={program.duration}
              schedule={program.schedule}
              teacher={program.teacher}
              linkTo={`/programs/${program.slug}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-stone-500">
          لا توجد برامج متاحة في هذا القسم حالياً.
        </div>
      )}

    </div>
  );
};
export default Programs;

import React, { useState, useEffect } from 'react';
import { getPrograms } from '../data';
import type { Program } from '../data';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';

export const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPrograms().then((data) => {
      if (!mounted) return;
      setPrograms(data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="مسارات الحفظ والتجويد والإجازة"
        title="البرامج التعليمية والحلقات"
        lead="مسارات تعليمية مدروسة تناسب الأطفال والمبتدئين والحفظة والراغبين في تحصيل الإجازات القرآنية بالسند المتصل."
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-stone-200 dark:bg-emerald-900/40 animate-pulse" />
            ))}
          </div>
        ) : programs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, i) => (
              <Reveal key={program.id} delay={(i % 3) * 0.1}>
                <Card program={program} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-center py-16 text-stone-500 dark:text-mist-400">لا توجد برامج متاحة حالياً.</p>
        )}
      </section>
    </div>
  );
};

export default Programs;

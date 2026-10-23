import React, { useState, useEffect } from 'react';
import { BookOpen, Eye, Heart, HeartHandshake, ShieldCheck, Target } from 'lucide-react';
import { getSettings } from '../data';
import type { MaqraaSettings } from '../data';
import { ArchPortrait } from '../components/ArchPortrait';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { Rosette, StarBullet } from '../components/Rosette';

const VALUES = [
  { title: 'الإحسان والتميز', desc: 'نسعى لبلوغ مراتب الإتقان في تلاوة كتاب الله وتعليمه، وغرس قيم الجودة والتدبر في كل حلقة.', icon: ShieldCheck },
  { title: 'المجانية لوجه الله', desc: 'تعليم قرآني بالمجان دون أي مقابل، تيسيراً لكتاب الله ونشراً لعلومه في أرجاء العالم.', icon: HeartHandshake },
  { title: 'التربية والأخوة', desc: 'بيئة حاضنة مبنية على التناصح والتراحم والاحترام، لتتحول الحلقات إلى أسر إيمانية.', icon: Heart },
  { title: 'الأصالة والمعاصرة', desc: 'نحافظ على السند وطرق التلقي العريقة، مستعينين بأحدث وسائل التعليم عن بُعد.', icon: BookOpen }
];

const PILLARS = [
  'إسناد متصل وصحيح إلى النبي ﷺ',
  'تعليم مجاني 100% متاح لجميع دول العالم',
  'فصل تام وخصوصية كاملة بين قسمي الرجال والنساء',
  'دراسة تفاعلية عن بُعد عبر مجموعات واتساب المخصصة',
  'كوادر إدارية وتعليمية معتمدة ومتخصصة',
  'متابعة فردية ونظام تقييم واختبارات دورية'
];

const MISSION = [
  {
    title: 'رسالتنا',
    icon: Target,
    text: 'تمكين مختلف فئات المجتمع في كل مكان من الارتباط اليومي بالقرآن الكريم، وضبط التلاوة والمخارج بالحفظ والتسميع المنهجي مجاناً عن بُعد، مع بث روح التزكية والتربية الإيمانية.'
  },
  {
    title: 'رؤيتنا',
    icon: Eye,
    text: 'أن نكون مرجعية رائدة في التعليم القرآني عن بُعد، متميزين ببيئتنا الإيمانية الميسرة وضبط السند والإجازات، وتخريج أجيال متقنة لكتاب الله عاملة به.'
  }
];

const heading = 'font-display font-bold text-4xl sm:text-5xl leading-tight text-emerald-900 dark:text-gold-300';

export const About: React.FC = () => {
  const [settings, setSettings] = useState<MaqraaSettings | null>(null);

  useEffect(() => {
    const load = () => getSettings().then(setSettings);
    load();
    window.addEventListener('maqraa_data_updated', load);
    return () => window.removeEventListener('maqraa_data_updated', load);
  }, []);

  const founderName = settings?.founderName || 'فضيلة الشيخ شريف سعد';
  const founderTitle = settings?.founderTitle || 'مؤسس المقرأة والمشرف العام عليها';
  const founderBio =
    settings?.founderBio ||
    'مقرئ مجاز بالقراءات العشر الصغرى والكبرى بالسند المتصل إلى رسول الله ﷺ، صاحب مسيرة علمية وتربوية حافلة في خدمة كتاب الله وتعليم النشء وتخريج الحفاظ المتقنين.';

  return (
    <div>
      <PageHeader
        eyebrow="منارة قرآنية مجانية للتعليم عن بُعد"
        title="عن مقرأة بالقرآن نحيا"
        lead="صرح قرآني تعليمي وتربوي تطوعي يُعنى بخدمة كتاب الله حفظاً وتجويداً وتدبراً، ويسعى لبناء أجيال قرآنية تحمل رسالة الوحي."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Founder: night card overlapping the header band */}
        <Reveal className="dark relative -mt-10 overflow-hidden rounded-[32px] border border-gold-500/30 bg-emerald-900 text-mist-100 p-8 sm:p-12 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
          <Rosette weight={0.8} className="turn-slow absolute -top-24 -end-24 w-80 aspect-square text-gold-500 opacity-20" />
          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <ArchPortrait name={founderName} className="bg-night!" />
            <div className="text-center md:text-start">
              <p className="text-sm font-semibold text-gold-300">الإشراف العلمي والتربوي العام</p>
              <h2 className="mt-2 font-display font-bold text-4xl sm:text-5xl text-gold-400">{founderName}</h2>
              <p className="mt-2 font-semibold text-mist-200">{founderTitle}</p>
              <p className="mt-4 max-w-3xl text-[17px] leading-[1.9] text-mist-300">{founderBio}</p>
              <blockquote className="mt-6 border-s-2 border-gold-500 ps-5 font-serif text-lg leading-[1.9] text-gold-200">
                «نذرنا أنفسنا لخدمة راغبي تعلم كتاب الله وتيسير سبل الحفظ والإجازة بالسند المتصل دون أي مقابل مادي، راجين من الله القبول والإخلاص.»
              </blockquote>
            </div>
          </div>
        </Reveal>

        {/* Mission and vision */}
        <section className="grid md:grid-cols-2 gap-7 py-24">
          {MISSION.map(({ title, icon: Icon, text }, i) => (
            <Reveal key={title} as="article" delay={i * 0.12} className="lift rounded-3xl border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40 p-8 sm:p-10">
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-emerald-900 text-gold-300">
                <Icon className="w-7 h-7" aria-hidden />
              </span>
              <h2 className={`mt-6 ${heading}`}>{title}</h2>
              <p className="mt-4 text-[17px] leading-[1.9] text-stone-600 dark:text-mist-300">{text}</p>
            </Reveal>
          ))}
        </section>
      </div>

      {/* Pillars in a framed leaf */}
      <section className="bg-paper-deep dark:bg-emerald-950 border-y border-stone-300/70 dark:border-gold-500/10 py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className={heading}>منهجية المقرأة وركائزها</h2>
            <p className="mt-3 text-stone-600 dark:text-mist-300">ضوابط علمية رصينة تجمع بين الأصالة والتقنية الحديثة</p>
          </Reveal>
          <Reveal className="mushaf-frame rounded-md bg-stone-50 dark:bg-emerald-900/40 p-8 sm:p-12">
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
              {PILLARS.map((p) => (
                <li key={p} className="flex items-center gap-3.5 text-[17px] text-stone-700 dark:text-mist-200">
                  <StarBullet className="w-3.5 h-3.5 shrink-0 text-gold-600 dark:text-gold-400" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Reveal className="text-center mb-14">
          <h2 className={heading}>القيم التي تحكم مسيرتنا</h2>
          <p className="mt-3 text-stone-600 dark:text-mist-300">مبادئ إيمانية ثابتة نتواصى بها ونجعلها أساساً لكل حلقة ودرس.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ title, desc, icon: Icon }, i) => (
            <Reveal key={title} as="article" delay={i * 0.08} className="lift text-center rounded-3xl border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40 p-7">
              <span className="mx-auto grid place-items-center w-14 h-14 rounded-full border border-gold-500/50 text-gold-700 dark:text-gold-300">
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold text-emerald-900 dark:text-gold-200">{title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-mist-300">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;

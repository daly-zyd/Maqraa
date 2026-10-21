import React from 'react';
import { OrnamentDivider } from '../components/OrnamentDivider';
import { StarMark } from '../components/StarMark';
import { VersePanel } from '../components/VersePanel';
import { IslamicAvatar } from '../components/Avatars';
import { Card } from '../components/Card';
import { ThemeSelector } from '../features/theme/ThemeSelector';
import { verses } from '../data/verses';

const SCALES = [
  { name: 'emerald (لون المقرأة — يتغير مع المظهر)', prefix: 'emerald', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'gold (الذهب)', prefix: 'gold', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'oxblood (حفص رجال)', prefix: 'oxblood', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'lapis (نساء)', prefix: 'lapis', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'stone (الرقّ)', prefix: 'stone', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] }
];

const Section: React.FC<{ title: string; note?: string; children: React.ReactNode }> = ({ title, note, children }) => (
  <section className="mb-16">
    <h2 className="font-amiri text-3xl font-bold text-emerald-900 dark:text-gold-200">{title}</h2>
    {note && <p className="mt-1 mb-6 text-stone-600 dark:text-stone-300">{note}</p>}
    {!note && <div className="mb-6" />}
    {children}
  </section>
);

export const Styleguide: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
    <header className="text-center mb-14">
      <h1 className="font-thuluth text-gilded text-6xl sm:text-7xl leading-[1.5]">دليل الأسلوب</h1>
      <OrnamentDivider className="mt-2 mb-4" />
      <p className="max-w-2xl mx-auto text-stone-600 dark:text-stone-300">
        كل الألوان والخطوط والمكوّنات المستعملة في الموقع. غيّر الوضع أو لون المقرأة من الزر
        <span className="inline-block align-middle mx-2"><ThemeSelector /></span>
        لترى أثره هنا مباشرة.
      </p>
    </header>

    <Section title="الألوان" note="مأخوذة من شعارات المقرأة: أخضر المصحف، ذهب الإطارات، عنّابي الحفص، لازورد الحبر، ورق الرقّ.">
      <div className="space-y-6">
        {SCALES.map((scale) => (
          <div key={scale.prefix}>
            <p className="mb-2 text-sm font-bold text-stone-700 dark:text-stone-200">{scale.name}</p>
            <ul className="grid grid-cols-11 rounded-xl overflow-hidden border border-gold-600/30">
              {scale.steps.map((step) => (
                <li key={step} className="h-14 flex items-end justify-center pb-1 text-[10px] font-bold" style={{ backgroundColor: `var(--color-${scale.prefix}-${step})`, color: step < 400 ? '#1d1a15' : '#faf6ee' }}>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>

    <Section title="الخطوط" note="ثلاثة أصوات: ثلث للعناوين، نسخ للنص، ومصحف للآيات فقط.">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gold-600/30 p-6 bg-paper-deep/40 dark:bg-emerald-950/50">
          <p className="font-thuluth text-gilded text-5xl leading-[1.6]">بالقرآن نحيا</p>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">Decotype Thuluth — العنوان الرئيسي واسم المقرأة</p>
        </div>
        <div className="rounded-2xl border border-gold-600/30 p-6 bg-paper-deep/40 dark:bg-emerald-950/50">
          <p className="text-3xl font-extrabold text-emerald-900 dark:text-gold-200">تعلّم القرآن وعلّمه</p>
          <p className="mt-2 text-lg">نص الموقع بخط نسخ مقروء على الهواتف المتواضعة.</p>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">Noto Naskh Arabic — 400 إلى 700</p>
        </div>
        <div className="rounded-2xl border border-gold-600/30 p-6 bg-paper-deep/40 dark:bg-emerald-950/50">
          <p className="font-quran text-3xl text-emerald-950 dark:text-gold-100">﴿ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ﴾</p>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">Amiri Quran — الآيات فقط، بتشكيل كامل</p>
        </div>
      </div>
    </Section>

    <Section title="الأزرار">
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="px-9 py-3.5 rounded-full font-bold text-emerald-950 bg-gradient-to-b from-gold-300 to-gold-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_24px_-8px_rgba(0,0,0,0.45)]">زر رئيسي</button>
        <button type="button" className="px-9 py-3.5 rounded-full font-bold text-emerald-900 dark:text-gold-200 border border-gold-600/70 hover:bg-gold-400/10">زر ثانوي</button>
        <button type="button" className="px-9 py-3.5 rounded-full font-bold text-gold-200 bg-emerald-800 hover:bg-emerald-700">زر داكن</button>
        <button type="button" disabled className="px-9 py-3.5 rounded-full font-bold bg-stone-200 text-stone-500 cursor-not-allowed">معطّل</button>
      </div>
    </Section>

    <Section title="الزخارف" note="علامة ربع الحزب تُنهي القسم وتعلّم الرابط النشط؛ الإطار المذهّب حدّ صفحة المصحف.">
      <div className="flex flex-wrap items-center gap-8">
        <StarMark className="w-10 h-10 text-gold-600 dark:text-gold-400" />
        <OrnamentDivider className="" />
        <div className="mushaf-frame rounded-2xl px-8 py-6 bg-paper-deep/40 dark:bg-emerald-950/50">إطار مصحف</div>
      </div>
    </Section>

    <Section title="الآيات والأحاديث" note="النص كامل ولا يُقطع ولا يوضع على زر أو رسالة خطأ. كل ما يحمل وسم «قيد المراجعة» لا يظهر للزوار قبل اعتماد المالك.">
      <div className="space-y-6">
        {verses.map((v) => (
          <VersePanel key={v.id} verse={v} />
        ))}
      </div>
    </Section>

    <Section title="البطاقات والصور الرمزية">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        <Card
          type="program"
          title="برنامج حفظ القرآن"
          description="مسار منظم للحفظ والمراجعة بإشراف مشايخ مجازين."
          image=""
          badge="رجال"
          level="مبتدئ"
          duration="ستة أشهر"
          schedule="يوميا بعد العشاء"
          teacher="الشيخ محمد"
          linkTo="/programs"
        />
        <div className="flex gap-4 items-end">
          <IslamicAvatar gender="male" role="sheikh" size="lg" />
          <IslamicAvatar gender="female" role="teacher" size="lg" />
        </div>
      </div>
    </Section>

    <Section title="الحركة" note="يظهر المحتوى مرة واحدة عند التمرير، وتتحرك زخرفة البطل ببطء شديد. تُعطَّل كل الحركة تلقائيا عند تفعيل «تقليل الحركة» في النظام." >
      <p className="text-stone-700 dark:text-stone-200">للتجربة: فعّل «تقليل الحركة» في نظامك وأعد تحميل الصفحة.</p>
    </Section>
  </div>
);

export default Styleguide;

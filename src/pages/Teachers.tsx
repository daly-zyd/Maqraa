import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, MessageCircle } from "lucide-react";
import { getTeachers, getSupervisors, getTechSupport } from "../data";
import type { Teacher, Supervisor, TechSupportMember, TeacherCategory } from "../data";
import { ArchPortrait } from "../components/ArchPortrait";
import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { Rosette, StarBullet } from "../components/Rosette";

type FilterTab = "all" | TeacherCategory | "supervisors" | "tech_support";

const CATEGORY_LABEL: Record<TeacherCategory, string> = {
  men_sheikhs: "المشايخ",
  women_sheikhs: "الشيخات",
  female_teachers: "الأستاذات",
  men_team: "فريق العمل (رجال)",
  women_team: "فريق العمل (نساء)",
};

const groupHeading = "font-display font-bold text-4xl sm:text-[44px] leading-tight text-emerald-900 dark:text-gold-300";
const card = "lift rounded-3xl border border-stone-300 dark:border-gold-500/15 bg-stone-50 dark:bg-emerald-900/40";

const GroupTitle: React.FC<{ title: string; lead: string }> = ({ title, lead }) => (
  <Reveal className="mb-10 text-center sm:text-start">
    <h2 className={groupHeading}>{title}</h2>
    <p className="mt-2 text-stone-600 dark:text-mist-300">{lead}</p>
  </Reveal>
);

/** Compact card for the supervision and technical teams: small arch, role, duty, bio. */
const StaffCard: React.FC<{ name: string; role: string; duty: string; bio: string; delay: number }> = ({ name, role, duty, bio, delay }) => (
  <Reveal as="article" delay={delay} className={`${card} p-6 sm:p-7 flex gap-5`}>
    <ArchPortrait name={name} size="md" />
    <div className="min-w-0">
      <h3 className="text-xl font-bold text-emerald-900 dark:text-gold-200">{name}</h3>
      <p className="mt-0.5 text-sm font-semibold text-gold-700 dark:text-gold-400">{role}</p>
      <p className="mt-3 flex items-start gap-2.5 text-[15px] text-stone-700 dark:text-mist-200">
        <StarBullet className="w-3 h-3 mt-2 shrink-0 text-gold-600 dark:text-gold-400" />
        {duty}
      </p>
      <p className="mt-2 text-[15px] leading-7 text-stone-600 dark:text-mist-300">{bio}</p>
    </div>
  </Reveal>
);

export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [techSupport, setTechSupport] = useState<TechSupportMember[]>([]);
  const [activeCategory, setActiveCategory] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [t, s, tech] = await Promise.all([getTeachers(), getSupervisors(), getTechSupport()]);
      if (!mounted) return;
      setTeachers(t);
      setSupervisors(s);
      setTechSupport(tech);
      setLoading(false);
    };
    load();
    window.addEventListener("maqraa_data_updated", load);
    return () => {
      mounted = false;
      window.removeEventListener("maqraa_data_updated", load);
    };
  }, []);

  const countOf = (c: TeacherCategory) => teachers.filter((t) => t.category === c).length;
  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "الكل", count: teachers.length + supervisors.length + techSupport.length },
    ...(Object.keys(CATEGORY_LABEL) as TeacherCategory[])
      .map((c) => ({ id: c as FilterTab, label: CATEGORY_LABEL[c], count: countOf(c) }))
      .filter((t) => t.count > 0),
    { id: "supervisors", label: "الإشراف والمتابعة", count: supervisors.length },
    { id: "tech_support", label: "الدعم الفني", count: techSupport.length },
  ];

  const isAll = activeCategory === "all";
  const showTeachers = isAll || activeCategory in CATEGORY_LABEL;
  const filteredTeachers = isAll ? teachers : teachers.filter((t) => t.category === activeCategory);

  return (
    <div>
      <PageHeader
        eyebrow="الهيئة التعليمية والإدارية"
        title="المشايخ وفريق العمل"
        lead="نخبة من المشايخ الفضلاء والمقرئات المجازات بالسند المتصل، وفريق إشرافي وتقني يسهر على خدمة طلاب كتاب الله."
      >
        <div role="group" aria-label="تصفية الفريق" className="flex flex-wrap justify-center gap-2.5">
          {tabs.map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCategory(tab.id)}
                className={`inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-semibold transition-colors ${
                  active
                    ? "bg-gold-500 text-emerald-950"
                    : "border border-mist-100/20 text-mist-200 hover:border-gold-500 hover:text-gold-200"
                }`}
              >
                {tab.label}
                <span className={`min-w-6 px-1.5 rounded-full text-xs tabular-nums ${active ? "bg-emerald-950/15" : "bg-mist-100/10"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-stone-200 dark:bg-emerald-900/40 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && showTeachers && filteredTeachers.length > 0 && (
          <section className="mb-24">
            {isAll && <GroupTitle title="المشايخ والأساتذة المجازون" lead="القراء المعتمدون والمجازون بالسند المتصل إلى رسول الله ﷺ" />}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredTeachers.map((t, i) => (
                <Reveal key={t.id} as="article" delay={(i % 3) * 0.1} className={`${card} p-7 text-center flex flex-col`}>
                  <ArchPortrait name={t.name} className="mx-auto" />
                  <span className="mt-6 self-center px-3 py-0.5 rounded-full text-xs font-semibold border border-gold-600/30 text-gold-700 dark:text-gold-300">
                    {CATEGORY_LABEL[t.category]}
                  </span>
                  <h3 className="mt-3 text-[21px] font-bold text-emerald-900 dark:text-gold-200">{t.name}</h3>
                  <p className="mt-1 text-[15px] font-semibold text-gold-700 dark:text-gold-400">{t.title}</p>
                  <p className="mt-4 text-[15px] text-stone-700 dark:text-mist-200">
                    <span className="font-semibold text-emerald-900 dark:text-gold-300">التخصص: </span>
                    {t.specialty}
                  </p>
                  <p className="mt-3 text-[15px] leading-7 text-stone-600 dark:text-mist-300">{t.bio}</p>
                  {t.ijazah && (
                    <p className="mt-auto pt-5 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-800 dark:text-gold-400">
                      <Award className="w-4 h-4 shrink-0 text-gold-600" aria-hidden />
                      <span className="truncate">{t.ijazah}</span>
                    </p>
                  )}
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {!loading && (isAll || activeCategory === "supervisors") && supervisors.length > 0 && (
          <section className="mb-24">
            {isAll && <GroupTitle title="فريق الإشراف والمتابعة" lead="إدارة البرامج وتنظيم الحلقات ولجان الاختبارات والقبول" />}
            <div className="grid md:grid-cols-2 gap-6">
              {supervisors.map((s, i) => (
                <StaffCard key={s.id} name={s.name} role={s.role} duty={s.responsibility} bio={s.bio} delay={(i % 2) * 0.1} />
              ))}
            </div>
          </section>
        )}

        {!loading && (isAll || activeCategory === "tech_support") && techSupport.length > 0 && (
          <section className="mb-24">
            {isAll && <GroupTitle title="فريق الدعم الفني" lead="إدارة مجموعات واتساب وقنوات التواصل وتسهيل الحلقات" />}
            <div className="grid md:grid-cols-2 gap-6">
              {techSupport.map((m, i) => (
                <StaffCard key={m.id} name={m.name} role={m.role} duty={m.duty} bio={m.bio} delay={(i % 2) * 0.1} />
              ))}
            </div>
          </section>
        )}

        <Reveal className="dark relative overflow-hidden rounded-[32px] border border-gold-500/30 bg-emerald-900 text-mist-100 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <Rosette weight={0.8} className="turn-slow absolute -bottom-28 -start-20 w-72 aspect-square text-gold-500 opacity-20" />
          <div className="relative text-center md:text-start">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-gold-400">تواجه صعوبة تقنية أو لديك استفسار؟</h2>
            <p className="mt-3 max-w-xl text-mist-300">فريق الدعم الفني متواجد لمساعدتك في الانضمام لمجموعات واتساب وتسهيل حضور الحلقات.</p>
          </div>
          <Link
            to="/contact"
            className="btn-glow relative shrink-0 inline-flex items-center gap-2.5 h-14 px-8 rounded-full bg-gold-500 text-emerald-950 font-bold"
          >
            <MessageCircle className="w-5 h-5" aria-hidden />
            تواصل مع الدعم الفني
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default Teachers;

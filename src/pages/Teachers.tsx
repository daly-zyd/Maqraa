import React, { useState, useEffect, useCallback } from "react";
import { getTeachers, getSupervisors, getTechSupport } from "../data";
import type { Teacher, Supervisor, TechSupportMember, TeacherCategory } from "../data";
import { IslamicAvatar } from "../components/Avatars";
import {
  Sparkles,
  Award,
  BookOpen,
  Users,
  GraduationCap,
  Shield,
  Headphones,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { FadeInUp, StaggerContainer, StaggerItem } from "../components/Animations";
import { Link } from "react-router-dom";

type FilterTab = "all" | TeacherCategory | "supervisors" | "tech_support";

export const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [techSupport, setTechSupport] = useState<TechSupportMember[]>([]);
  const [activeCategory, setActiveCategory] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [t, s, tech] = await Promise.all([
      getTeachers(),
      getSupervisors(),
      getTechSupport(),
    ]);
    setTeachers(t);
    setSupervisors(s);
    setTechSupport(tech);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([getTeachers(), getSupervisors(), getTechSupport()]).then(
      ([t, s, tech]) => {
        if (mounted) {
          setTeachers(t);
          setSupervisors(s);
          setTechSupport(tech);
          setLoading(false);
        }
      }
    );

    const handleUpdate = () => {
      fetchData();
    };

    window.addEventListener("maqraa_data_updated", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("maqraa_data_updated", handleUpdate);
    };
  }, [fetchData]);

  const menSheikhsCount = teachers.filter((t) => t.category === "men_sheikhs").length;
  const femaleTeachersCount = teachers.filter((t) => t.category === "female_teachers").length;
  const menTeamCount = teachers.filter((t) => t.category === "men_team").length;
  const womenTeamCount = teachers.filter((t) => t.category === "women_team").length;
  const totalStaffCount = teachers.length + supervisors.length + techSupport.length;

  const categories: {
    id: FilterTab;
    label: string;
    count: number;
    icon: React.ElementType;
  }[] = [
    { id: "all", label: "الكل", count: totalStaffCount, icon: Users },
    { id: "men_sheikhs", label: "المشايخ", count: menSheikhsCount, icon: GraduationCap },
    { id: "female_teachers", label: "الأستاذات", count: femaleTeachersCount, icon: BookOpen },
    { id: "men_team", label: "فريق العمل (رجال)", count: menTeamCount, icon: Users },
    { id: "women_team", label: "فريق العمل (نساء)", count: womenTeamCount, icon: Award },
    { id: "supervisors", label: "فريق الإشراف والمتابعة", count: supervisors.length, icon: Shield },
    { id: "tech_support", label: "فريق الدعم الفني", count: techSupport.length, icon: Headphones },
  ];

  const showTeachers =
    activeCategory === "all" ||
    activeCategory === "men_sheikhs" ||
    activeCategory === "women_sheikhs" ||
    activeCategory === "female_teachers" ||
    activeCategory === "men_team" ||
    activeCategory === "women_team";

  const showSupervisors = activeCategory === "all" || activeCategory === "supervisors";
  const showTechSupport = activeCategory === "all" || activeCategory === "tech_support";

  const filteredTeachers =
    activeCategory === "all"
      ? teachers
      : teachers.filter((t) => t.category === activeCategory);

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      {/* Header */}
      <FadeInUp className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold text-xs sm:text-sm mb-4 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>الهيئة التعليمية والإدارية المتكاملة</span>
        </div>
        <h1 className="font-amiri text-4xl sm:text-5xl lg:text-6xl font-bold text-emerald-950 dark:text-gold-100 mb-4">
          المشايخ والأساتذة وفريق العمل
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 mx-auto rounded-full mb-6" />
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-light leading-relaxed">
          نخبة متميزة من المشايخ الفضلاء، المقرئات المجازات بالسند المتصل، وفريق إشرافي وتقني ساهر على خدمة طلاب كتاب الله وإدارة الحلقات بأعلى معايير الجودة والإتقان.
        </p>
      </FadeInUp>

      {/* Filter Tabs */}
      <FadeInUp delay={0.1} className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-14">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm ${
                isActive
                  ? "bg-gradient-to-l from-emerald-800 to-emerald-700 dark:from-gold-500 dark:to-gold-400 text-white dark:text-emerald-950 shadow-md scale-105"
                  : "bg-white dark:bg-emerald-900/30 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/50 border border-stone-200/60 dark:border-gold-500/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isActive
                    ? "bg-white/20 dark:bg-emerald-950/20 text-white dark:text-emerald-950"
                    : "bg-stone-100 dark:bg-emerald-800/40 text-stone-600 dark:text-gold-300"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </FadeInUp>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-72 rounded-3xl bg-stone-200 dark:bg-emerald-900/20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* 1. Teachers Section */}
      {!loading && showTeachers && filteredTeachers.length > 0 && (
        <div className="mb-16">
          {activeCategory === "all" && (
            <div className="flex items-center gap-3 mb-8 border-s-4 border-gold-500 ps-4">
              <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-gold-400 shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200">
                  المشايخ والأساتذة المجازون
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  القراء المعتمدون والمجازون بالسند المتصل إلى رسول الله ﷺ
                </p>
              </div>
            </div>
          )}

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => (
              <StaggerItem
                key={teacher.id}
                className="bg-white dark:bg-emerald-900/25 rounded-3xl p-7 border border-stone-200/70 dark:border-gold-500/15 shadow-lg hover:shadow-2xl hover:border-gold-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between gap-6 group relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />

                <div className="flex flex-col gap-5">
                  {/* Header: Avatar & Titles */}
                  <div className="flex items-start gap-4">
                    <IslamicAvatar
                      gender={teacher.gender}
                      role={teacher.gender === "female" ? "teacher" : "sheikh"}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start bg-gold-500/15 text-gold-700 dark:text-gold-300">
                        {teacher.category === "men_sheikhs"
                          ? "المشايخ"
                          : teacher.category === "female_teachers"
                          ? "الأستاذات"
                          : teacher.category === "men_team"
                          ? "فريق العمل (رجال)"
                          : teacher.category === "women_team"
                          ? "فريق العمل (نساء)"
                          : "الهيئة التعليمية"}
                      </span>
                      <h3 className="font-amiri text-xl sm:text-2xl font-bold text-emerald-950 dark:text-gold-100 mt-1 leading-snug">
                        {teacher.name}
                      </h3>
                      <span className="text-xs text-stone-500 dark:text-stone-300 font-medium">
                        {teacher.title}
                      </span>
                    </div>
                  </div>

                  {/* Specialty */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-150 dark:border-emerald-800/20 text-xs">
                    <span className="text-emerald-900 dark:text-gold-400 font-bold block mb-1">
                      التخصص الدقيق:
                    </span>
                    <span className="text-stone-700 dark:text-stone-200 leading-relaxed">
                      {teacher.specialty}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                    {teacher.bio}
                  </p>
                </div>

                {/* Ijazah Footer if present */}
                {teacher.ijazah && (
                  <div className="pt-4 border-t border-stone-100 dark:border-emerald-800/30 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-gold-400 font-bold">
                    <Award className="w-4 h-4 text-gold-500 flex-shrink-0" />
                    <span className="truncate">{teacher.ijazah}</span>
                  </div>
                )}
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}

      {/* 2. Supervision Team Section */}
      {!loading && showSupervisors && supervisors.length > 0 && (
        <div className="mb-16">
          {activeCategory === "all" && (
            <div className="flex items-center gap-3 mb-8 border-s-4 border-gold-500 ps-4">
              <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-gold-400 shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200">
                  فريق الإشراف والمتابعة التعليمية
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  إدارة البرامج، تنظيم الحلقات، ولجان الاختبارات والقبول
                </p>
              </div>
            </div>
          )}

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supervisors.map((sup) => (
              <StaggerItem
                key={sup.id}
                className="bg-white dark:bg-emerald-900/25 rounded-3xl p-6 sm:p-7 border border-stone-200/70 dark:border-gold-500/15 shadow-lg hover:shadow-xl hover:border-gold-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <IslamicAvatar
                      gender={sup.gender}
                      role="supervisor"
                      size="md"
                      className="flex-shrink-0"
                    />
                    <div className="flex flex-col">
                      <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-gold-100">
                        {sup.name}
                      </h3>
                      <span className="text-xs text-gold-600 dark:text-gold-400 font-bold">
                        {sup.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 text-xs text-stone-700 dark:text-stone-300 border border-stone-150 dark:border-emerald-800/20 flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-gold-500 flex-shrink-0 mt-0.5" />
                    <span>{sup.responsibility}</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                    {sup.bio}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}

      {/* 3. Technical Support Team Section */}
      {!loading && showTechSupport && techSupport.length > 0 && (
        <div className="mb-16">
          {activeCategory === "all" && (
            <div className="flex items-center gap-3 mb-8 border-s-4 border-gold-500 ps-4">
              <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-gold-400 shadow-inner">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-gold-200">
                  فريق الدعم الفني والتقني
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  إدارة مجموعات WhatsApp وقنوات التواصل وتسهيل الحلقات
                </p>
              </div>
            </div>
          )}

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techSupport.map((tech) => (
              <StaggerItem
                key={tech.id}
                className="bg-white dark:bg-emerald-900/25 rounded-3xl p-6 sm:p-7 border border-stone-200/70 dark:border-gold-500/15 shadow-lg hover:shadow-xl hover:border-gold-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-gold-600 via-gold-400 to-gold-300" />
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <IslamicAvatar
                      gender={tech.gender}
                      role="tech"
                      size="md"
                      className="flex-shrink-0"
                    />
                    <div className="flex flex-col">
                      <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-gold-100">
                        {tech.name}
                      </h3>
                      <span className="text-xs text-gold-600 dark:text-gold-400 font-bold">
                        {tech.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-emerald-950/40 text-xs text-stone-700 dark:text-stone-300 border border-stone-150 dark:border-emerald-800/20 flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                    <span>{tech.duty}</span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                    {tech.bio}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}

      {/* Support CTA Banner */}
      <FadeInUp
        delay={0.2}
        className="p-8 sm:p-10 rounded-3xl bg-gradient-to-l from-emerald-950 via-emerald-900 to-stone-900 text-white border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-right"
      >
        <div className="flex flex-col gap-2">
          <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-gold-300">
            تواجه صعوبة تقنية أو لديك استفسار؟
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xl">
            فريق الدعم الفني متواجد لمساعدتك في الانضمام لمجموعات واتساب وتسهيل حضور الحلقات القرآنية.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm text-emerald-950 bg-gradient-to-l from-gold-500 via-gold-400 to-gold-300 hover:from-gold-400 hover:to-gold-200 shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>تواصل مع الدعم الفني</span>
        </Link>
      </FadeInUp>
    </div>
  );
};

export default Teachers;

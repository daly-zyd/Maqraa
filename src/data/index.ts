import { programsData } from './programs';
import type { Program } from './programs';
import { eventsData } from './events';
import type { Event } from './events';
import { tajweedRulesData, studiedSurahsData } from './quran';
import type { TajweedRule, StudiedSurah } from './quran';
import { articlesData, reflectionsData } from './tazkiya';
import type { Article, Reflection } from './tazkiya';
import { defaultSettings } from './settings';
import type { MaqraaSettings } from './settings';
import { defaultTeachers, defaultSupervisors, defaultTechSupport } from './team';
import type { Teacher, Supervisor, TechSupportMember, TeacherCategory } from './team';

export type {
  Program,
  Event,
  TajweedRule,
  StudiedSurah,
  Article,
  Reflection,
  MaqraaSettings,
  Teacher,
  Supervisor,
  TechSupportMember,
  TeacherCategory
};

// Storage Keys
const SETTINGS_KEY = 'maqraa_settings_v1';
const TEACHERS_KEY = 'maqraa_teachers_v1';
const SUPERVISORS_KEY = 'maqraa_supervisors_v1';
const TECH_SUPPORT_KEY = 'maqraa_tech_support_v1';
const PROGRAMS_KEY = 'maqraa_programs_v1';
const EVENTS_KEY = 'maqraa_events_v1';

// Helper to notify listeners of changes
const notifyDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('maqraa_data_updated'));
  }
};

// Safe LocalStorage Reader
const getStoredData = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
};

const setStoredData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyDataChanged();
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Simulated delay helper
const delay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => resolve(data));
};

/* ============================================================
   1. SETTINGS API
   ============================================================ */
export const getSettings = async (): Promise<MaqraaSettings> => {
  const settings = getStoredData<MaqraaSettings>(SETTINGS_KEY, defaultSettings);
  return delay(settings);
};

export const saveSettings = async (settings: MaqraaSettings): Promise<MaqraaSettings> => {
  setStoredData(SETTINGS_KEY, settings);
  return delay(settings);
};

/* ============================================================
   2. TEACHERS API
   ============================================================ */
export const getTeachers = async (category?: TeacherCategory): Promise<Teacher[]> => {
  const teachers = getStoredData<Teacher[]>(TEACHERS_KEY, defaultTeachers);
  if (!category) {
    return delay(teachers.sort((a, b) => a.order - b.order));
  }
  return delay(teachers.filter((t) => t.category === category).sort((a, b) => a.order - b.order));
};

export const getTeacherById = async (id: string): Promise<Teacher | undefined> => {
  const teachers = getStoredData<Teacher[]>(TEACHERS_KEY, defaultTeachers);
  return delay(teachers.find((t) => t.id === id));
};

export const saveTeacher = async (teacher: Teacher): Promise<Teacher> => {
  const teachers = getStoredData<Teacher[]>(TEACHERS_KEY, defaultTeachers);
  const index = teachers.findIndex((t) => t.id === teacher.id);
  if (index >= 0) {
    teachers[index] = teacher;
  } else {
    teachers.push(teacher);
  }
  setStoredData(TEACHERS_KEY, teachers);
  return delay(teacher);
};

export const deleteTeacher = async (id: string): Promise<boolean> => {
  const teachers = getStoredData<Teacher[]>(TEACHERS_KEY, defaultTeachers);
  const filtered = teachers.filter((t) => t.id !== id);
  setStoredData(TEACHERS_KEY, filtered);
  return delay(true);
};

/* ============================================================
   3. SUPERVISORS API
   ============================================================ */
export const getSupervisors = async (): Promise<Supervisor[]> => {
  const supervisors = getStoredData<Supervisor[]>(SUPERVISORS_KEY, defaultSupervisors);
  return delay(supervisors.sort((a, b) => a.order - b.order));
};

export const saveSupervisor = async (supervisor: Supervisor): Promise<Supervisor> => {
  const supervisors = getStoredData<Supervisor[]>(SUPERVISORS_KEY, defaultSupervisors);
  const index = supervisors.findIndex((s) => s.id === supervisor.id);
  if (index >= 0) {
    supervisors[index] = supervisor;
  } else {
    supervisors.push(supervisor);
  }
  setStoredData(SUPERVISORS_KEY, supervisors);
  return delay(supervisor);
};

export const deleteSupervisor = async (id: string): Promise<boolean> => {
  const supervisors = getStoredData<Supervisor[]>(SUPERVISORS_KEY, defaultSupervisors);
  const filtered = supervisors.filter((s) => s.id !== id);
  setStoredData(SUPERVISORS_KEY, filtered);
  return delay(true);
};

/* ============================================================
   4. TECH SUPPORT API
   ============================================================ */
export const getTechSupport = async (): Promise<TechSupportMember[]> => {
  const tech = getStoredData<TechSupportMember[]>(TECH_SUPPORT_KEY, defaultTechSupport);
  return delay(tech.sort((a, b) => a.order - b.order));
};

export const saveTechSupport = async (member: TechSupportMember): Promise<TechSupportMember> => {
  const tech = getStoredData<TechSupportMember[]>(TECH_SUPPORT_KEY, defaultTechSupport);
  const index = tech.findIndex((m) => m.id === member.id);
  if (index >= 0) {
    tech[index] = member;
  } else {
    tech.push(member);
  }
  setStoredData(TECH_SUPPORT_KEY, tech);
  return delay(member);
};

export const deleteTechSupport = async (id: string): Promise<boolean> => {
  const tech = getStoredData<TechSupportMember[]>(TECH_SUPPORT_KEY, defaultTechSupport);
  const filtered = tech.filter((m) => m.id !== id);
  setStoredData(TECH_SUPPORT_KEY, filtered);
  return delay(true);
};

/* ============================================================
   5. PROGRAMS API
   ============================================================ */
export const getPrograms = async (section?: 'rijel' | 'nissa'): Promise<Program[]> => {
  const programs = getStoredData<Program[]>(PROGRAMS_KEY, programsData);
  if (!section) {
    return delay(programs);
  }
  const filtered = programs.filter(
    (p) => p.section === 'both' || p.section === section
  );
  return delay(filtered);
};

export const getProgramBySlug = async (slug: string): Promise<Program | undefined> => {
  const programs = getStoredData<Program[]>(PROGRAMS_KEY, programsData);
  const program = programs.find((p) => p.slug === slug || p.id === slug);
  return delay(program);
};

export const saveProgram = async (program: Program): Promise<Program> => {
  const programs = getStoredData<Program[]>(PROGRAMS_KEY, programsData);
  const index = programs.findIndex((p) => p.id === program.id);
  if (index >= 0) {
    programs[index] = program;
  } else {
    programs.push(program);
  }
  setStoredData(PROGRAMS_KEY, programs);
  return delay(program);
};

export const deleteProgram = async (id: string): Promise<boolean> => {
  const programs = getStoredData<Program[]>(PROGRAMS_KEY, programsData);
  const filtered = programs.filter((p) => p.id !== id);
  setStoredData(PROGRAMS_KEY, filtered);
  return delay(true);
};

/* ============================================================
   6. EVENTS API
   ============================================================ */
export const getEvents = async (section?: 'rijel' | 'nissa'): Promise<Event[]> => {
  const events = getStoredData<Event[]>(EVENTS_KEY, eventsData);
  if (!section) {
    return delay(events);
  }
  const filtered = events.filter(
    (e) => e.section === 'both' || e.section === section
  );
  return delay(filtered);
};

export const getEventBySlug = async (slug: string): Promise<Event | undefined> => {
  const events = getStoredData<Event[]>(EVENTS_KEY, eventsData);
  const event = events.find((e) => e.slug === slug || e.id === slug);
  return delay(event);
};

export const saveEvent = async (event: Event): Promise<Event> => {
  const events = getStoredData<Event[]>(EVENTS_KEY, eventsData);
  const index = events.findIndex((e) => e.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.push(event);
  }
  setStoredData(EVENTS_KEY, events);
  return delay(event);
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const events = getStoredData<Event[]>(EVENTS_KEY, eventsData);
  const filtered = events.filter((e) => e.id !== id);
  setStoredData(EVENTS_KEY, filtered);
  return delay(true);
};

/* ============================================================
   7. QURANIC RESOURCES & TAZKIYA API
   ============================================================ */
export const getTajweedRules = async (): Promise<TajweedRule[]> => {
  return delay(tajweedRulesData);
};

export const getStudiedSurahs = async (): Promise<StudiedSurah[]> => {
  return delay(studiedSurahsData);
};

export const getArticles = async (): Promise<Article[]> => {
  return delay(articlesData);
};

export const getArticleBySlug = async (slug: string): Promise<Article | undefined> => {
  const article = articlesData.find((a) => a.slug === slug);
  return delay(article);
};

export const getReflections = async (): Promise<Reflection[]> => {
  return delay(reflectionsData);
};

/* ============================================================
   8. RESET TO DEFAULT
   ============================================================ */
export const resetToDefaults = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(TEACHERS_KEY);
    localStorage.removeItem(SUPERVISORS_KEY);
    localStorage.removeItem(TECH_SUPPORT_KEY);
    localStorage.removeItem(PROGRAMS_KEY);
    localStorage.removeItem(EVENTS_KEY);
    notifyDataChanged();
  }
};

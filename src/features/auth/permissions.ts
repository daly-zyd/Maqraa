import type { Me } from './types';

/** Capability catalog (mirrors backend apps/access/policy.py). */
export const CAP = {
  scheduleViewOwn: 'schedule.view_own',
  scheduleViewAll: 'schedule.view_all',
  scheduleEdit: 'schedule.edit',
  peopleView: 'people.view',
  peopleManage: 'people.manage',
  reportPublish: 'report.publish',
  statsView: 'stats.view',
  accessManage: 'access.manage',
  auditView: 'audit.view',
  settingsEdit: 'settings.edit'
} as const;

/** True when the user holds `capability` globally, or in the given maqraa, or (no maqraa given) in any maqraa. */
export function can(me: Me | null, capability: string, maqraaId?: number): boolean {
  if (!me) return false;
  if (me.global_capabilities.includes(capability)) return true;
  const scope = maqraaId === undefined ? me.maqraat : me.maqraat.filter((m) => m.id === maqraaId);
  return scope.some((m) => m.capabilities.includes(capability));
}

export interface DashboardLink {
  to: string;
  label: string;
  description: string;
  /** Shown only when the user holds this capability. */
  capability: string;
}

export const DASHBOARD_LINKS: DashboardLink[] = [
  { to: '/dashboard/schedule', label: 'جدول الحلقات', description: 'حلقاتك وأوقاتها بتوقيت تونس ومكة', capability: CAP.scheduleViewOwn },
  { to: '/dashboard/people', label: 'المشايخ والمشرفون', description: 'أعضاء الفريق وأدوارهم', capability: CAP.peopleView },
  { to: '/dashboard/reports', label: 'التقارير', description: 'نشر تقارير الحلقات', capability: CAP.reportPublish },
  { to: '/dashboard/access', label: 'الصلاحيات', description: 'منح الأدوار وسحبها', capability: CAP.accessManage },
  { to: '/dashboard/audit', label: 'سجل العمليات', description: 'من فعل ماذا ومتى', capability: CAP.auditView }
];

export const visibleLinks = (me: Me | null): DashboardLink[] =>
  DASHBOARD_LINKS.filter((l) => can(me, l.capability));

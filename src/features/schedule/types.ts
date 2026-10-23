/** Contract of backend/apps/scheduling (services._slot_dict, _session_dict, _day_payload). */

export interface PersonRef {
  id: number;
  name: string | null;
}

export type SessionStatus =
  | 'scheduled'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'declined'
  | 'substitution_open'
  | 'room_open'
  | 'closed_out'
  | 'reported'
  | 'missed'
  | 'cancelled';

/** One dated session. Times are given in UTC and pre-formatted (HH:MM) for Tunis and Mecca. */
export interface ScheduleSession {
  id: number;
  status: SessionStatus;
  /** Ended but not closed out / reported yet. */
  awaiting_report: boolean;
  start_utc: string;
  end_utc: string;
  start_tunis: string;
  end_tunis: string;
  start_mecca: string;
  end_mecca: string;
  sheikh: PersonRef | null;
  supervisor: PersonRef | null;
}

/** GET /maqraat/{id}/today/ */
export interface DayBoard {
  maqraa: { id: number; name_ar: string };
  date: string;
  date_ar: string;
  date_hijri_ar: string;
  sessions: ScheduleSession[];
}

/** One recurring slot of the weekly template. weekday: Monday = 0 … Sunday = 6; times in Tunis time. */
export interface TemplateSlot {
  id: number;
  weekday: number;
  weekday_ar: string;
  start: string;
  end: string;
  sheikh: PersonRef | null;
  supervisor: PersonRef | null;
  notes: string;
}

/** Body of POST /maqraat/{id}/slots/ (PATCH takes any subset). An end <= start crosses midnight. */
export interface SlotInput {
  weekday: number;
  start: string;
  end: string;
  sheikh_id?: number | null;
  supervisor_id?: number | null;
  notes?: string;
}

export interface RegenerateResult {
  removed: number;
  created: number;
}

import { apiClient } from '../lib/apiClient';
import type { DayBoard, RegenerateResult, ScheduleSession, SlotInput, TemplateSlot } from '../features/schedule/types';

/** The only module that knows the scheduling endpoints. Components call these, never axios. */
const base = (maqraaId: number) => `/maqraat/${maqraaId}`;

export const scheduleService = {
  /** Sessions between two local dates, inclusive (at most 62 days). Sheikhs only receive their own. */
  async sessions(maqraaId: number, from: string, to: string): Promise<ScheduleSession[]> {
    const { data } = await apiClient.get<ScheduleSession[]>(`${base(maqraaId)}/sessions/`, { params: { from, to } });
    return data;
  },

  /** Day board with Arabic and Hijri dates. `date` defaults to today in the maqraa's timezone. */
  async day(maqraaId: number, date?: string): Promise<DayBoard> {
    const { data } = await apiClient.get<DayBoard>(`${base(maqraaId)}/today/`, { params: date ? { date } : undefined });
    return data;
  },

  async slots(maqraaId: number): Promise<TemplateSlot[]> {
    const { data } = await apiClient.get<TemplateSlot[]>(`${base(maqraaId)}/slots/`);
    return data;
  },

  /** Rejects with 409 (Arabic `detail`) when the slot overlaps another one or a person is busy. */
  async createSlot(maqraaId: number, input: SlotInput): Promise<TemplateSlot> {
    const { data } = await apiClient.post<TemplateSlot>(`${base(maqraaId)}/slots/`, input);
    return data;
  },

  async updateSlot(maqraaId: number, slotId: number, changes: Partial<SlotInput>): Promise<TemplateSlot> {
    const { data } = await apiClient.patch<TemplateSlot>(`${base(maqraaId)}/slots/${slotId}/`, changes);
    return data;
  },

  async deleteSlot(maqraaId: number, slotId: number): Promise<void> {
    await apiClient.delete(`${base(maqraaId)}/slots/${slotId}/`);
  },

  /** Rebuilds future untouched sessions from the template. */
  async regenerate(maqraaId: number): Promise<RegenerateResult> {
    const { data } = await apiClient.post<RegenerateResult>(`${base(maqraaId)}/generate-sessions/`);
    return data;
  }
};

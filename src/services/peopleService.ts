import { apiClient } from '../lib/apiClient';
import type { Person } from '../features/people/types';

/** The only module that knows the people endpoints. Components call these, never axios. */
export const peopleService = {
  /** Team of one maqraa (requires `people.view`), sorted by name. */
  async list(maqraaId: number): Promise<Person[]> {
    const { data } = await apiClient.get<Person[]>('/people/', { params: { maqraa: maqraaId } });
    return data;
  }
};

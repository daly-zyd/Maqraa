export type MaqraaRole = 'sheikh' | 'supervisor' | 'admin';

/** One entry of GET /people/?maqraa={id} (backend apps/people/services.list_people). */
export interface Person {
  id: number;
  full_name: string;
  /** Roles held in the requested maqraa. */
  roles: MaqraaRole[];
  display_name_formal: string;
  /** Only sent to callers holding `people.view_phone`. */
  phone: string | null;
}

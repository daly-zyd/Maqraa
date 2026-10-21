export interface MaqraaAccess {
  id: number;
  slug: string;
  name_ar: string;
  riwaya: string;
  gender: string;
  roles: string[];
  capabilities: string[];
}

/** Response of GET /me/: identity plus what the user may do. Menus and routes read `capabilities`, never role names. */
export interface Me {
  id: number;
  username: string;
  full_name: string;
  person_id: number | null;
  is_super_admin: boolean;
  maqraat: MaqraaAccess[];
  global_capabilities: string[];
}

export interface TokenPair {
  access: string;
  refresh: string;
}

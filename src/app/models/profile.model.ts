export type Role = 'super' | 'admin' | 'guest';

export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  role: Role;
}

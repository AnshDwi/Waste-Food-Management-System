export type AuthRole = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  isVerified: boolean;
  createdAt: string;
  permissions: string[];
};

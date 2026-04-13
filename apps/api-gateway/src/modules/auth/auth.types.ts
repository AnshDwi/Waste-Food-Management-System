export type UserRole = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  refreshTokens: Array<{
    id: string;
    expiresAt: string;
    createdAt: string;
    rememberMe: boolean;
  }>;
};

export const rolePermissions: Record<UserRole, string[]> = {
  DONOR: ['donation:create', 'donation:read', 'finance:read'],
  NGO: ['donation:read', 'match:read', 'delivery:read'],
  VOLUNTEER: ['delivery:read', 'delivery:update'],
  ADMIN: ['admin:read', 'admin:write', 'audit:read', 'user:read', 'user:write', 'delivery:update']
};

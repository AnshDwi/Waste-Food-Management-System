import { AuthUser, UserRole } from './auth.types.js';

export type UserModel = AuthUser & {
  role: UserRole;
};

export const userModelFields = [
  'name',
  'email',
  'passwordHash',
  'role',
  'isVerified',
  'createdAt'
] as const;

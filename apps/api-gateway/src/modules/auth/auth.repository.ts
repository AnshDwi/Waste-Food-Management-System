import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { AuthUser, UserRole } from './auth.types.js';

type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

const users = new Map<string, AuthUser>();

const seedAdminId = randomUUID();
users.set(seedAdminId, {
  id: seedAdminId,
  name: 'Platform Admin',
  email: 'admin@wastefood.local',
  passwordHash: bcrypt.hashSync('password123!', 12),
  role: 'ADMIN',
  isVerified: true,
  createdAt: new Date().toISOString(),
  refreshTokens: []
});

const seedVolunteerId = randomUUID();
users.set(seedVolunteerId, {
  id: seedVolunteerId,
  name: 'Ayesha Khan',
  email: 'driver@wastefood.local',
  passwordHash: bcrypt.hashSync('password123!', 12),
  role: 'VOLUNTEER',
  isVerified: true,
  createdAt: new Date().toISOString(),
  refreshTokens: []
});

export const authRepository = {
  async findByEmail(email: string) {
    return [...users.values()].find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  },
  async findById(id: string) {
    return users.get(id) ?? null;
  },
  async create(input: CreateUserInput) {
    const user: AuthUser = {
      id: randomUUID(),
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      isVerified: input.role === 'DONOR',
      createdAt: new Date().toISOString(),
      refreshTokens: []
    };
    users.set(user.id, user);
    return user;
  },
  async saveRefreshToken(userId: string, token: { id: string; expiresAt: string; rememberMe: boolean }) {
    const user = users.get(userId);
    if (!user) {
      return null;
    }

    user.refreshTokens = [
      ...user.refreshTokens.filter((item) => new Date(item.expiresAt).getTime() > Date.now()),
      {
        id: token.id,
        expiresAt: token.expiresAt,
        createdAt: new Date().toISOString(),
        rememberMe: token.rememberMe
      }
    ];
    users.set(userId, user);
    return user;
  },
  async hasRefreshToken(userId: string, tokenId: string) {
    const user = users.get(userId);
    return Boolean(user?.refreshTokens.some((token) => token.id === tokenId && new Date(token.expiresAt).getTime() > Date.now()));
  },
  async revokeRefreshToken(userId: string, tokenId: string) {
    const user = users.get(userId);
    if (!user) {
      return;
    }

    user.refreshTokens = user.refreshTokens.filter((token) => token.id !== tokenId);
    users.set(userId, user);
  },
  async revokeAllRefreshTokens(userId: string) {
    const user = users.get(userId);
    if (!user) {
      return;
    }

    user.refreshTokens = [];
    users.set(userId, user);
  }
};

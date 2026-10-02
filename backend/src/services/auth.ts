import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IsNull } from 'typeorm';
import { config } from '../config';
import { AppDataSource } from '../db/data-source';
import { RefreshToken } from '../db/entities/RefreshToken';
import { User } from '../db/entities/User';
import { HttpError } from '../errors';
import type { Role } from '../types/express';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

const toPublic = (u: User): PublicUser => ({ id: u.id, name: u.name, email: u.email, role: u.role });
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export const signAccessToken = (u: { id: number; role: Role }) =>
  jwt.sign({ role: u.role }, config.jwtSecret, {
    subject: String(u.id),
    expiresIn: config.accessTtlMin * 60, // seconds
    algorithm: 'HS256',
  });

export const verifyAccessToken = (token: string) => {
  const p = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
  return { id: Number(p.sub), role: p.role as Role };
};

async function issueRefreshToken(userId: number): Promise<string> {
  const raw = crypto.randomBytes(48).toString('base64url');
  await AppDataSource.getRepository(RefreshToken).insert({
    user_id: userId,
    token_hash: sha256(raw), // only the hash is stored
    expires_at: new Date(Date.now() + config.refreshTtlDays * 86_400_000),
  });
  return raw;
}

export async function login(email: string, password: string) {
  const user = await AppDataSource.getRepository(User).findOneBy({ email });
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, 'Invalid email or password');
  return {
    user: toPublic(user),
    accessToken: signAccessToken(user),
    refreshToken: await issueRefreshToken(user.id),
  };
}

export async function rotateRefreshToken(raw: string) {
  const hash = sha256(raw);

  // Atomic: of two concurrent requests with the same token, only one UPDATE matches.
  const result = await AppDataSource.createQueryBuilder()
    .update(RefreshToken)
    .set({ revoked_at: () => 'now()' })
    .where('token_hash = :hash', { hash })
    .andWhere('revoked_at IS NULL')
    .andWhere('expires_at > now()')
    .returning(['user_id'])
    .execute();
  const row = (result.raw as { user_id: number }[])[0];

  if (!row) {
    // Reuse detection: a token that exists but was already revoked is being replayed.
    // Treat as possible theft and revoke all of that user's active refresh tokens.
    const repository = AppDataSource.getRepository(RefreshToken);
    const old = await repository.findOneBy({ token_hash: hash });
    if (old?.revoked_at) {
      await repository.update(
        { user_id: old.user_id, revoked_at: IsNull() },
        { revoked_at: new Date() },
      );
    }
    throw new HttpError(401, 'Invalid refresh token');
  }

  const user = await AppDataSource.getRepository(User).findOneBy({ id: row.user_id });
  if (!user) throw new HttpError(401, 'Invalid refresh token');
  return {
    user: toPublic(user),
    accessToken: signAccessToken(user),
    refreshToken: await issueRefreshToken(user.id),
  };
}

export async function revokeRefreshToken(raw: string) {
  await AppDataSource.getRepository(RefreshToken).update(
    { token_hash: sha256(raw), revoked_at: IsNull() },
    { revoked_at: new Date() },
  );
}

export async function getUserById(id: number) {
  const user = await AppDataSource.getRepository(User).findOneBy({ id });
  return user ? toPublic(user) : null;
}

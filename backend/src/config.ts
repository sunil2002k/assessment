const required = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var ${key}`);
  return v;
};
const num = (key: string, fallback: number): number => {
  const n = Number(process.env[key] ?? fallback);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid number for ${key}`);
  return n;
};

export const config = {
  port: num('PORT', 3000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  accessTtlMin: num('ACCESS_TOKEN_TTL_MINUTES', 15),
  refreshTtlDays: num('REFRESH_TOKEN_TTL_DAYS', 7),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
};

export type Role = 'admin' | 'member';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: Role };
    }
  }
}

import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

// One JSON shape for every error: { error, details? }. Never leaks stack traces.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message });
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return void res.status(422).json({ error: 'Validation failed', details });
  }
  if (err?.type === 'entity.parse.failed') return void res.status(400).json({ error: 'Invalid JSON body' });
  console.error('Unhandled error:', err?.message);
  res.status(500).json({ error: 'Internal server error' });
};

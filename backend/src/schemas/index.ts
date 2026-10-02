import { z } from 'zod';

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost'] as const;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email').max(255),
  password: z.string().min(1, 'Password is required').max(200),
});

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email').max(255),
  company: z.string().trim().min(1, 'Company is required').max(100),
  website: z
    .string()
    .trim()
    .max(255)
    .url('Invalid URL')
    .refine((v) => /^https?:\/\//i.test(v), 'URL must start with http(s)://')
    .or(z.literal(''))
    .optional()
    .transform((v) => v || null),
  status: z.enum(LEAD_STATUSES).default('new'),
});

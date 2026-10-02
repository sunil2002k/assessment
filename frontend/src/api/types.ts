export type Role = 'admin' | 'member';
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}
export interface AdminUser extends User {
  created_at: string;
}
export interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  website: string | null;
  status: LeadStatus;
  owner_id: number;
  owner_name?: string; // present for admin only
  created_at: string;
}
export interface NewLead {
  name: string;
  email: string;
  company: string;
  website?: string;
  status: LeadStatus;
}

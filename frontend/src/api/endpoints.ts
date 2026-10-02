import { api } from './client';
import type { AdminUser, Lead, NewLead, User } from './types';

export const authApi = {
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }).then((r) => r.data.user),
  logout: () => api.post('/auth/logout'),
};

export const leadsApi = {
  list: () => api.get<{ leads: Lead[] }>('/leads').then((r) => r.data.leads),
  create: (input: NewLead) => api.post<{ lead: Lead }>('/leads', input).then((r) => r.data.lead),
};

export const adminApi = {
  users: () => api.get<{ users: AdminUser[] }>('/admin/users').then((r) => r.data.users),
};

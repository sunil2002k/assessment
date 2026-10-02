import { isAxiosError } from 'axios';

export function errorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (!err.response) return 'Cannot reach the server. Please try again.';
    if (err.response.data?.error) return err.response.data.error;
  }
  return 'Something went wrong.';
}

// Maps the backend's 422 { details: [{field, message}] } onto form fields.
export function fieldErrors(err: unknown): Record<string, string> {
  if (isAxiosError(err) && err.response?.status === 422 && Array.isArray(err.response.data?.details)) {
    return Object.fromEntries(err.response.data.details.map((d: { field: string; message: string }) => [d.field, d.message]));
  }
  return {};
}

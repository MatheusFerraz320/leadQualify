import { randomBytes } from 'node:crypto';

export function generateWebhookToken(): string {
  return randomBytes(24).toString('hex');
}

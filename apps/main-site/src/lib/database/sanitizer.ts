export const SENSITIVE_FIELDS = [
  'password',
  'reset_password_token',
  'sessionToken',
  'refreshTokenHash',
  'gatewaySecret',
  'webhookSecret',
  'secretKey',
  'documentFront',
  'documentBack',
  'selfieImage',
  'rawVerificationMeta',
  'identityNumberMasked',
  'apiKey',
  'gatewayConfig',
  'reset_password_expires',
];

export function sanitizeDatabaseRecord(record: unknown): unknown {
  if (!record || typeof record !== 'object') return record;
  
  if (Array.isArray(record)) {
    return record.map(item => sanitizeDatabaseRecord(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      sanitized[key] = '*** REDACTED ***';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeDatabaseRecord(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

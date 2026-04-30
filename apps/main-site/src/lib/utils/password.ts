/**
 * Password validation utility
 */

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const errors: string[] = [];
  if (!requirements.length) errors.push("Minimum 8 characters");
  if (!requirements.uppercase) errors.push("At least one uppercase letter");
  if (!requirements.lowercase) errors.push("At least one lowercase letter");
  if (!requirements.number) errors.push("At least one number");
  if (!requirements.special) errors.push("At least one special character (@$!%*?&)");

  const metCount = Object.values(requirements).filter(Boolean).length;
  let strength: PasswordValidationResult['strength'] = 'weak';
  
  if (metCount === 5) strength = 'strong';
  else if (metCount >= 4) strength = 'good';
  else if (metCount >= 2) strength = 'fair';

  return {
    isValid: metCount === 5,
    errors,
    strength,
    requirements,
  };
}

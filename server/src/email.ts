const EMAIL_REGEX = /^[^@]+@[^@]+\.com$/i

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  return trimmed.length > 0 && EMAIL_REGEX.test(trimmed)
}

export const EMAIL_VALIDATION_MESSAGE =
  'Please enter a valid email address (format: xxxx@xxx.com)'

/**
 * Validates that the email is in the format xxxx@xxx.com only.
 * - Local part (before @): one or more characters
 * - Domain (after @, before .com): one or more characters
 * - TLD must be exactly .com
 */
const EMAIL_REGEX = /^[^@]+@[^@]+\.com$/i

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  return trimmed.length > 0 && EMAIL_REGEX.test(trimmed)
}

export const EMAIL_VALIDATION_MESSAGE = 'Please enter a valid email address (format: xxxx@xxx.com)'

export function isValidEduEmail(email: string): boolean {
  const eduPattern = /^[^\s@]+@[^\s@]+\.edu$/i;
  return eduPattern.test(email);
}

export function extractDomain(email: string): string {
  const parts = email.split('@');
  return parts[1]?.toLowerCase() || '';
}
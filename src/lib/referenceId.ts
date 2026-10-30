// Cryptographically secure, unambiguous reference ID generator
// Uses an unambiguous alphabet (excluding 0, O, 1, I, L) with at least 10 random characters
const UNAMBIGUOUS_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReferenceId(prefix: 'APP' | 'LEAD' = 'APP'): string {
  const randomBytes = new Uint8Array(10);
  crypto.getRandomValues(randomBytes);
  let token = '';
  for (let i = 0; i < 10; i++) {
    token += UNAMBIGUOUS_CHARS[randomBytes[i] % UNAMBIGUOUS_CHARS.length];
  }
  return `${prefix}-${token}`;
}

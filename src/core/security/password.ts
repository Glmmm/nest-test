import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const SCHEME = 'scrypt';

/** Hashes a password using scrypt (no native build dependencies). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `${SCHEME}$${salt}$${derived.toString('hex')}`;
}

/** Constant-time comparison of a password against a stored scrypt hash. */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [scheme, salt, hash] = storedHash.split('$');
  if (scheme !== SCHEME || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  if (expected.length !== KEY_LENGTH) return false;

  const derived = await scrypt(password, salt, KEY_LENGTH);
  return timingSafeEqual(expected, derived);
}

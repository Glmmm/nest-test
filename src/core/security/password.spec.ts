import { hashPassword, verifyPassword } from './password';

describe('password helpers', () => {
  it('hashes a password without keeping the plain text', async () => {
    const hash = await hashPassword('super-secret-1');

    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(hash).not.toContain('super-secret-1');
  });

  it('generates a different salt for every hash', async () => {
    const first = await hashPassword('same-password');
    const second = await hashPassword('same-password');

    expect(first).not.toBe(second);
  });

  it('verifies the right password and rejects the wrong one', async () => {
    const hash = await hashPassword('super-secret-1');

    await expect(verifyPassword('super-secret-1', hash)).resolves.toBe(true);
    await expect(verifyPassword('super-secret-2', hash)).resolves.toBe(false);
  });

  it('rejects malformed hashes', async () => {
    await expect(verifyPassword('any', 'not-a-hash')).resolves.toBe(false);
    await expect(verifyPassword('any', 'bcrypt$salt$hash')).resolves.toBe(false);
  });
});

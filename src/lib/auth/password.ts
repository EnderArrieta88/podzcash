import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

function scrypt(password: string, salt: Buffer, length: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, length, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

/**
 * Formato: scrypt:<salt base64url>:<key base64url>
 * scrypt es parte de Node, así que no hay dependencias nativas que compilar.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH);
  return `scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltPart, keyPart] = stored.split(":");

  if (scheme !== "scrypt" || !saltPart || !keyPart) return false;

  const salt = Buffer.from(saltPart, "base64url");
  const expected = Buffer.from(keyPart, "base64url");
  const actual = await scrypt(password.normalize("NFKC"), salt, expected.length);

  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}

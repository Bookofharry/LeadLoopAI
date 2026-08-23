import crypto from 'crypto';

// We derive a deterministic 32-byte key from the service role key or a custom ENCRYPTION_KEY.
// This ensures that the tokens can be decrypted across restarts, but are safe at rest in the DB.
const getEncryptionKey = () => {
  const secret = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'leadloop_fallback_secret_do_not_use_in_prod';
  return crypto.createHash('sha256').update(secret).digest();
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypts a string (e.g. JSON stringified OAuth tokens)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getEncryptionKey(); // In a real system, you might derive key using scrypt(key, salt)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Format: iv:salt:tag:encrypted
  return `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string (e.g. JSON stringified OAuth tokens)
 */
export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const salt = Buffer.from(parts[1], 'hex'); // unused for now, reserved for key derivation
  const tag = Buffer.from(parts[2], 'hex');
  const encryptedText = parts[3];
  
  const key = getEncryptionKey();
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

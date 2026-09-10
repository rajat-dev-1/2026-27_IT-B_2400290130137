import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// Parse the encryption key on startup to fail fast if invalid
let encryptionKey;
try {
  // Support both hex and base64 encoded keys for flexibility
  encryptionKey = Buffer.from(env.TOKEN_ENCRYPTION_KEY, 'hex');
  if (encryptionKey.length !== 32) {
    encryptionKey = Buffer.from(env.TOKEN_ENCRYPTION_KEY, 'base64');
  }
  if (encryptionKey.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must resolve to exactly 32 bytes.');
  }
} catch (error) {
  logger.error({ err: error }, 'Failed to initialize encryption key');
  process.exit(1);
}

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const IV_LENGTH = 12; // GCM recommended IV length

/**
 * Encrypts a plaintext secret using AES-256-GCM.
 * @param {string} plainText 
 * @returns {string} The encrypted value in format v1:<iv_base64>:<auth_tag_base64>:<ciphertext_base64>
 */
export function encryptSecret(plainText) {
  if (!plainText) return null;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag().toString('base64');
    
    return `${VERSION}:${iv.toString('base64')}:${authTag}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption failed');
    throw new Error('Internal encryption error');
  }
}

/**
 * Decrypts a previously encrypted secret.
 * @param {string} encryptedValue 
 * @returns {string} The plaintext secret
 */
export function decryptSecret(encryptedValue) {
  if (!encryptedValue) return null;

  try {
    const parts = encryptedValue.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted value format');
    }

    const [version, ivBase64, authTagBase64, cipherTextBase64] = parts;
    
    if (version !== VERSION) {
      throw new Error(`Unsupported encryption version: ${version}`);
    }

    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(cipherTextBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed');
    throw new Error('Internal decryption error');
  }
}

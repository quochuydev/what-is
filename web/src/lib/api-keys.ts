import { createHash, randomBytes } from "crypto";

const API_KEY_PREFIX = "wi_live_";

/**
 * Generate a new API key with prefix
 * Returns both the full key (to show once to user) and the hash (to store)
 */
export function generateApiKey(): {
  fullKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  // Generate 32 random bytes = 64 hex characters
  const randomPart = randomBytes(32).toString("hex");
  const fullKey = `${API_KEY_PREFIX}${randomPart}`;

  // Create visible prefix (first 12 chars after wi_live_)
  const keyPrefix = `${API_KEY_PREFIX}${randomPart.substring(0, 8)}...`;

  // Hash the full key for storage
  const keyHash = hashApiKey(fullKey);

  return { fullKey, keyPrefix, keyHash };
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith(API_KEY_PREFIX) && key.length === API_KEY_PREFIX.length + 64;
}

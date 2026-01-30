import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { config } from "./config";

function getSecret(): Uint8Array {
  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(config.jwt.secret);
}

export interface PlaygroundTokenPayload extends JWTPayload {
  userId: string;
  apiKeyId: string;
  type: "playground_session";
}

/**
 * Generate a JWT token for playground access
 */
export async function generatePlaygroundToken(
  userId: string,
  apiKeyId: string
): Promise<string> {
  const token = await new SignJWT({
    userId,
    apiKeyId,
    type: "playground_session",
  } satisfies PlaygroundTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${config.jwt.expirySeconds}s`)
    .sign(getSecret());

  return token;
}

/**
 * Verify and decode a playground JWT token
 */
export async function verifyPlaygroundToken(
  token: string
): Promise<PlaygroundTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());

    // Validate payload structure
    if (
      payload.type !== "playground_session" ||
      typeof payload.userId !== "string" ||
      typeof payload.apiKeyId !== "string"
    ) {
      return null;
    }

    return payload as PlaygroundTokenPayload;
  } catch {
    return null;
  }
}

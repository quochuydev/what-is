// Centralized application configuration
// All environment variables should be accessed through this file

export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expirySeconds: parseInt(process.env.JWT_EXPIRY_SECONDS || "86400", 10),
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },

  // App
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
} as const;

// Validation helper - call this at startup to fail fast
export function validateConfig() {
  const required = [
    ["DATABASE_URL", config.database.url],
    ["JWT_SECRET", config.jwt.secret],
    ["STRIPE_SECRET_KEY", config.stripe.secretKey],
    ["STRIPE_WEBHOOK_SECRET", config.stripe.webhookSecret],
  ] as const;

  const missing = required.filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

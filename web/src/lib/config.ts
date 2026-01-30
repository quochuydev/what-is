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

  // PayPal
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID!,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    mode: (process.env.PAYPAL_MODE || "sandbox") as "sandbox" | "live",
    webhookId: process.env.PAYPAL_WEBHOOK_ID,
  },

  // LLM (OpenAI-compatible API)
  llm: {
    apiKey: process.env.LLM_API_KEY!,
    baseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com/v1",
    model: process.env.LLM_MODEL || "deepseek-chat",
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
    ["PAYPAL_CLIENT_ID", config.paypal.clientId],
    ["PAYPAL_CLIENT_SECRET", config.paypal.clientSecret],
    ["LLM_API_KEY", config.llm.apiKey],
  ] as const;

  const missing = required.filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

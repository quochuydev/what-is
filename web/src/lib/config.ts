export const config = {
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
    signInUrl: "/login",
    afterSignInUrl: "/c/cloud/api-keys",
    afterSignUpUrl: "/c/cloud/api-keys",
  },

  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expirySeconds: 86400,
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    mode: (process.env.PAYPAL_MODE || "live") as "sandbox" | "live",
    webhookId: process.env.PAYPAL_WEBHOOK_ID,
  },

  llm: {
    apiKey: process.env.LLM_API_KEY || "",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },

  app: {
    url: "https://what-is.cappuai.com",
  },

  site: {
    name: "what-is",
    tagline: "AI-Powered Definition Lookup",
    description: "Get instant, AI-powered definitions for any keyword. Simple, fast, and accurate.",
    url: "https://what-is.cappuai.com",
    github: "https://github.com/quochuydev/what-is",
    email: "quochuy.dev@gmail.com",
    analyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },
} as const;

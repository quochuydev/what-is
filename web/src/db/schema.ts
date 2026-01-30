import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  date,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const auditActionEnum = pgEnum("audit_action", [
  "created",
  "deleted",
  "used",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "purchase",
  "usage",
  "refund",
  "admin_adjustment",
]);

// Users table (synced from Clerk)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// API Keys table
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    keyPrefix: varchar("key_prefix", { length: 20 }).notNull(), // e.g., "vp_live_abc"
    keyHash: varchar("key_hash", { length: 64 }).notNull(), // SHA-256 hash
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"), // Soft delete for GDPR compliance
  },
  (table) => [
    index("api_keys_user_id_idx").on(table.userId),
    index("api_keys_key_hash_idx").on(table.keyHash),
  ]
);

// API Key Audit Logs table
export const apiKeyAuditLogs = pgTable(
  "api_key_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiKeyId: uuid("api_key_id")
      .notNull()
      .references(() => apiKeys.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: auditActionEnum("action").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }), // IPv6 max length
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_api_key_id_idx").on(table.apiKeyId),
    index("audit_logs_user_id_idx").on(table.userId),
  ]
);

// Usage Daily table
export const usageDaily = pgTable(
  "usage_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    apiKeyId: uuid("api_key_id")
      .notNull()
      .references(() => apiKeys.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    requestCount: integer("request_count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("usage_daily_unique_idx").on(
      table.userId,
      table.apiKeyId,
      table.date
    ),
    index("usage_daily_user_id_idx").on(table.userId),
    index("usage_daily_date_idx").on(table.date),
  ]
);

// Credit Transactions table
export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // Positive = add, negative = deduct
    type: transactionTypeEnum("type").notNull(),
    paymentId: varchar("payment_id", { length: 255 }),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("credit_tx_user_id_idx").on(table.userId),
    index("credit_tx_payment_id_idx").on(table.paymentId),
  ]
);

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type ApiKeyAuditLog = typeof apiKeyAuditLogs.$inferSelect;
export type NewApiKeyAuditLog = typeof apiKeyAuditLogs.$inferInsert;

export type UsageDaily = typeof usageDaily.$inferSelect;
export type NewUsageDaily = typeof usageDaily.$inferInsert;

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;

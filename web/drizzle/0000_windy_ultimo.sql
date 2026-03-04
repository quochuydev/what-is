CREATE TYPE "public"."audit_action" AS ENUM('created', 'deleted', 'used');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('purchase', 'usage', 'refund', 'admin_adjustment');--> statement-breakpoint
CREATE TABLE "api_key_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"key_hash" varchar(64) NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"payment_id" varchar(255),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"api_key_id" uuid NOT NULL,
	"date" date NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "api_key_audit_logs" ADD CONSTRAINT "api_key_audit_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_audit_logs" ADD CONSTRAINT "api_key_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_daily" ADD CONSTRAINT "usage_daily_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_daily" ADD CONSTRAINT "usage_daily_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_api_key_id_idx" ON "api_key_audit_logs" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "api_key_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "credit_tx_user_id_idx" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_tx_payment_id_idx" ON "credit_transactions" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_daily_unique_idx" ON "usage_daily" USING btree ("user_id","api_key_id","date");--> statement-breakpoint
CREATE INDEX "usage_daily_user_id_idx" ON "usage_daily" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_daily_date_idx" ON "usage_daily" USING btree ("date");
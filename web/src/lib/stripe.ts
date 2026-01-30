import Stripe from "stripe";
import { config } from "./config";

if (!config.stripe.secretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(config.stripe.secretKey);

// Credit packages available for purchase
export const CREDIT_PACKAGES = [
  { id: "credits_1", credits: 1, price: 1, currency: "usd" },
  { id: "credits_6", credits: 6, price: 5, currency: "usd" },
  { id: "credits_30", credits: 30, price: 20, currency: "usd" },
] as const;

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id);
}

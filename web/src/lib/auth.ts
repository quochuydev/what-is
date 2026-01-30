import { auth, currentUser } from "@clerk/nextjs/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

/**
 * Get or create user in our database from Clerk session
 * Returns the database user record
 */
export async function getOrCreateUser() {
  console.log("[Auth] getOrCreateUser called");
  const { userId } = await auth();

  if (!userId) {
    console.log("[Auth] No Clerk userId found");
    return null;
  }
  console.log("[Auth] Clerk userId:", userId);

  // Check if user exists in our database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (existingUser) {
    console.log("[Auth] Found existing user:", existingUser.id);
    return existingUser;
  }

  // Get user details from Clerk
  console.log("[Auth] User not found, creating new user...");
  const clerkUser = await currentUser();
  if (!clerkUser) {
    console.log("[Auth] Could not get Clerk user details");
    return null;
  }

  // Create user in our database
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      credits: 3, // Give new users 3 free credits
    })
    .returning();

  console.log("[Auth] Created new user:", newUser.id, "with 3 free credits");
  return newUser;
}

/**
 * Get the current authenticated user or throw
 */
export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

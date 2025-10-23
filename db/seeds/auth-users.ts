/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as Db } from "../schema";

/**
 * Hashes a password using a simple method for testing purposes.
 * In production, you should use a proper password hashing library like bcrypt.
 */
async function hashPassword(password: string): Promise<string> {
  // Simple hash for testing - NOT SECURE FOR PRODUCTION
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_for_testing");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Seeds the database with test user accounts for Better Auth authentication.
 * Creates users with email and password authentication.
 */
export async function seedAuthUsers(db: PostgresJsDatabase<typeof Db>) {
  console.log("Seeding auth users...");

  // Test users with passwords for login testing
  const testUsers = [
    {
      name: "Test User",
      email: "test@example.com",
      password: "test123",
      emailVerified: true,
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      emailVerified: true,
    },
    {
      name: "Demo User",
      email: "demo@example.com",
      password: "demo123",
      emailVerified: true,
    },
  ];

  for (const userData of testUsers) {
    try {
      // Insert user
      const [user] = await db
        .insert(Db.user)
        .values({
          name: userData.name,
          email: userData.email,
          emailVerified: userData.emailVerified,
        })
        .returning();

      // Hash password and create identity record
      const hashedPassword = await hashPassword(userData.password);

      await db.insert(Db.identity).values({
        userId: user.id,
        providerId: "credential", // Better Auth uses "credential" for email/password
        accountId: user.id, // Use user ID as account ID for credential provider
        password: hashedPassword,
      });

      console.log(
        `✅ Created user: ${userData.email} (password: ${userData.password})`,
      );
    } catch (error) {
      // User might already exist, skip
      console.log(
        `⚠️  User ${userData.email} might already exist, skipping...`,
      );
    }
  }

  console.log(`✅ Seeded ${testUsers.length} test users with passwords`);
}

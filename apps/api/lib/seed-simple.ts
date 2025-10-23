/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { createDb } from "./db";
import type { Env } from "./env";

/**
 * Seeds the database with test users for authentication testing.
 * This is a simplified version that directly creates users without external dependencies.
 */
export async function seedDatabase(env: Env) {
  try {
    console.log("Starting database seeding...");

    // Create database connection
    const db = createDb(env.DATABASE_URL);

    // Check if user table exists and has data
    const existingUsers = await db.execute(
      `SELECT COUNT(*) as count FROM "user"`,
    );
    const userCount = Number(existingUsers[0]?.count || 0);

    if (userCount > 0) {
      console.log(
        `✅ Database already has ${userCount} users, skipping seeding`,
      );
      return {
        success: true,
        message: "Database already contains users",
        existingUsers: userCount,
      };
    }

    // Insert test users directly with SQL
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
      // Generate a simple UUID for the user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Insert user
      await db.execute(
        `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at) VALUES ('${userId}', '${userData.name}', '${userData.email}', ${userData.emailVerified}, NOW(), NOW()) ON CONFLICT (email) DO NOTHING`,
      );

      // Hash password using simple method for testing
      const hashedPassword = await hashPassword(userData.password);

      // Insert identity record for password authentication
      await db.execute(
        `INSERT INTO "identity" (id, user_id, provider_id, account_id, password, created_at, updated_at) VALUES ('identity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}', '${userId}', 'credential', '${userId}', '${hashedPassword}', NOW(), NOW()) ON CONFLICT (user_id, provider_id) DO NOTHING`,
      );

      console.log(
        `✅ Created user: ${userData.email} (password: ${userData.password})`,
      );
    }

    console.log("✅ Database seeding completed successfully");

    return {
      success: true,
      message: "Database seeded successfully",
      users: testUsers.map((u) => ({ email: u.email, password: u.password })),
    };
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    return {
      success: false,
      message: "Database seeding failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Simple password hashing for testing purposes.
 * In production, use a proper password hashing library.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_for_testing");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

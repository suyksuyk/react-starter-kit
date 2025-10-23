/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { seedAuthUsers } from "../../../db/seeds/auth-users";
import { seedUserPermissions } from "../../../db/seeds/user-permissions";
import { createDb } from "./db";
import type { Env } from "./env";

/**
 * Seeds the database with test users for authentication testing.
 * This endpoint should only be available in development or for testing purposes.
 */
export async function seedDatabase(env: Env) {
  try {
    console.log("Starting database seeding...");

    // Create database connection
    const db = createDb(env.DATABASE_URL || env.HYPERDRIVE);

    // Seed auth users
    await seedAuthUsers(db);

    // Seed user permissions and organizations
    await seedUserPermissions(db);

    console.log("✅ Database seeding completed successfully");

    return {
      success: true,
      message: "Database seeded successfully with users and permissions",
      users: [
        { email: "test@example.com", password: "test123", role: "admin" },
        { email: "admin@example.com", password: "admin123", role: "owner" },
        { email: "demo@example.com", password: "demo123", role: "member" },
        { email: "suyongkai543@163.com", role: "owner" },
        { email: "sydneiholdengi87033@gmail.com", role: "member" },
      ],
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

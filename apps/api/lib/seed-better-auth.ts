/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { createAuth } from "./auth";
import { createDb } from "./db";
import type { Env } from "./env";

/**
 * Seeds the database with test users using Better Auth's official API.
 * This ensures proper password hashing and identity record creation.
 */
export async function seedDatabaseWithBetterAuth(env: Env) {
  try {
    console.log("Starting Better Auth database seeding...");

    // Create database connection
    const db = createDb(env.DATABASE_URL);

    // Create auth instance
    const auth = createAuth(db, env);

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

    // Test users to create
    const testUsers = [
      {
        name: "Test User",
        email: "test@example.com",
        password: "test123",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
      },
      {
        name: "Demo User",
        email: "demo@example.com",
        password: "demo123",
      },
      {
        name: "Su Yongkai",
        email: "suyongkai543@163.com",
        password: "123456",
      },
    ];

    const createdUsers = [];

    for (const userData of testUsers) {
      try {
        // Use Better Auth's signUp API to create user with proper password hashing
        const result = await auth.api.signUpEmail({
          body: {
            name: userData.name,
            email: userData.email,
            password: userData.password,
          },
        });

        if (result.user) {
          createdUsers.push({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            id: result.user.id,
          });
          console.log(
            `✅ Created Better Auth user: ${userData.email} (password: ${userData.password})`,
          );
        } else {
          console.error(`❌ Failed to create user: ${userData.email}`, result);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }

    console.log("✅ Better Auth database seeding completed");

    return {
      success: true,
      message: "Database seeded with Better Auth users successfully",
      users: createdUsers,
    };
  } catch (error) {
    console.error("❌ Better Auth database seeding failed:", error);
    return {
      success: false,
      message: "Better Auth database seeding failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

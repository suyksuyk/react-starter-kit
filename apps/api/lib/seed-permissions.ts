/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../db/schema";

/**
 * Seeds user permissions and role-based access control.
 * Creates organizations and assigns users to different roles.
 */
export async function seedUserPermissions(
  db: PostgresJsDatabase<typeof schema>,
) {
  console.log("Seeding user permissions and organizations...");

  try {
    // Create main organization
    const [mainOrg] = await db
      .insert(schema.organization)
      .values({
        name: "Rainwish",
        slug: "rainwish-main",
        metadata: JSON.stringify({
          type: "main",
          description: "Main Rainwish organization",
        }),
      })
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Created organization: ${mainOrg.name}`);

    // Get all users first, then filter
    const allUsers = await db.select().from(schema.user);

    const targetEmails = [
      "suyongkai543@163.com", // Current user (admin)
      "sydneiholdengi87033@gmail.com", // New test user (regular user)
      "test@example.com", // Test user (editor)
      "admin@example.com", // Admin user (owner)
      "demo@example.com", // Demo user (viewer)
    ];

    const users = allUsers.filter((user) => targetEmails.includes(user.email));

    console.log(`Found ${users.length} users to assign permissions`);

    // Assign roles to users
    const roleAssignments = [
      {
        email: "suyongkai543@163.com",
        role: "owner",
        description: "Super admin - full access",
      },
      {
        email: "sydneiholdengi87033@gmail.com",
        role: "member",
        description: "Regular user - limited access",
      },
      {
        email: "test@example.com",
        role: "admin",
        description: "Organization admin - can manage users",
      },
      {
        email: "admin@example.com",
        role: "owner",
        description: "Organization owner - full access",
      },
      {
        email: "demo@example.com",
        role: "member",
        description: "Demo user - read-only access",
      },
    ];

    for (const assignment of roleAssignments) {
      const user = users.find((u) => u.email === assignment.email);
      if (!user) {
        console.log(`⚠️  User ${assignment.email} not found, skipping...`);
        continue;
      }

      try {
        await db
          .insert(schema.member)
          .values({
            userId: user.id,
            organizationId: mainOrg.id,
            role: assignment.role,
          })
          .onConflictDoNothing();

        console.log(
          `✅ Assigned ${assignment.role} role to ${assignment.email} (${assignment.description})`,
        );
      } catch {
        console.log(
          `⚠️  Role assignment for ${assignment.email} might already exist, skipping...`,
        );
      }
    }

    console.log("✅ User permissions seeding completed");
  } catch (error) {
    console.error("❌ Error seeding user permissions:", error);
    throw error;
  }
}

/**
 * Seeds user permissions for the API
 */
export async function seedPermissions(env: any) {
  try {
    // Create database connection
    const { createDb } = await import("./db.js");
    const db = createDb(env.DATABASE_URL || env.HYPERDRIVE);

    // Seed user permissions
    await seedUserPermissions(db);

    return {
      success: true,
      message: "User permissions seeded successfully",
      users: [
        { email: "test@example.com", role: "admin" },
        { email: "admin@example.com", role: "owner" },
        { email: "demo@example.com", role: "member" },
        { email: "suyongkai543@163.com", role: "owner" },
        { email: "sydneiholdengi87033@gmail.com", role: "member" },
      ],
    };
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    return {
      success: false,
      message: "Permissions seeding failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

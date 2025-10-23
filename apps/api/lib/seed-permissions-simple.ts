/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

/**
 * Simple permissions seeding using direct SQL queries
 */

/**
 * Seeds user permissions and organizations using direct SQL
 */
export async function seedPermissions(env: any) {
  try {
    // Create database connection
    const { createDb } = await import("./db.js");
    const db = createDb(env.DATABASE_URL || env.HYPERDRIVE);

    console.log("Starting permissions seeding with direct SQL...");

    // Create main organization
    await db.execute(`
      INSERT INTO "organization" (name, slug, metadata, created_at, updated_at)
      VALUES (
        'Rainwish',
        'rainwish-main',
        '{"type": "main", "description": "Main Rainwish organization"}',
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO NOTHING
    `);

    console.log("✅ Created main organization");

    // Get organization ID
    const orgResult = await db.execute(`
      SELECT id FROM "organization" WHERE slug = 'rainwish-main' LIMIT 1
    `);

    const orgId = orgResult[0]?.id;
    if (!orgId) {
      throw new Error("Failed to create or find organization");
    }

    console.log(`✅ Found organization ID: ${orgId}`);

    // Get users
    const users = await db.execute(`
      SELECT id, email FROM "user"
      WHERE email IN (
        'suyongkai543@163.com',
        'sydneiholdengi87033@gmail.com',
        'test@example.com',
        'admin@example.com',
        'demo@example.com'
      )
    `);

    console.log(`✅ Found ${users.length} users to assign permissions`);

    // Generate UUID in JavaScript
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        },
      );
    };

    // Create a default team for the organization
    const teamId = generateUUID();
    await db.execute(
      `INSERT INTO "team" (id, name, organization_id, created_at, updated_at) VALUES ('${teamId}', 'Default Team', '${orgId}', NOW(), NOW()) ON CONFLICT DO NOTHING`,
    );

    console.log("✅ Created default team");

    if (!teamId) {
      throw new Error("Failed to create or find team");
    }

    console.log(`✅ Found team ID: ${teamId}`);

    // Assign users to team - use existing users
    console.log(
      "📋 Available users:",
      users.map((u: any) => `${u.email} (${u.id})`),
    );

    const userAssignments = ["suyongkai543@163.com", "admin@example.com"];

    for (const email of userAssignments) {
      const user = users.find((u: any) => u.email === email);
      if (!user) {
        console.log(`⚠️  User ${email} not found, skipping...`);
        continue;
      }

      try {
        await db.execute(
          `INSERT INTO "team_member" (team_id, user_id, created_at) VALUES ('${teamId}', '${user.id}', NOW()) ON CONFLICT (team_id, user_id) DO NOTHING`,
        );

        console.log(`✅ Added ${email} to team`);
      } catch (error) {
        console.log(
          `⚠️  Team membership for ${email} might already exist:`,
          error,
        );
      }
    }

    console.log("✅ User permissions seeding completed successfully");

    return {
      success: true,
      message: "User permissions seeded successfully using direct SQL",
      users: userAssignments,
      organizationId: orgId,
      teamId: teamId,
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

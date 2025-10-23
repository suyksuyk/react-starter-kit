/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { db } from "../db";
import { seedUserPermissions } from "../db/seeds/user-permissions";

/**
 * Script to seed user permissions and roles
 * Run with: bun run scripts/seed-permissions.ts
 */
async function main() {
  try {
    console.log("🌱 Starting user permissions seeding...");

    await seedUserPermissions(db);

    console.log("✅ User permissions seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding user permissions:", error);
    process.exit(1);
  }
}

main();

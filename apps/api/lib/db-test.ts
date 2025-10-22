/**
 * Database connection test utility
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { createDb } from "./db.js";

// Hyperdrive type definition
interface Hyperdrive {
  connectionString: string;
}

/**
 * Test database connection and basic query
 */
export async function testDatabaseConnection(hyperdrive: Hyperdrive) {
  try {
    const db = createDb(hyperdrive);

    // Test basic connection with a simple query
    const result = await db.execute("SELECT 1 as test");

    return {
      success: true,
      message: "Database connection successful",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

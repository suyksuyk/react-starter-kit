/**
 * Database client using Neon PostgreSQL.
 *
 * Provides the same Drizzle ORM interface as the default D1 setup but connects to
 * Neon via Cloudflare Hyperdrive for connection pooling and edge optimization.
 *
 * Two Hyperdrive bindings are available:
 * - HYPERDRIVE_CACHED: Cached connection with 60-second cache for read-heavy operations
 * - HYPERDRIVE_DIRECT: Direct connection with no caching for real-time data operations
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { schema } from "@repo/db";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Creates a database client using Drizzle ORM and PostgreSQL connection.
 *
 * Configuration is optimized for Cloudflare Workers environment with single
 * connection per request and aggressive timeouts to prevent connection leaks.
 * The `prepare: false` setting avoids prepared statement caching which can
 * cause issues in the Workers runtime.
 *
 * @param connectionSource - Either Cloudflare Hyperdrive binding or direct connection string
 * @returns Drizzle ORM database client with postgres.js adapter
 * @throws Will throw if connection string is invalid or connection fails
 *
 * @example
 * ```typescript
 * // In Cloudflare Workers context with Hyperdrive
 * const db = createDb(env.HYPERDRIVE);
 *
 * // Or with direct connection string
 * const db = createDb(env.DATABASE_URL);
 * ```
 */
export function createDb(connectionSource: Hyperdrive | string) {
  const connectionString =
    typeof connectionSource === "string"
      ? connectionSource
      : connectionSource.connectionString;

  const client = postgres(connectionString, {
    max: 1,
    connect_timeout: 10,
    prepare: false, // Recommended for Cloudflare Workers
    idle_timeout: 20, // Close idle connections quickly
    max_lifetime: 60 * 30, // 30 minutes max connection lifetime
    transform: {
      undefined: null, // Convert undefined to null for PostgreSQL
    },
    onnotice: () => {}, // Suppress notices in Workers
  });

  return drizzle(client, { schema });
}

/**
 * Database schema re-exported as `Db` for convenient table access.
 *
 * Provides typed access to all database tables, columns, and relations
 * defined in the shared schema package.
 *
 * @example
 * ```typescript
 * import { Db } from './db';
 *
 * // Access tables directly
 * await db.select().from(Db.users);
 * await db.insert(Db.posts).values({ title: 'Hello', userId: 1 });
 * ```
 */
export { schema as Db };

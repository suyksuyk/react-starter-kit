/**
 * Cloudflare Workers entry point for the API.
 *
 * This module configures the core API app with Cloudflare Workers-specific
 * context initialization, including Hyperdrive database bindings and
 * authentication setup.
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { Hono } from "hono";
import app from "./lib/app.js";
import { createAuth } from "./lib/auth.js";
import type { AppContext } from "./lib/context.js";
import { createDb } from "./lib/db.js";
import type { Env } from "./lib/env.js";

type CloudflareEnv = {
  HYPERDRIVE?: {
    connectionString: string;
  };
  DATABASE_URL?: string;
} & Env;

// Create a Hono app with Cloudflare Workers context
const worker = new Hono<{
  Bindings: CloudflareEnv;
  Variables: AppContext["Variables"];
}>();

// Initialize shared context for all requests
worker.use("*", async (c, next) => {
  try {
    // Try DATABASE_URL first, fallback to Hyperdrive
    const connectionSource = c.env.DATABASE_URL || c.env.HYPERDRIVE;

    if (!connectionSource) {
      console.error("No database configuration found");
      return c.json({ error: "Database configuration error" }, 500);
    }

    // Initialize database using direct connection or Hyperdrive
    const db = createDb(connectionSource as any);

    // Initialize auth
    const auth = createAuth(db, c.env);

    // Set context variables
    c.set("db", db);
    c.set("auth", auth);

    await next();
  } catch (error) {
    console.error("Worker initialization error:", error);
    // Don't return 500 error immediately, let the request continue
    // This allows auth endpoints to work even if database fails
    await next();
  }
});

// Mount the core API app
worker.route("/", app);

export default worker;

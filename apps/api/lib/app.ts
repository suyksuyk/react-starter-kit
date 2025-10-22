/**
 * Core Hono application for the API.
 *
 * This module contains the pure API routing logic that can be used across
 * different deployment environments (local development, Cloudflare Workers, etc.).
 * The app expects database and auth to be initialized upstream via middleware.
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { organizationRouter } from "../routers/organization.js";
import { userRouter } from "../routers/user.js";
import type { AppContext } from "./context.js";
import { router } from "./trpc.js";

// tRPC API router
const appRouter = router({
  user: userRouter,
  organization: organizationRouter,
});

// HTTP router
const app = new Hono<AppContext>();

// CORS configuration
app.use(
  "/*",
  cors({
    origin: (origin, c) => {
      const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(",") || [
        "https://rainwish.top",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        return origin;
      }
      return allowedOrigins[0];
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }),
);

app.get("/", (c) => c.redirect("/api"));

// Root endpoint with API information
app.get("/api", (c) => {
  return c.json({
    name: "@repo/api",
    version: "0.0.0",
    endpoints: {
      trpc: "/api/trpc",
      auth: "/api/auth",
      health: "/api/health",
    },
    documentation: {
      trpc: "https://trpc.io",
      auth: "https://www.better-auth.com",
    },
  });
});

// Health check endpoint
app.get("/api/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Database test endpoint
app.get("/api/db-test", async (c) => {
  const { testDatabaseConnection } = await import("./db-test.js");

  // Access Hyperdrive from the global environment (Cloudflare Workers binding)
  // @ts-expect-error - HYPERDRIVE is a Cloudflare Worker binding, not in Env type
  const hyperdrive = (c.env as { HYPERDRIVE?: { connectionString: string } })
    .HYPERDRIVE;

  if (!hyperdrive) {
    return c.json(
      {
        success: false,
        message: "Hyperdrive binding not found",
      },
      500,
    );
  }

  const result = await testDatabaseConnection(hyperdrive);
  const status = result.success ? 200 : 500;
  return c.json(result, status);
});

// Auth test endpoint
app.get("/api/auth-test", (c) => {
  const auth = c.get("auth");
  return c.json({
    authInitialized: !!auth,
    hasHandler: !!auth?.handler,
    env: {
      APP_NAME: c.env.APP_NAME,
      APP_ORIGIN: c.env.APP_ORIGIN,
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET
        ? "***set***"
        : "***missing***",
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID ? "***set***" : "***missing***",
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET
        ? "***set***"
        : "***missing***",
    },
  });
});

// Authentication routes
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  const auth = c.get("auth");
  if (!auth) {
    return c.json({ error: "Authentication service not initialized" }, 503);
  }
  return auth.handler(c.req.raw);
});

// tRPC API routes
app.use("/api/trpc/*", (c) => {
  return fetchRequestHandler({
    req: c.req.raw,
    router: appRouter,
    endpoint: "/api/trpc",
    async createContext({ req, resHeaders, info }) {
      const db = c.get("db");
      const dbDirect = c.get("dbDirect");
      const auth = c.get("auth");

      // Database connections are optional for now
      // TODO: Add proper database configuration
      if (!db) {
        console.warn("Database not available in context");
      }

      if (!dbDirect) {
        console.warn("Direct database not available in context");
      }

      if (!auth) {
        console.warn("Authentication service not available in context");
      }

      const sessionData = auth
        ? await auth.api.getSession({
            headers: req.headers,
          })
        : null;

      return {
        req,
        res: c.res,
        resHeaders,
        info,
        env: c.env,
        db,
        dbDirect,
        session: sessionData?.session ?? null,
        user: sessionData?.user ?? null,
        cache: new Map(),
      };
    },
    batching: {
      enabled: true,
    },
    onError({ error, path }) {
      console.error("tRPC error on path", path, ":", error);
    },
  });
});

export { appRouter };
export type AppRouter = typeof appRouter;
export default app;

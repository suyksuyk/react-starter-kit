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
  // Get database from context (already initialized in worker.ts)
  const db = c.get("db");

  if (!db) {
    return c.json(
      {
        success: false,
        message: "Database not initialized in context",
      },
      500,
    );
  }

  try {
    // Test basic connection with a simple query using the existing db connection
    const result = await db.execute("SELECT 1 as test");

    return c.json({
      success: true,
      message: "Database connection successful",
      data: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
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
app.all("/api/auth/signin", async (c) => {
  const auth = c.get("auth");
  if (!auth) {
    console.error("Auth service not initialized");
    return c.json({ error: "Authentication service not initialized" }, 503);
  }

  try {
    console.log("Auth signin request:", {
      method: c.req.method,
      url: c.req.url,
      path: c.req.path,
    });

    const response = await auth.handler(c.req.raw);

    // Convert Response to Hono response
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("Auth handler error:", error);
    return c.json(
      {
        error: "Auth handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

app.all("/api/auth/session", async (c) => {
  const auth = c.get("auth");
  if (!auth) {
    console.error("Auth service not initialized");
    return c.json({ error: "Authentication service not initialized" }, 503);
  }

  try {
    console.log("Auth session request:", {
      method: c.req.method,
      url: c.req.url,
      path: c.req.path,
    });

    const response = await auth.handler(c.req.raw);

    // Convert Response to Hono response
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("Auth handler error:", error);
    return c.json(
      {
        error: "Auth handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Catch-all for other auth routes
app.all("/api/auth/*", async (c) => {
  const auth = c.get("auth");
  if (!auth) {
    console.error("Auth service not initialized");
    return c.json({ error: "Authentication service not initialized" }, 503);
  }

  try {
    console.log("Auth catch-all request:", {
      method: c.req.method,
      url: c.req.url,
      path: c.req.path,
    });

    const response = await auth.handler(c.req.raw);

    // Convert Response to Hono response
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("Auth handler error:", error);
    return c.json(
      {
        error: "Auth handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
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

// Seed database endpoint
app.post("/api/admin/seed-database", async (c) => {
  try {
    console.log("Seed endpoint called");
    const { seedDatabase } = await import("./seed-simple.js");
    const result = await seedDatabase(c.env);
    console.log("Seed result:", result);
    return c.json(result);
  } catch (error) {
    console.error("Seed endpoint error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Seed database with Better Auth endpoint
app.post("/api/admin/seed-better-auth", async (c) => {
  try {
    console.log("Better Auth seed endpoint called");
    const { seedDatabaseWithBetterAuth } = await import(
      "./seed-better-auth.js"
    );
    const result = await seedDatabaseWithBetterAuth(c.env);
    console.log("Better Auth seed result:", result);
    return c.json(result);
  } catch (error) {
    console.error("Better Auth seed endpoint error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Seed user permissions and organizations endpoint
app.post("/api/admin/seed-permissions", async (c) => {
  try {
    console.log("Permissions seed endpoint called");

    // Import and run the permissions seeding
    const { seedPermissions } = await import("./seed-permissions-simple.js");
    const result = await seedPermissions(c.env);

    return c.json(result);
  } catch (error) {
    console.error("Permissions seed endpoint error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Simple test endpoint
app.get("/api/admin/test", (c) => {
  return c.json({
    message: "Admin endpoint working",
    timestamp: new Date().toISOString(),
  });
});

// Debug users endpoint
app.get("/api/admin/users", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    const users = await db.execute(`
      SELECT u.id, u.name, u.email, u.email_verified, u.created_at,
             i.provider_id, i.account_id
      FROM "user" u
      LEFT JOIN "identity" i ON u.id = i.user_id
      ORDER BY u.created_at DESC
      LIMIT 10
    `);

    return c.json({
      success: true,
      users: users,
      count: users.length,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Debug user permissions endpoint
app.get("/api/admin/permissions", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    const permissions = await db.execute(`
      SELECT
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        o.id as org_id,
        o.name as org_name,
        o.slug as org_slug,
        m.role,
        m.created_at as member_since
      FROM "user" u
      LEFT JOIN "member" m ON u.id = m.user_id
      LEFT JOIN "organization" o ON m.organization_id = o.id
      ORDER BY u.created_at DESC, m.created_at DESC
    `);

    return c.json({
      success: true,
      permissions: permissions,
      count: permissions.length,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Debug database tables endpoint
app.get("/api/admin/debug-tables", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    // Check if tables exist and get their data
    const tables: any = {};

    try {
      tables.organizations = await db.execute(`
        SELECT * FROM "organization" LIMIT 5
      `);
    } catch (e) {
      tables.organizations = {
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }

    try {
      tables.members = await db.execute(`
        SELECT * FROM "member" LIMIT 5
      `);
    } catch (e) {
      tables.members = {
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }

    try {
      tables.teams = await db.execute(`
        SELECT * FROM "team" LIMIT 5
      `);
    } catch (e) {
      tables.teams = {
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }

    try {
      tables.team_members = await db.execute(`
        SELECT * FROM "team_member" LIMIT 5
      `);
    } catch (e) {
      tables.team_members = {
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }

    try {
      tables.users = await db.execute(`
        SELECT id, name, email FROM "user" LIMIT 5
      `);
    } catch (e) {
      tables.users = {
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }

    return c.json({
      success: true,
      tables: tables,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Debug team member insertion endpoint
app.post("/api/admin/debug-team-member", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    // Get existing team and user
    const teams = await db.execute(`SELECT id FROM "team" LIMIT 1`);
    const users = await db.execute(`SELECT id, email FROM "user" LIMIT 1`);

    if (teams.length === 0 || users.length === 0) {
      return c.json({ error: "No team or user found" }, 400);
    }

    const teamId = teams[0].id;
    const userId = users[0].id;
    const userEmail = users[0].email;

    console.log(
      `Attempting to insert team_member: teamId=${teamId}, userId=${userId}, email=${userEmail}`,
    );

    // Try to insert team member
    try {
      await db.execute(
        `INSERT INTO "team_member" (team_id, user_id, created_at) VALUES ('${teamId}', '${userId}', NOW())`,
      );

      // Verify insertion
      const teamMembers = await db.execute(`SELECT * FROM "team_member"`);

      return c.json({
        success: true,
        message: "Team member inserted successfully",
        teamId,
        userId,
        userEmail,
        teamMembers: teamMembers,
      });
    } catch (error) {
      console.error("Team member insertion error:", error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        teamId,
        userId,
        userEmail,
      });
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Add second user to team endpoint
app.post("/api/admin/add-second-user", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    // Get existing team and second user
    const teams = await db.execute(`SELECT id FROM "team" LIMIT 1`);
    const users = await db.execute(
      `SELECT id, email FROM "user" WHERE email = 'suyongkai543@163.com' LIMIT 1`,
    );

    if (teams.length === 0 || users.length === 0) {
      return c.json({ error: "No team or second user found" }, 400);
    }

    const teamId = teams[0].id;
    const userId = users[0].id;
    const userEmail = users[0].email;

    console.log(
      `Attempting to insert second user team_member: teamId=${teamId}, userId=${userId}, email=${userEmail}`,
    );

    // Try to insert team member
    try {
      await db.execute(
        `INSERT INTO "team_member" (team_id, user_id, created_at) VALUES ('${teamId}', '${userId}', NOW())`,
      );

      // Verify insertion
      const teamMembers = await db.execute(`
        SELECT tm.*, u.name, u.email
        FROM "team_member" tm
        JOIN "user" u ON tm.user_id = u.id
      `);

      return c.json({
        success: true,
        message: "Second user added to team successfully",
        teamId,
        userId,
        userEmail,
        teamMembers: teamMembers,
      });
    } catch (error) {
      console.error("Second user team member insertion error:", error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        teamId,
        userId,
        userEmail,
      });
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Clear database endpoint (for testing only)
app.post("/api/admin/clear-database", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    // Delete all users and their identities
    await db.execute(`DELETE FROM "identity"`);
    await db.execute(`DELETE FROM "user"`);

    return c.json({
      success: true,
      message: "Database cleared successfully",
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Debug table schema endpoint
app.get("/api/admin/debug-schema", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    // Get user table schema
    const userSchema = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position
    `);

    // Get identity table schema
    const identitySchema = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'identity'
      ORDER BY ordinal_position
    `);

    return c.json({
      success: true,
      schemas: {
        user: userSchema,
        identity: identitySchema,
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Simple user insertion test endpoint
app.post("/api/admin/test-user-insert", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    console.log("Testing simple user insertion...");

    // Try the simplest possible insert
    try {
      await db.execute(`
        INSERT INTO "user" (name, email, email_verified)
        VALUES ('Test User', 'test@example.com', true)
      `);

      return c.json({
        success: true,
        message: "Test user inserted successfully",
      });
    } catch (error) {
      console.error("Simple insert failed:", error);

      // Try with explicit NULL for optional fields
      try {
        await db.execute(`
          INSERT INTO "user" (name, email, email_verified, image, is_anonymous)
          VALUES ('Test User 2', 'test2@example.com', true, NULL, false)
        `);

        return c.json({
          success: true,
          message: "Test user 2 inserted successfully with explicit NULLs",
        });
      } catch (error2) {
        console.error("Second insert failed:", error2);
        return c.json({
          success: false,
          error: "Both insert attempts failed",
          error1: error instanceof Error ? error.message : "Unknown error",
          error2: error2 instanceof Error ? error2.message : "Unknown error",
        });
      }
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Add new users with specific roles endpoint
app.post("/api/admin/add-new-users", async (c) => {
  try {
    const db = c.get("db");
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    // Get existing team
    const teams = await db.execute(`SELECT id FROM "team" LIMIT 1`);
    if (teams.length === 0) {
      return c.json({ error: "No team found" }, 400);
    }
    const teamId = teams[0].id;

    // New users to add
    const newUsers = [
      {
        email: "sydneiholdengi87033@gmail.com",
        name: "Sydney Admin",
        role: "admin",
      },
      {
        email: "suyongkai543@live.com",
        name: "Viewer User",
        role: "viewer",
      },
    ];

    const results = [];

    for (const newUser of newUsers) {
      try {
        // Check if user already exists
        const existingUser = await db.execute(
          `SELECT id FROM "user" WHERE email = '${newUser.email}' LIMIT 1`,
        );

        let userId;
        if (existingUser.length === 0) {
          // Create new user - let database generate UUID
          await db.execute(`
            INSERT INTO "user" (name, email, email_verified, image, is_anonymous)
            VALUES ('${newUser.name}', '${newUser.email}', true, NULL, false)
          `);

          // Get the created user
          const createdUser = await db.execute(
            `SELECT id FROM "user" WHERE email = '${newUser.email}' LIMIT 1`,
          );
          userId = createdUser[0].id;

          // Create identity for password authentication - let database generate UUID
          await db.execute(`
            INSERT INTO "identity" (user_id, provider_id, provider_account_id)
            VALUES ('${userId}', 'credential', '${userId}')
          `);
        } else {
          userId = existingUser[0].id;
        }

        // Add to team if not already a member
        const existingMember = await db.execute(
          `SELECT id FROM "team_member" WHERE team_id = '${teamId}' AND user_id = '${userId}' LIMIT 1`,
        );

        if (existingMember.length === 0 && newUser.role === "admin") {
          // Only add admin to team members (viewers don't need team membership)
          await db.execute(`
            INSERT INTO "team_member" (team_id, user_id, created_at)
            VALUES ('${teamId}', '${userId}', NOW())
          `);
        }

        results.push({
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          userId: userId,
          addedToTeam: newUser.role === "admin" || existingMember.length > 0,
          status: existingUser.length === 0 ? "created" : "existing",
        });
      } catch (error) {
        results.push({
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          error: error instanceof Error ? error.message : "Unknown error",
          status: "failed",
        });
      }
    }

    // Get updated user list
    const updatedUsers = await db.execute(`
      SELECT u.id, u.name, u.email, u.email_verified, u.created_at,
             CASE WHEN tm.user_id IS NOT NULL THEN 'Editor' ELSE 'Viewer' END as role
      FROM "user" u
      LEFT JOIN "team_member" tm ON u.id = tm.user_id
      ORDER BY u.created_at DESC
    `);

    return c.json({
      success: true,
      message: "New users processed successfully",
      results: results,
      users: updatedUsers,
      teamId: teamId,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

export { appRouter };
export type AppRouter = typeof appRouter;
export default app;

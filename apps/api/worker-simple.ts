/**
 * Simplified Cloudflare Workers entry point for testing.
 */

import { Hono } from "hono";

const app = new Hono();

// Basic health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: "production",
  });
});

// Basic API info endpoint
app.get("/api", (c) => {
  return c.json({
    name: "Rainwish API",
    version: "1.0.0",
    environment: "production",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// CORS preflight handler
app.options("*", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return c.text("", 200);
});

// Add CORS headers to all responses
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  await next();
});

export default app;

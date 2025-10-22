/**
 * API integration tests
 *
 * Tests the core API functionality including health checks, auth endpoints, and tRPC routes
 */

import { describe, expect, it } from "vitest";
import app from "../lib/app.js";

describe("API Health Check", () => {
  it("should return health status", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("status", "healthy");
    expect(data).toHaveProperty("timestamp");
  });

  it("should return API information", async () => {
    const res = await app.request("/api");
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      name: string;
      endpoints: {
        trpc: string;
        auth: string;
        health: string;
      };
    };
    expect(data).toHaveProperty("name", "@repo/api");
    expect(data).toHaveProperty("endpoints");
    expect(data.endpoints).toHaveProperty("trpc", "/api/trpc");
    expect(data.endpoints).toHaveProperty("auth", "/api/auth");
    expect(data.endpoints).toHaveProperty("health", "/health");
  });
});

describe("API Routes", () => {
  it("should redirect root to /api", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/api");
  });

  it("should handle tRPC batch requests", async () => {
    // Test tRPC endpoint availability
    const res = await app.request("/api/trpc/user.me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Should return 401 for unauthenticated requests
    expect(res.status).toBe(401);
  });
});

describe("Error Handling", () => {
  it("should handle 404 routes", async () => {
    const res = await app.request("/nonexistent");
    expect(res.status).toBe(404);
  });

  it("should handle invalid tRPC requests", async () => {
    const res = await app.request("/api/trpc/invalid.procedure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(404);
  });
});

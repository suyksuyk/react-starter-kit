/**
 * 最简化Worker - 不依赖任何绑定
 */

export default {
  async fetch(request: Request, env: Record<string, unknown>) {
    const url = new URL(request.url);

    // 基本路由
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Worker is running",
          timestamp: new Date().toISOString(),
          method: request.method,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      );
    }

    if (url.pathname === "/api") {
      return new Response(
        JSON.stringify({
          name: "Rainwish API",
          version: "1.0.0",
          environment: env.ENVIRONMENT || "unknown",
          status: "running",
          bindings: Object.keys(env || {}),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // 根路径
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          message: "Rainwish API is running",
          endpoints: ["/health", "/api"],
          worker: "minimal",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // 404
    return new Response(
      JSON.stringify({
        error: "Not Found",
        path: url.pathname,
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  },
};

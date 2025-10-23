/**
 * Simple Worker for handling SPA routing and API proxy
 * Minimal implementation for debugging
 */
export default {
  async fetch(request: Request, env: unknown, ctx: unknown): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Proxy API requests to rainwish-api
    if (pathname.startsWith("/api/")) {
      try {
        const apiUrl = new URL(request.url);
        apiUrl.hostname = "rainwish-api.sydneiholdengi87033.workers.dev";

        const apiRequest = new Request(apiUrl.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });

        const response = await fetch(apiRequest);

        // Copy response headers
        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin", "https://app.rainwish.top");
        headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS",
        );
        headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With",
        );
        headers.set("Access-Control-Allow-Credentials", "true");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        console.error("API proxy error:", error);
        return new Response(
          JSON.stringify({
            error: "API proxy failed",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 502,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // Special handling for [object Object] redirect issue
    if (
      pathname.includes("[object Object]") ||
      pathname.includes("%5Bobject%20Object%5D")
    ) {
      console.log(
        "🔧 Detected [object Object] path, redirecting to home:",
        pathname,
      );
      return Response.redirect(
        new URL("https://app.rainwish.top/", request.url),
        301,
      );
    }

    // Handle static assets directly
    if (
      pathname.startsWith("/_app/") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/logo") ||
      pathname.endsWith(".js") ||
      pathname.endsWith(".css") ||
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".ico") ||
      pathname.endsWith(".svg")
    ) {
      // Try to fetch from static assets
      try {
        const assetResponse = await fetch(new Request(request.url, request));
        if (assetResponse.ok) {
          return assetResponse;
        }
      } catch (error) {
        console.log("Asset fetch failed:", error);
      }
    }

    // Serve test page for specific path
    if (pathname === "/test-simple.html") {
      try {
        const testPageResponse = await fetch(new Request(request.url, request));
        if (testPageResponse.ok) {
          return testPageResponse;
        }
      } catch (error) {
        console.log("Test page fetch failed:", error);
      }
    }

    // For all other paths, serve index.html from assets (SPA routing)
    try {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = "/index.html";
      const indexResponse = await fetch(
        new Request(indexUrl.toString(), request),
      );
      if (indexResponse.ok) {
        return indexResponse;
      }
    } catch (error) {
      console.log("Index fetch failed:", error);
    }

    // Fallback response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>App Rainwish - Maintenance</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #f44336; }
          .info { color: #2196F3; }
        </style>
      </head>
      <body>
        <h1 class="error">🚧 应用正在维护中</h1>
        <p class="info">请稍后再试或访问测试页面：<a href="/test-simple.html">测试页面</a></p>
        <p>当前路径: ${pathname}</p>
        <p>时间: ${new Date().toISOString()}</p>
      </body>
      </html>
    `,
      {
        status: 503,
        headers: { "Content-Type": "text/html" },
      },
    );
  },
};

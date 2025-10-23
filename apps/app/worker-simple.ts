/**
 * Simple Worker for handling SPA routing
 * Minimal implementation for debugging
 */
export default {
  async fetch(request: Request, env: unknown, ctx: unknown): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

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

    // For all other paths, serve index.html
    try {
      const indexResponse = await fetch(
        new Request("https://app.rainwish.top/index.html", request),
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

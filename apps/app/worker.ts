/**
 * Simple Worker for handling SPA routing and API proxy
 * Minimal implementation for debugging
 */
export default {
  async fetch(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    env: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ctx: unknown,
  ): Promise<Response> {
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

    // Fallback - serve a simple index.html for SPA routing
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Rainwish App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            max-width: 400px;
            width: 100%;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
          }
          .logo {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .message {
            color: #64748b;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }
          .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-1px);
          }
          .debug {
            margin-top: 2rem;
            font-size: 0.875rem;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Rainwish</div>
          <div class="message">
            欢迎使用 Rainwish 应用！<br>
            正在加载中...
          </div>
          <a href="/login" class="btn">立即登录</a>
          <div class="debug">
            路径: ${pathname}<br>
            时间: ${new Date().toISOString()}
          </div>
        </div>
        <script>
          // Auto-redirect to login after 2 seconds
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 2000);
        </script>
      </body>
      </html>
    `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    );
  },
};

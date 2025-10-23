/**
 * Cloudflare Worker for serving static assets
 * Handles requests to the Astro-built static site
 */

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Default to index.html for SPA routing
    let assetPath = pathname;
    if (assetPath === "/") {
      assetPath = "/index.html";
    } else if (!assetPath.includes(".")) {
      // If no extension, serve index.html for SPA routing
      assetPath = "/index.html";
    }

    try {
      // Try to serve the static asset
      const asset = await env.ASSETS.fetch(new Request(assetPath, request));

      if (asset.status === 404) {
        // Fallback to index.html for SPA routing
        return env.ASSETS.fetch(new Request("/index.html", request));
      }

      return asset;
    } catch {
      // If anything goes wrong, try to serve index.html
      try {
        return env.ASSETS.fetch(new Request("/index.html", request));
      } catch {
        return new Response("Service Unavailable", { status: 503 });
      }
    }
  },
};

/**
 * HTTP Router for handling requests
 */

import { serveDir } from "@std/http/file-server";
import { renderTemplate } from "./template.ts";

export async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Handle WebSocket upgrade (check both standard and Cloudflare headers)
  const upgrade = req.headers.get("upgrade");
  const connection = req.headers.get("connection");
  if (upgrade === "websocket" || (connection && connection.toLowerCase().includes("upgrade"))) {
    return handleWebSocket(req);
  }

  // Static files
  if (pathname.startsWith("/static/")) {
    const response = await serveDir(req, {
      fsRoot: "static",
      urlRoot: "static",
    });

    // Set correct MIME type for manifest.json
    if (pathname.endsWith("/manifest.json")) {
      response.headers.set("content-type", "application/manifest+json");
    }

    return response;
  }

  // Routes
  switch (pathname) {
    case "/":
      return handleHome(req);
    case "/chat":
      return handleChat(req);
    case "/ws":
      return handleWebSocket(req);
    case "/health":
      return handleHealth(req);
    default:
      return new Response("Not Found", { status: 404 });
  }
}

async function handleHome(_req: Request): Promise<Response> {
  const html = await renderTemplate("home", {
    title: "Easy Chat - 简易聊天室",
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function handleChat(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return Response.redirect("/");
  }

  const html = await renderTemplate("chat", {
    title: "聊天室",
    username: username,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function handleHealth(_req: Request): Response {
  return new Response(JSON.stringify({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "easy-chat"
  }), {
    headers: { "content-type": "application/json" },
  });
}

async function handleWebSocket(req: Request): Promise<Response> {
  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const { handleWebSocketConnection } = await import("./websocket.ts");

    handleWebSocketConnection(socket, req);

    return response;
  } catch (error) {
    console.error('WebSocket upgrade failed:', error);
    return new Response('WebSocket upgrade failed', { status: 400 });
  }
}

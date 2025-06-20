/**
 * HTTP Router for handling requests
 */

import { serveDir } from "@std/http/file-server";
import { renderTemplate } from "./template.ts";

export async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    return handleWebSocket(req);
  }

  // Static files
  if (pathname.startsWith("/static/")) {
    return serveDir(req, {
      fsRoot: "static",
      urlRoot: "static",
    });
  }

  // Routes
  switch (pathname) {
    case "/":
      return handleHome(req);
    case "/chat":
      return handleChat(req);
    case "/ws":
      return handleWebSocket(req);
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

async function handleWebSocket(req: Request): Promise<Response> {
  const { socket, response } = Deno.upgradeWebSocket(req);
  const { handleWebSocketConnection } = await import("./websocket.ts");

  handleWebSocketConnection(socket, req);

  return response;
}

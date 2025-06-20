/**
 * Easy Chat - A simple SSR chat room built with Deno
 * Main entry point for the application
 */

import { router } from "./router.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");

console.log(`🚀 Easy Chat server starting on http://localhost:${PORT}`);

Deno.serve({ port: PORT }, router);

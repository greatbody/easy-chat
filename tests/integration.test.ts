/**
 * Integration tests for the chat application
 */

import { assertEquals, assertStringIncludes } from "@std/assert";

const TEST_PORT = 8001;
const BASE_URL = `http://localhost:${TEST_PORT}`;
const WS_URL = `ws://localhost:${TEST_PORT}`;

// Start test server
async function startTestServer(): Promise<Deno.ChildProcess> {
  const command = new Deno.Command("deno", {
    args: ["run", "--allow-net", "--allow-read", "src/main.ts"],
    env: { PORT: TEST_PORT.toString() },
    stdout: "piped",
    stderr: "piped",
  });

  const process = command.spawn();

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  return process;
}

async function stopTestServer(process: Deno.ChildProcess) {
  process.kill();
  await process.status;
}

Deno.test("Integration - HTTP Routes", async (t) => {
  const server = await startTestServer();

  try {
    await t.step("should serve home page", async () => {
      const response = await fetch(`${BASE_URL}/`);
      assertEquals(response.status, 200);

      const html = await response.text();
      assertStringIncludes(html, "欢迎来到 Easy Chat");
      assertStringIncludes(html, "请输入您的用户名");
    });

    await t.step("should serve chat page with username", async () => {
      const response = await fetch(`${BASE_URL}/chat?username=TestUser`);
      assertEquals(response.status, 200);

      const html = await response.text();
      assertStringIncludes(html, "TestUser");
      assertStringIncludes(html, "在线用户");
      assertStringIncludes(html, "输入消息");
    });

    await t.step("should redirect to home when no username provided", async () => {
      const response = await fetch(`${BASE_URL}/chat`, { redirect: "manual" });
      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/");
    });

    await t.step("should return 404 for unknown routes", async () => {
      const response = await fetch(`${BASE_URL}/unknown`);
      assertEquals(response.status, 404);
    });

    await t.step("should serve static CSS file", async () => {
      const response = await fetch(`${BASE_URL}/static/css/style.css`);
      assertEquals(response.status, 200);
      assertEquals(response.headers.get("content-type"), "text/css; charset=UTF-8");

      const css = await response.text();
      assertStringIncludes(css, "Easy Chat");
      assertStringIncludes(css, ".chat-container");
    });
  } finally {
    await stopTestServer(server);
  }
});

Deno.test("Integration - WebSocket Chat Flow", async (t) => {
  const server = await startTestServer();

  try {
    await t.step("should handle WebSocket connection and messaging", async () => {
      // Create WebSocket connections for two users
      const ws1 = new WebSocket(`${WS_URL}/ws?username=User1`);
      const ws2 = new WebSocket(`${WS_URL}/ws?username=User2`);

      const messages1: any[] = [];
      const messages2: any[] = [];

      // Set up message handlers
      ws1.onmessage = (event) => {
        messages1.push(JSON.parse(event.data));
      };

      ws2.onmessage = (event) => {
        messages2.push(JSON.parse(event.data));
      };

      // Wait for connections to establish
      await new Promise(resolve => {
        let connected = 0;
        const checkConnection = () => {
          connected++;
          if (connected === 2) resolve(undefined);
        };

        ws1.onopen = checkConnection;
        ws2.onopen = checkConnection;
      });

      // Wait a bit for initial messages
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send a message from User1
      ws1.send(JSON.stringify({
        type: "message",
        content: "Hello from User1!"
      }));

      // Wait for message to be processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send a message from User2
      ws2.send(JSON.stringify({
        type: "message",
        content: "Hi User1, this is User2!"
      }));

      // Wait for message to be processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Close connections
      ws1.close();
      ws2.close();

      // Wait for close events
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify that both users received messages
      const user1Messages = messages1.filter(m => m.type === "message");
      const user2Messages = messages2.filter(m => m.type === "message");

      // Both users should have received both messages
      assertEquals(user1Messages.length >= 2, true);
      assertEquals(user2Messages.length >= 2, true);

      // Check message content
      const user1HelloMsg = user1Messages.find(m => m.content === "Hello from User1!");
      const user2HelloMsg = user2Messages.find(m => m.content === "Hello from User1!");

      assertEquals(user1HelloMsg?.username, "User1");
      assertEquals(user2HelloMsg?.username, "User1");

      const user1ReplyMsg = user1Messages.find(m => m.content === "Hi User1, this is User2!");
      const user2ReplyMsg = user2Messages.find(m => m.content === "Hi User1, this is User2!");

      assertEquals(user1ReplyMsg?.username, "User2");
      assertEquals(user2ReplyMsg?.username, "User2");
    });

    await t.step("should reject duplicate usernames", async () => {
      const ws1 = new WebSocket(`${WS_URL}/ws?username=DuplicateUser`);

      await new Promise(resolve => {
        ws1.onopen = resolve;
      });

      // Try to connect with the same username
      const ws2 = new WebSocket(`${WS_URL}/ws?username=DuplicateUser`);

      await new Promise(resolve => {
        ws2.onclose = (event) => {
          assertEquals(event.code, 1008); // Policy violation
          resolve(undefined);
        };
      });

      ws1.close();
    });

    await t.step("should reject connection without username", async () => {
      const ws = new WebSocket(`${WS_URL}/ws`);

      await new Promise(resolve => {
        ws.onclose = (event) => {
          assertEquals(event.code, 1008); // Policy violation
          resolve(undefined);
        };
      });
    });
  } finally {
    await stopTestServer(server);
  }
});

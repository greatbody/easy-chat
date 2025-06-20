/**
 * Unit tests for chat room functionality
 */

import { assertEquals, assertExists, assertNotEquals } from "@std/assert";
import { InMemoryChatRoom } from "../src/chat-room.ts";
import { User, ChatMessage } from "../src/types.ts";

Deno.test("ChatRoom - User Management", async (t) => {
  await t.step("should add user to chat room", () => {
    const chatRoom = new InMemoryChatRoom();
    const user: User = {
      id: "user1",
      username: "TestUser",
      joinedAt: new Date(),
    };

    chatRoom.addUser(user);
    
    assertEquals(chatRoom.users.size, 1);
    assertEquals(chatRoom.getUserById("user1"), user);
    assertEquals(chatRoom.messages.length, 1);
    assertEquals(chatRoom.messages[0].type, "join");
  });

  await t.step("should remove user from chat room", () => {
    const chatRoom = new InMemoryChatRoom();
    const user: User = {
      id: "user1",
      username: "TestUser",
      joinedAt: new Date(),
    };

    chatRoom.addUser(user);
    chatRoom.removeUser("user1");
    
    assertEquals(chatRoom.users.size, 0);
    assertEquals(chatRoom.getUserById("user1"), undefined);
    assertEquals(chatRoom.messages.length, 2); // join + leave messages
    assertEquals(chatRoom.messages[1].type, "leave");
  });

  await t.step("should check username availability", () => {
    const chatRoom = new InMemoryChatRoom();
    const user: User = {
      id: "user1",
      username: "TestUser",
      joinedAt: new Date(),
    };

    assertEquals(chatRoom.isUsernameAvailable("TestUser"), true);
    
    chatRoom.addUser(user);
    
    assertEquals(chatRoom.isUsernameAvailable("TestUser"), false);
    assertEquals(chatRoom.isUsernameAvailable("AnotherUser"), true);
  });

  await t.step("should get user by username", () => {
    const chatRoom = new InMemoryChatRoom();
    const user: User = {
      id: "user1",
      username: "TestUser",
      joinedAt: new Date(),
    };

    chatRoom.addUser(user);
    
    const foundUser = chatRoom.getUserByUsername("TestUser");
    assertExists(foundUser);
    assertEquals(foundUser.id, "user1");
    assertEquals(foundUser.username, "TestUser");
    
    assertEquals(chatRoom.getUserByUsername("NonExistent"), undefined);
  });
});

Deno.test("ChatRoom - Message Management", async (t) => {
  await t.step("should add message to chat room", () => {
    const chatRoom = new InMemoryChatRoom();
    const message: ChatMessage = {
      id: "msg1",
      username: "TestUser",
      content: "Hello, world!",
      timestamp: new Date(),
      type: "message",
    };

    chatRoom.addMessage(message);
    
    assertEquals(chatRoom.messages.length, 1);
    assertEquals(chatRoom.messages[0], message);
  });

  await t.step("should limit message history", () => {
    const chatRoom = new InMemoryChatRoom();
    
    // Add more than maxMessages (100) messages
    for (let i = 0; i < 105; i++) {
      const message: ChatMessage = {
        id: `msg${i}`,
        username: "TestUser",
        content: `Message ${i}`,
        timestamp: new Date(),
        type: "message",
      };
      chatRoom.addMessage(message);
    }
    
    assertEquals(chatRoom.messages.length, 100);
    assertEquals(chatRoom.messages[0].content, "Message 5"); // First 5 should be removed
    assertEquals(chatRoom.messages[99].content, "Message 104");
  });

  await t.step("should get all messages", () => {
    const chatRoom = new InMemoryChatRoom();
    const message1: ChatMessage = {
      id: "msg1",
      username: "User1",
      content: "Hello",
      timestamp: new Date(),
      type: "message",
    };
    const message2: ChatMessage = {
      id: "msg2",
      username: "User2",
      content: "Hi there",
      timestamp: new Date(),
      type: "message",
    };

    chatRoom.addMessage(message1);
    chatRoom.addMessage(message2);
    
    const messages = chatRoom.getMessages();
    assertEquals(messages.length, 2);
    assertEquals(messages[0], message1);
    assertEquals(messages[1], message2);
  });
});

Deno.test("ChatRoom - User List", async (t) => {
  await t.step("should return list of users without socket", () => {
    const chatRoom = new InMemoryChatRoom();
    const user1: User = {
      id: "user1",
      username: "User1",
      joinedAt: new Date(),
      socket: {} as WebSocket, // Mock socket
    };
    const user2: User = {
      id: "user2",
      username: "User2",
      joinedAt: new Date(),
    };

    chatRoom.addUser(user1);
    chatRoom.addUser(user2);
    
    const users = chatRoom.getUsers();
    assertEquals(users.length, 2);
    
    // Check that socket is not included in returned data
    assertEquals(users[0].socket, undefined);
    assertEquals(users[1].socket, undefined);
    
    assertEquals(users[0].username, "User1");
    assertEquals(users[1].username, "User2");
  });
});

Deno.test("ChatRoom - Stats", async (t) => {
  await t.step("should return correct stats", () => {
    const chatRoom = new InMemoryChatRoom();
    const user: User = {
      id: "user1",
      username: "TestUser",
      joinedAt: new Date(),
    };

    chatRoom.addUser(user);
    
    const message: ChatMessage = {
      id: "msg1",
      username: "TestUser",
      content: "Hello",
      timestamp: new Date(),
      type: "message",
    };
    chatRoom.addMessage(message);
    
    const stats = chatRoom.getStats();
    assertEquals(stats.userCount, 1);
    assertEquals(stats.messageCount, 2); // join message + manual message
    assertEquals(stats.users.length, 1);
    assertEquals(stats.users[0].username, "TestUser");
  });
});

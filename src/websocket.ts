/**
 * WebSocket handler for real-time chat functionality
 */

import { User, ChatMessage } from "./types.ts";
import { chatRoom } from "./chat-room.ts";
import { escapeHtml } from "./template.ts";

export function handleWebSocketConnection(socket: WebSocket, req: Request): void {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  if (!username || username.trim().length === 0) {
    socket.close(1008, "Username is required");
    return;
  }

  const sanitizedUsername = escapeHtml(username.trim());

  // Check if username is already taken
  if (!chatRoom.isUsernameAvailable(sanitizedUsername)) {
    socket.close(1008, "Username is already taken");
    return;
  }

  // Create new user
  const user: User = {
    id: crypto.randomUUID(),
    username: sanitizedUsername,
    joinedAt: new Date(),
    socket: socket
  };

  // Add user to chat room
  chatRoom.addUser(user);

  // Use setTimeout to ensure the WebSocket connection is fully established
  setTimeout(() => {
    // Send recent messages to the new user
    const recentMessages = chatRoom.getMessages().slice(-20); // Last 20 messages
    for (const message of recentMessages) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    }

    // Send current user list to the new user immediately
    if (socket.readyState === WebSocket.OPEN) {
      const userListMessage = {
        type: 'userList',
        users: chatRoom.getUsers()
      };
      socket.send(JSON.stringify(userListMessage));
    }

    // Broadcast updated user list to all users
    chatRoom.broadcastUserList();
  }, 100); // Small delay to ensure connection is ready

  // Handle incoming messages
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleClientMessage(user, data);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  };

  // Handle connection close
  socket.onclose = () => {
    chatRoom.removeUser(user.id);
    chatRoom.broadcastUserList();
  };

  // Handle connection error
  socket.onerror = (error) => {
    console.error(`WebSocket error for user ${user.username}:`, error);
    chatRoom.removeUser(user.id);
    chatRoom.broadcastUserList();
  };
}

function handleClientMessage(user: User, data: { type: string; content?: string }): void {
  switch (data.type) {
    case 'message':
      handleChatMessage(user, data);
      break;
    case 'ping':
      // Respond to ping with pong
      if (user.socket && user.socket.readyState === WebSocket.OPEN) {
        user.socket.send(JSON.stringify({ type: 'pong' }));
      }
      break;
    default:
      console.warn(`Unknown message type: ${data.type}`);
  }
}

function handleChatMessage(user: User, data: { content?: string }): void {
  const content = data.content?.toString().trim();

  if (!content || content.length === 0) {
    return;
  }

  if (content.length > 500) {
    if (user.socket && user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(JSON.stringify({
        type: 'error',
        message: 'Message too long (max 500 characters)'
      }));
    }
    return;
  }

  // Create chat message
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    username: user.username,
    content: escapeHtml(content),
    timestamp: new Date(),
    type: 'message'
  };

  // Add message to chat room
  chatRoom.addMessage(message);

  // Broadcast message to all users
  chatRoom.broadcastMessage(message);

  console.log(`Message from ${user.username}: ${content}`);
}

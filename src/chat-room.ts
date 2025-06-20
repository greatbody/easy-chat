/**
 * Chat room implementation with in-memory user and message management
 */

import { User, ChatMessage, ChatRoom } from "./types.ts";

export class InMemoryChatRoom implements ChatRoom {
  public users: Map<string, User> = new Map();
  public messages: ChatMessage[] = [];
  private maxMessages = 100; // Keep only last 100 messages

  addUser(user: User): void {
    this.users.set(user.id, user);
    
    // Add join message
    const joinMessage: ChatMessage = {
      id: crypto.randomUUID(),
      username: user.username,
      content: `${user.username} 加入了聊天室`,
      timestamp: new Date(),
      type: 'join'
    };
    
    this.addMessage(joinMessage);
    console.log(`User ${user.username} (${user.id}) joined the chat`);
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      
      // Add leave message
      const leaveMessage: ChatMessage = {
        id: crypto.randomUUID(),
        username: user.username,
        content: `${user.username} 离开了聊天室`,
        timestamp: new Date(),
        type: 'leave'
      };
      
      this.addMessage(leaveMessage);
      console.log(`User ${user.username} (${userId}) left the chat`);
    }
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    
    // Keep only the last maxMessages messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getUsers(): User[] {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      username: user.username,
      joinedAt: user.joinedAt,
      // Don't include socket in the returned data
    }));
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserByUsername(username: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  isUsernameAvailable(username: string): boolean {
    return !this.getUserByUsername(username);
  }

  broadcastMessage(message: ChatMessage, excludeUserId?: string): void {
    const messageData = JSON.stringify(message);
    
    for (const user of this.users.values()) {
      if (excludeUserId && user.id === excludeUserId) {
        continue;
      }
      
      if (user.socket && user.socket.readyState === WebSocket.OPEN) {
        try {
          user.socket.send(messageData);
        } catch (error) {
          console.error(`Error sending message to user ${user.username}:`, error);
          // Remove user if socket is broken
          this.removeUser(user.id);
        }
      }
    }
  }

  broadcastUserList(): void {
    const userListMessage = {
      type: 'userList',
      users: this.getUsers()
    };
    
    const messageData = JSON.stringify(userListMessage);
    
    for (const user of this.users.values()) {
      if (user.socket && user.socket.readyState === WebSocket.OPEN) {
        try {
          user.socket.send(messageData);
        } catch (error) {
          console.error(`Error sending user list to user ${user.username}:`, error);
        }
      }
    }
  }

  getStats() {
    return {
      userCount: this.users.size,
      messageCount: this.messages.length,
      users: this.getUsers().map(u => ({ username: u.username, joinedAt: u.joinedAt }))
    };
  }
}

// Global chat room instance
export const chatRoom = new InMemoryChatRoom();

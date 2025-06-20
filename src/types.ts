/**
 * Type definitions for the chat application
 */

export interface User {
  id: string;
  username: string;
  joinedAt: Date;
  socket?: WebSocket;
}

export interface ChatMessage {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'join' | 'leave';
}

export interface ChatRoom {
  users: Map<string, User>;
  messages: ChatMessage[];
  addUser(user: User): void;
  removeUser(userId: string): void;
  addMessage(message: ChatMessage): void;
  getUsers(): User[];
  getMessages(): ChatMessage[];
}

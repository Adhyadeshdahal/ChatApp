export interface User {
  _id?: string;
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  sender: string;
  senderName: string;
  recipient?: string | null;
  recipientName?: string | null;
  content: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface Stats {
  totalMessages: number;
  totalUsers: number;
  onlineCount: number;
}

export type SystemEvent = { type: "join" | "leave"; username: string };

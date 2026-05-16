export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  sender: string;
  senderName: string;
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

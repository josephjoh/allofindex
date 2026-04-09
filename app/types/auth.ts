export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: UserRole[];
  createdAt: string;
}

export type UserRole = "admin" | "user" | "viewer";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

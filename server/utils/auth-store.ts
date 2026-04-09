import type { AuthUser, LoginResponse } from "../../shared/types/index";

// ── 인메모리 인증 저장소 ───────────────────────────────────────
// TODO: DB 연동 후 users 테이블 조회 + bcrypt 비교로 교체
// SELECT id, email, roles, password_hash FROM users
// WHERE email = ? AND deleted_at IS NULL

interface MockUser {
  id: string;
  email: string;
  passwordPlain: string; // TODO: 실제 구현 시 bcrypt hash 비교
  roles: string[];
}

const MOCK_USERS: MockUser[] = [
  {
    id: "user-001",
    email: "admin@example.com",
    passwordPlain: "password123",
    roles: ["admin", "user"],
  },
  {
    id: "user-002",
    email: "user@example.com",
    passwordPlain: "password123",
    roles: ["user"],
  },
];

// key: accessToken, value: userId
const tokenStore = new Map<string, string>();

function generateToken(userId: string): string {
  // TODO: 실제 구현 시 JWT 서명으로 교체
  const token = `mock-token-${userId}-${Date.now()}`;
  tokenStore.set(token, userId);
  return token;
}

export function findUserByEmail(email: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.email === email);
}

export function verifyPassword(user: MockUser, password: string): boolean {
  // TODO: 실제 구현 시 bcrypt.compare(password, user.password_hash)로 교체
  return user.passwordPlain === password;
}

export function login(email: string, password: string): LoginResponse {
  const user = findUserByEmail(email);

  if (!user || !verifyPassword(user, password)) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const accessToken = generateToken(user.id);

  return {
    user: { id: user.id, email: user.email, roles: user.roles },
    tokens: { accessToken, expiresIn: 86400 },
  };
}

export function logout(token: string): void {
  tokenStore.delete(token);
}

export function getUserByToken(token: string): AuthUser | null {
  const userId = tokenStore.get(token);
  if (!userId) return null;

  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) return null;

  return { id: user.id, email: user.email, roles: user.roles };
}

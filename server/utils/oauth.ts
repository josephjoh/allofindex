// CSRF 방어용 state 관리 유틸
// key: state 값, value: 만료 시각 (ms)
const stateStore = new Map<string, number>();
const STATE_TTL_MS = 10 * 60 * 1000; // 10분

export function generateState(): string {
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  stateStore.set(state, Date.now() + STATE_TTL_MS);
  return state;
}

export function validateState(state: string): boolean {
  const expiresAt = stateStore.get(state);
  if (!expiresAt) return false;
  stateStore.delete(state); // 1회용
  return Date.now() < expiresAt;
}

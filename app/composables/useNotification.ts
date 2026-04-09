import type { Ref } from "vue";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // ms, 0 = 지속 표시
}

// 모듈 레벨 싱글턴 상태 — 모든 composable 호출 간 공유
const notifications: Ref<Notification[]> = ref([]);

export const useNotification = () => {
  const notify = (options: Omit<Notification, "id">) => {
    const id = crypto.randomUUID();
    const notification: Notification = {
      duration: 4000,
      ...options,
      id,
    };

    notifications.value.push(notification);

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => dismiss(id), notification.duration);
    }
  };

  const dismiss = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const clear = () => {
    notifications.value = [];
  };

  // 편의 메서드
  const success = (message: string, duration?: number) =>
    notify({ type: "success", message, duration });

  const error = (message: string, duration?: number) =>
    notify({ type: "error", message, duration });

  const warning = (message: string, duration?: number) =>
    notify({ type: "warning", message, duration });

  const info = (message: string, duration?: number) =>
    notify({ type: "info", message, duration });

  return {
    notifications: readonly(notifications),
    notify,
    dismiss,
    clear,
    success,
    error,
    warning,
    info,
  };
};

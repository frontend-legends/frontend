import { defineStore } from "pinia";
import { ref } from "vue";

export type NotificationType = "positive" | "negative";

export interface INotification {
  id: number;
  type: NotificationType;
  message: string;
  title?: string;
  ttl: number;
}

export interface INotificationInput {
  type?: NotificationType;
  message: string;
  title?: string;
  ttl?: number;
}

let _id = 0;

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<INotification[]>([]);

  function add(opts: INotificationInput): number {
    const id = ++_id;

    notifications.value.push({
      id,
      type: opts.type ?? "positive",
      message: opts.message,
      title: opts.title,
      ttl: opts.ttl ?? 3500,
    });

    return id;
  }

  function remove(id: number): void {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) notifications.value.splice(index, 1);
  }

  return {
    notifications,
    add,
    remove,
  };
});

type UseNullStore = ReturnType<typeof defineStore>;
type NullStore = ReturnType<UseNullStore>;
type NotificationStore = ReturnType<typeof useNotificationStore>;
export type NotificationStoreSGA = Omit<NotificationStore, keyof NullStore>;

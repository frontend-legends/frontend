import { Notify, type QNotifyCreateOptions } from "quasar";
import { defineStore } from "pinia";
import { ref } from "vue";

type INotification = Pick<QNotifyCreateOptions, "type" | "message">;

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<INotification[]>([]);

  function add(opts: INotification) {
    Notify.create({
      type: opts.type,
      message: opts.message,
    });
  }

  return {
    notifications,
    add,
  };
});

type UseNullStore = ReturnType<typeof defineStore>;
type NullStore = ReturnType<UseNullStore>;
type NotificationStore = ReturnType<typeof useNotificationStore>;
export type NotificationStoreSGA = Omit<NotificationStore, keyof NullStore>;

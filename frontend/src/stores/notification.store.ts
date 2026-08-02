import { create } from "zustand"

export interface NotificationItem {
  id: string
  text: string
  time: string
  read: boolean
  type: "info" | "success" | "warning"
}

interface NotificationState {
  notifications: NotificationItem[]
  addNotification: (notification: Omit<NotificationItem, "id" | "time">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  setNotifications: (notifications: NotificationItem[]) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const newItem: NotificationItem = {
      ...notification,
      id: String(Date.now()),
      time: "Just now",
    }
    set((state) => ({
      notifications: [newItem, ...state.notifications],
    }))
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
  setNotifications: (notifications) => set({ notifications }),
}))

// services/notificationService.ts
import api from "../services/api";

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export const notificationService = {
  // Obtener todas las notificaciones del usuario
  async getNotifications() {
    const response = await api.get("/notifications");
    return response.data;
  },

  // Obtener solo no leídas
  async getUnreadNotifications() {
    const response = await api.get("/notifications/unread");
    return response.data;
  },

  // Marcar como leída
  async markAsRead(notificationId: number) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marcar todas como leídas
  async markAllAsRead() {
    const response = await api.put("/notifications/mark-all-read");
    return response.data;
  },

  // Eliminar notificación
  async deleteNotification(notificationId: number) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Obtener contador de no leídas
  async getUnreadCount() {
    const response = await api.get("/notifications/unread-count");
    return response.data; // { count: number }
  }
};
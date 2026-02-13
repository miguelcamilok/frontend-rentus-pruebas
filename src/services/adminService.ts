// services/adminService.ts
import api from "./api";

export interface AdminStats {
  users: {
    total: number;
    active: number;
    pending: number;
  };
  properties: {
    total: number;
    active: number;
    pending: number;
  };
  contracts: {
    total: number;
    active: number;
    pending: number;
    expired: number;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    revenue: number;
  };
  requests: {
    total: number;
    pending: number;
  };
  maintenances: {
    pending: number;
    in_progress: number;
  };
}

export interface ActivityItem {
  id: number;
  icon: string;
  iconBg: string;
  text: string;
  time: string;
  type: string;
}

export const adminService = {
  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await api.get<AdminStats>("/admin/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo estadísticas del admin:", error);
      throw error;
    }
  },

  /**
   * Obtener actividad reciente (próximamente desde backend)
   */
  async getRecentActivity(): Promise<ActivityItem[]> {
    // TODO: Implementar endpoint en backend
    // Por ahora retorna array vacío, el componente usará datos mock si está vacío
    try {
      // const response = await api.get("/admin/dashboard/activity");
      // return response.data;
      return [];
    } catch (error) {
      console.error("Error obteniendo actividad reciente:", error);
      return [];
    }
  },
};
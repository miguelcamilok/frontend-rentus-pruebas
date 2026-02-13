// services/propertyManagementService.ts
import api from "./api";
import { eventBus } from "../events/eventBus";
import type {
  Property,
  PropertyFilters,
  PaginatedPropertiesResponse,
  PropertyStats,
  PropertyApprovalStatus,
  PropertyAvailabilityStatus,
  PropertyVisibility,
} from "../types/property";

export const propertyManagementService = {
  /**
   * Obtener lista de propiedades con filtros y paginación
   */
  async getProperties(filters: PropertyFilters = {}): Promise<PaginatedPropertiesResponse> {
    try {
      const params: Record<string, string> = {};

      // Búsqueda
      if (filters.search && filters.search.trim() !== '') {
        params.search = filters.search.trim();
      }

      // Filtro por estado de disponibilidad
      if (filters.status) {
        params.status = filters.status;
      }

      // Filtro por estado de aprobación
      if (filters.approval_status) {
        params.approval_status = filters.approval_status;
      }

      // Filtro por visibilidad
      if (filters.visibility) {
        params.visibility = filters.visibility;
      }

      // Paginación
      if (filters.page) {
        params.page = filters.page.toString();
      }

      if (filters.perPage) {
        params.per_page = filters.perPage.toString();
      }

      // Ordenamiento
      if (filters.sortBy) {
        params.sort_by = filters.sortBy;
        params.sort_order = filters.sortOrder || 'asc';
      }

      console.log('📋 Parámetros enviados al backend:', params);

      const response = await api.get('/properties', { params });

      return response.data;
    } catch (error) {
      console.error("Error obteniendo propiedades:", error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de propiedades
   */
  async getPropertyStats(): Promise<PropertyStats> {
    try {
      const response = await api.get('/admin/properties/stats');

      console.log('📊 Respuesta de stats del admin:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data as PropertyStats;
      } else if (response.data) {
        return response.data as PropertyStats;
      }

      throw new Error('Estructura de stats inesperada');

    } catch (error) {
      console.error("❌ Error obteniendo estadísticas de propiedades:", error);

      // Fallback: intentar obtener todas las propiedades y calcular manualmente
      try {
        const propertiesResponse = await this.getProperties({ perPage: 1000 });
        const properties = propertiesResponse.data;

        const stats: PropertyStats = {
          total: properties.length,
          available: 0,
          rented: 0,
          maintenance: 0,
          pending_approval: 0,
          approved: 0,
          rejected: 0,
          published: 0,
          hidden: 0,
          total_views: 0,
          average_price: 0,
        };

        let totalPrice = 0;

        properties.forEach(property => {
          if (property.status === 'available') stats.available++;
          if (property.status === 'rented') stats.rented++;
          if (property.status === 'maintenance') stats.maintenance++;

          if (property.approval_status === 'pending') stats.pending_approval++;
          if (property.approval_status === 'approved') stats.approved++;
          if (property.approval_status === 'rejected') stats.rejected++;

          if (property.visibility === 'published') stats.published++;
          if (property.visibility === 'hidden') stats.hidden++;

          stats.total_views += property.views || 0;
          totalPrice += property.monthly_price || 0;
        });

        if (properties.length > 0) {
          stats.average_price = totalPrice / properties.length;
        }

        return stats;
      } catch (fallbackError) {
        console.error("❌ Error en fallback de stats:", fallbackError);

        return {
          total: 0,
          available: 0,
          rented: 0,
          maintenance: 0,
          pending_approval: 0,
          approved: 0,
          rejected: 0,
          published: 0,
          hidden: 0,
          total_views: 0,
          average_price: 0,
        };
      }
    }
  },

  /**
   * Obtener una propiedad específica
   */
  async getProperty(id: number): Promise<Property> {
    try {
      const response = await api.get(`/properties/${id}`);
      
      console.log('📦 Respuesta completa del backend:', response.data);
      
      if (response.data.success && response.data.data) {
        console.log('✅ Propiedad extraída correctamente:', response.data.data);
        return response.data.data;
      }
      
      console.log('⚠️ Respuesta sin wrapper, retornando directamente');
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error obteniendo propiedad ${id}:`, error);
      console.error('📋 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  /**
   * Crear una nueva propiedad
   */
  async createProperty(propertyData: FormData | Partial<Property>): Promise<Property> {
    try {
      const config = propertyData instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined;

      const response = await api.post<{ success: boolean; property: Property }>(
        '/properties',
        propertyData,
        config
      );

      console.log('✅ Propiedad creada:', response.data);

      if (!response.data.success) {
        throw new Error('Error al crear propiedad');
      }

      eventBus.emit('property:created', response.data.property);

      return response.data.property;
    } catch (error: any) {
      console.error("❌ Error creando propiedad:", error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Actualizar una propiedad existente
   */
  async updateProperty(id: number, propertyData: FormData | Partial<Property>): Promise<Property> {
    try {
      let response;

      // Si es FormData (incluye archivos), usar POST con _method=PUT
      if (propertyData instanceof FormData) {
        // ⚠️ IMPORTANTE: Laravel necesita _method para simular PUT
        propertyData.append('_method', 'PUT');

        response = await api.post<{ success: boolean; property: Property }>(
          `/properties/${id}`,
          propertyData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Si son datos JSON, usar PUT normal
        response = await api.put<{ success: boolean; property: Property }>(
          `/properties/${id}`,
          propertyData
        );
      }

      console.log('✅ Propiedad actualizada:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.property as any || 'Error al actualizar propiedad');
      }

      eventBus.emit('property:updated', response.data.property);

      return response.data.property;
    } catch (error: any) {
      console.error(`❌ Error actualizando propiedad ${id}:`, error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Aprobar propiedad - Método de conveniencia
   */
  async approveProperty(id: number): Promise<Property> {
    return this.updateApprovalStatus(id, 'approved');
  },

  /**
   * Rechazar propiedad - Método de conveniencia
   */
  async rejectProperty(id: number): Promise<Property> {
    return this.updateApprovalStatus(id, 'rejected');
  },

  /**
   * Cambiar el estado de aprobación de una propiedad
   */
  async updateApprovalStatus(
    id: number,
    approvalStatus: PropertyApprovalStatus
  ): Promise<Property> {
    try {
      console.log(`📝 Actualizando aprobación de propiedad ${id} a ${approvalStatus}`);

      const response = await api.put<{ success: boolean; property: Property }>(
        `/admin/properties/${id}/approval`,
        { approval_status: approvalStatus }
      );

      console.log('✅ Aprobación actualizada:', response.data);

      if (!response.data.success) {
        throw new Error('Error al actualizar estado de aprobación');
      }

      eventBus.emit('property:approval:updated', { id, approvalStatus });

      return response.data.property;
    } catch (error: any) {
      console.error(`❌ Error cambiando estado de aprobación de propiedad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar la visibilidad de una propiedad
   */
  async updateVisibility(id: number, visibility: PropertyVisibility): Promise<Property> {
    try {
      console.log(`👁️ Actualizando visibilidad de propiedad ${id} a ${visibility}`);

      const response = await api.put<{ success: boolean; property: Property }>(
        `/admin/properties/${id}/visibility`,
        { visibility }
      );

      console.log('✅ Visibilidad actualizada:', response.data);

      if (!response.data.success) {
        throw new Error('Error al actualizar visibilidad');
      }

      eventBus.emit('property:visibility:updated', { id, visibility });

      return response.data.property;
    } catch (error: any) {
      console.error(`❌ Error cambiando visibilidad de propiedad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar el estado de disponibilidad de una propiedad
   */
  async updateAvailabilityStatus(
    id: number,
    status: PropertyAvailabilityStatus
  ): Promise<Property> {
    try {
      // Usar el endpoint regular, no de admin
      const response = await api.put<{ success: boolean; property: Property }>(
        `/properties/${id}`,
        { status }
      );

      if (!response.data.success) {
        throw new Error('Error al actualizar estado de disponibilidad');
      }

      eventBus.emit('property:status:updated', { id, status });

      return response.data.property;
    } catch (error) {
      console.error(`❌ Error cambiando estado de disponibilidad de propiedad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una propiedad
   */
  async deleteProperty(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando propiedad ${id}`);

      await api.delete(`/properties/${id}`);

      console.log('✅ Propiedad eliminada correctamente');

      eventBus.emit('property:deleted', id);
    } catch (error: any) {
      console.error(`❌ Error eliminando propiedad ${id}:`, error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Subir imagen principal de la propiedad
   */
  async uploadPropertyImage(id: number, imageFile: File): Promise<Property> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('_method', 'PUT');

      const response = await api.post<{ success: boolean; property: Property }>(
        `/properties/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.success) {
        throw new Error('Error al subir imagen');
      }

      eventBus.emit('property:image:updated', { id, image_url: response.data.property.image_url });

      return response.data.property;
    } catch (error) {
      console.error(`❌ Error subiendo imagen de propiedad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Formatear tiempo relativo
   */
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Hace unos segundos";
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 2592000) return `Hace ${Math.floor(seconds / 86400)} días`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  },

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  },

  /**
   * Obtener configuración de color para el estado de disponibilidad
   */
  getStatusConfig(status: PropertyAvailabilityStatus): {
    color: string;
    bg: string;
    label: string;
    icon: string;
  } {
    const configs = {
      available: {
        color: '#059669',
        bg: '#f0fdf4',
        label: 'Disponible',
        icon: 'check-circle',
      },
      rented: {
        color: '#dc2626',
        bg: '#fef2f2',
        label: 'Rentada',
        icon: 'home',
      },
      maintenance: {
        color: '#f59e0b',
        bg: '#fffbeb',
        label: 'Mantenimiento',
        icon: 'wrench',
      },
    };

    return configs[status] || configs.available;
  },

  /**
   * Obtener configuración de color para el estado de aprobación
   */
  getApprovalConfig(status?: PropertyApprovalStatus): {
    color: string;
    bg: string;
    label: string;
    icon: string;
  } {
    const configs = {
      pending: {
        color: '#f59e0b',
        bg: '#fffbeb',
        label: 'Pendiente',
        icon: 'clock',
      },
      approved: {
        color: '#059669',
        bg: '#f0fdf4',
        label: 'Aprobada',
        icon: 'check-circle',
      },
      rejected: {
        color: '#dc2626',
        bg: '#fef2f2',
        label: 'Rechazada',
        icon: 'times-circle',
      },
    };

    return configs[status || 'pending'] || configs.pending;
  },

  /**
   * Obtener configuración de color para la visibilidad
   */
  getVisibilityConfig(visibility?: PropertyVisibility): {
    color: string;
    bg: string;
    label: string;
    icon: string;
  } {
    const configs = {
      published: {
        color: '#2563eb',
        bg: '#eff6ff',
        label: 'Publicada',
        icon: 'eye',
      },
      hidden: {
        color: '#6b7280',
        bg: '#f9fafb',
        label: 'Oculta',
        icon: 'lock',
      },
    };

    return configs[visibility || 'published'] || configs.published;
  },
};

export type { Property, PropertyFilters, PaginatedPropertiesResponse, PropertyStats };
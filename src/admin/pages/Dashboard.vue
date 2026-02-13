<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="dashboard-title">
            👋 Bienvenido de nuevo, <span class="highlight">{{ userName }}</span>
          </h1>
          <p class="dashboard-subtitle">
            Aquí está un resumen de lo que está pasando en tu plataforma hoy.
          </p>
        </div>
        <div class="header-actions">
          <button class="action-btn secondary" @click="exportReport">
            <span class="btn-icon">📊</span>
            <span>Exportar Reporte</span>
          </button>
          <button class="action-btn primary" @click="goToNewProperty">
            <span class="btn-icon">➕</span>
            <span>Nueva Propiedad</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando estadísticas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="error-container">
      <p>❌ Error al cargar datos: {{ loadError }}</p>
      <button @click="loadDashboardData" class="retry-btn">Reintentar</button>
    </div>

    <!-- Dashboard Content -->
    <template v-else>
      <!-- Stats Grid -->
      <div class="stats-section">
        <h2 class="section-title">Métricas Principales</h2>
        <div class="stats-grid">
          <StatCard v-for="stat in mainStats" :key="stat.label" v-bind="stat" />
        </div>
      </div>

      <!-- Secondary Stats -->
      <div class="secondary-stats">
        <div class="stats-row">
          <StatCard v-for="stat in secondaryStats" :key="stat.label" v-bind="stat" />
        </div>
      </div>

      <!-- Charts and Activity -->
      <div class="content-grid">
        <!-- Revenue Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Ingresos Mensuales</h3>
              <p class="chart-subtitle">Total acumulado</p>
            </div>
            <select class="chart-filter">
              <option>Últimos 6 meses</option>
              <option>Último año</option>
              <option>Todo el tiempo</option>
            </select>
          </div>
          <div class="chart-placeholder">
            <div class="placeholder-content">
              <span class="placeholder-icon">💰</span>
              <p>Ingresos Totales</p>
              <h2 class="revenue-amount">{{ formatCurrency(totalRevenue) }}</h2>
              <small>{{ stats?.payments.paid || 0 }} pagos completados</small>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-card">
          <div class="activity-header">
            <h3 class="activity-title">Actividad Reciente</h3>
            <div class="activity-actions">
              <span class="last-update" v-if="lastActivityUpdate">
                Actualizado: {{ formatTimeAgo(lastActivityUpdate.toISOString()) }}
              </span>
              <button class="refresh-btn" @click="loadActivities" :disabled="loadingActivity">
                <span :class="{ 'spinning': loadingActivity }">🔄</span>
              </button>
            </div>
          </div>
          
          <div v-if="loadingActivity && activities.length === 0" class="activity-loading">
            <div class="mini-spinner"></div>
            <p>Cargando actividades...</p>
          </div>

          <div v-else-if="activityError" class="activity-error">
            <p>❌ {{ activityError }}</p>
            <button @click="loadActivities" class="retry-btn small">Reintentar</button>
          </div>

          <div v-else-if="activities.length > 0" class="activity-list">
            <div v-for="activity in activities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :style="{ background: getActivityColor(activity.type) }">
                {{ getActivityIcon(activity.type) }}
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ getActivityText(activity) }}</p>
                <span class="activity-time">{{ formatTimeAgo(activity.created_at) }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="activity-empty">
            <p>📭 No hay actividad reciente</p>
            <p class="activity-empty-sub">Las nuevas actividades aparecerán aquí automáticamente</p>
          </div>
        </div>
      </div>

      <!-- Properties Overview -->
      <div class="properties-overview">
        <div class="overview-header">
          <div>
            <h2 class="overview-title">Propiedades por Estado</h2>
            <p class="overview-subtitle">Distribución actual del inventario</p>
          </div>
          <button class="overview-btn" @click="goToProperties">
            Ver todas las propiedades →
          </button>
        </div>
        <div class="properties-grid">
          <div v-for="property in propertiesStatus" :key="property.status" class="property-status-card"
            :style="{ borderColor: property.color }">
            <div class="status-header">
              <span class="status-dot" :style="{ background: property.color }"></span>
              <h4 class="status-name">{{ property.status }}</h4>
            </div>
            <div class="status-count">{{ property.count }}</div>
            <div class="status-footer">
              <span class="status-percentage" :style="{ color: property.color }">
                {{ property.percentage }}%
              </span>
              <span class="status-label">del total</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2 class="section-title">Acciones Rápidas</h2>
        <div class="actions-grid">
          <a v-for="action in quickActions" :key="action.label" :href="action.link" class="quick-action-card">
            <div class="action-icon" :style="{ background: action.iconBg }">
              {{ action.icon }}
            </div>
            <div class="action-content">
              <h4 class="action-title">{{ action.label }}</h4>
              <p class="action-description">{{ action.description }}</p>
            </div>
            <span class="action-arrow">→</span>
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import StatCard from '../components/StatCard.vue';
import { useAdminAuth } from '../composables/useAdminAuth';
import { adminService, type AdminStats } from '../../services/adminService';
import { eventBus, EVENTS } from '../../events/eventBus';
import { useAlerts } from '../../composables/useAlerts';
import api from '../../services/api';

const router = useRouter();
const { user } = useAdminAuth();
const { error: showError } = useAlerts();

// Estado
const stats = ref<AdminStats | null>(null);
const isLoading = ref(true);
const loadError = ref<string | null>(null);

// Actividad reciente
const activities = ref<any[]>([]);
const loadingActivity = ref(false);
const activityError = ref('');
const lastActivityUpdate = ref<Date | null>(null);
let activityInterval: number | null = null;

// Nombre del usuario
const userName = computed(() => user.value?.name || 'Admin');

// Total revenue
const totalRevenue = computed(() => stats.value?.payments.revenue || 0);

// ==================== ESTADÍSTICAS PRINCIPALES ====================
const mainStats = computed(() => {
  if (!stats.value) return [];

  const usersChange = stats.value.users.active > 0
    ? ((stats.value.users.active / stats.value.users.total) * 100) - 100
    : 0;

  const propertiesChange = stats.value.properties.active > 0
    ? ((stats.value.properties.active / stats.value.properties.total) * 100) - 100
    : 0;

  return [
    {
      label: 'Total Usuarios',
      value: stats.value.users.total,
      icon: ['fas', 'users'] satisfies [string, string],
      iconBg: 'linear-gradient(135deg, #3b86f7 0%, #1e40af 100%)',
      change: usersChange,
      subtitle: `${stats.value.users.active} activos`,
      variant: 'primary' as const,
    },
    {
      label: 'Propiedades Activas',
      value: stats.value.properties.active,
      icon: ['fas', 'home'] satisfies [string, string],
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      change: propertiesChange,
      subtitle: `${stats.value.properties.total} totales`,
      variant: 'success' as const,
    },
    {
      label: 'Contratos Activos',
      value: stats.value.contracts.active,
      icon: ['fas', 'file-alt'] satisfies [string, string],
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      change: stats.value.contracts.pending > 0 ? -3.1 : 0,
      subtitle: `${stats.value.contracts.pending} pendientes`,
      variant: 'warning' as const,
    },
    {
      label: 'Ingresos del Mes',
      value: formatCurrency(stats.value.payments.revenue),
      icon: ['fas', 'dollar-sign'] satisfies [string, string],
      iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      change: 15.7,
      subtitle: `${stats.value.payments.paid} pagos recibidos`,
      variant: 'info' as const,
    },
  ];
});

// ==================== ESTADÍSTICAS SECUNDARIAS ====================
const secondaryStats = computed(() => {
  if (!stats.value) return [];

  const requestsProgress = stats.value.requests.total > 0
    ? (stats.value.requests.pending / stats.value.requests.total) * 100
    : 0;

  const maintenanceProgress = stats.value.maintenances.pending > 0
    ? ((stats.value.maintenances.in_progress + stats.value.maintenances.pending) /
      (stats.value.maintenances.in_progress + stats.value.maintenances.pending)) * 100
    : 0;

  return [
    {
      label: 'Solicitudes de Arriendo',
      value: stats.value.requests.pending,
      icon: ['fas', 'clipboard-list'] satisfies [string, string],
      iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      progress: requestsProgress,
      subtitle: `${stats.value.requests.total} totales`,
      variant: 'info' as const,
    },
    {
      label: 'Contratos Pendientes',
      value: stats.value.contracts.pending,
      icon: ['fas', 'ticket'] satisfies [string, string],
      iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      progress: stats.value.contracts.total > 0
        ? (stats.value.contracts.pending / stats.value.contracts.total) * 100
        : 0,
      subtitle: `${stats.value.contracts.total} totales`,
      variant: 'danger' as const,
    },
    {
      label: 'Mantenimientos',
      value: stats.value.maintenances.pending + stats.value.maintenances.in_progress,
      icon: ['fas', 'wrench'] satisfies [string, string],
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      progress: maintenanceProgress,
      subtitle: `${stats.value.maintenances.in_progress} en progreso`,
      variant: 'warning' as const,
    },
  ];
});

// ==================== ACTIVIDAD RECIENTE ====================
const loadActivities = async () => {
  try {
    loadingActivity.value = true;
    activityError.value = '';
    
    console.log('🔄 Cargando actividades recientes...');
    
    const response = await api.get('/dashboard/recent-activity', {
      params: { limit: 10 }
    });
    
    console.log('📥 Respuesta recibida:', response.data);
    
    // Verificar la respuesta
    if (response.data && response.data.success !== false) {
      // El backend ahora devuelve data dentro de response.data
      activities.value = response.data.data || [];
      lastActivityUpdate.value = new Date();
      
      console.log('✅ Actividades cargadas:', {
        total: activities.value.length,
        actividades: activities.value
      });
      
      // Debug: mostrar actividades en consola
      activities.value.forEach((activity, index) => {
        console.log(`🎯 Actividad ${index + 1}:`, {
          type: activity.type,
          data: activity.data,
          created_at: activity.created_at
        });
      });
      
      // Mostrar debug info si viene del backend
      if (response.data.debug) {
        console.log('🐛 Debug backend:', response.data.debug);
      }
    } else {
      throw new Error(response.data?.message || 'Error en la respuesta del servidor');
    }
  } catch (err: any) {
    console.error('❌ Error cargando actividades:', err);
    activityError.value = err.response?.data?.message || err.message || 'Error al cargar actividades';
    activities.value = []; // Limpiar en caso de error
  } finally {
    loadingActivity.value = false;
  }
};

const getActivityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    user_registered: '👤',
    user_updated: '✏️',
    user_deleted: '🗑️',
    user_status_changed: '🔄',
    user_role_changed: '👑',
    property_created: '🏠',
    property_updated: '✏️',
    property_deleted: '🗑️',
    property_status_changed: '🔄',
    contract_signed: '📝',
    contract_updated: '✏️',
    contract_deleted: '🗑️',
    payment_received: '💰',
    payment_updated: '✏️',
    maintenance_requested: '🔧',
    maintenance_updated: '✏️',
    rental_request: '📋',
    rental_request_updated: '✏️',
  };
  return icons[type] || '📌';
};

const getActivityColor = (type: string): string => {
  const colors: Record<string, string> = {
    user_registered: 'linear-gradient(135deg, #3b86f7 0%, #1e40af 100%)',
    user_updated: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    user_deleted: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    user_status_changed: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    user_role_changed: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    property_created: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    property_updated: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    property_deleted: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    property_status_changed: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    contract_signed: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    contract_updated: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    contract_deleted: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    payment_received: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    payment_updated: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    maintenance_requested: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    maintenance_updated: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    rental_request: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    rental_request_updated: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  };
  return colors[type] || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
};

const getActivityText = (activity: any): string => {
  const texts: Record<string, (data: any) => string> = {
    // Usuarios
    user_registered: (data) => `Nuevo usuario registrado: ${data.user_name} ${data.created_by ? `(por ${data.created_by})` : ''}`,
    user_updated: (data) => data.description || `Usuario actualizado: ${data.user_name}`,
    user_deleted: (data) => `Usuario eliminado ${data.deleted_by ? `por ${data.deleted_by}` : ''}: ${data.user_name}`,
    user_status_changed: (data) => `Usuario ${data.user_name} cambió estado de '${data.old_status}' a '${data.new_status}' ${data.changed_by ? `(por ${data.changed_by})` : ''}`,
    user_role_changed: (data) => `Usuario ${data.user_name} cambió rol de '${data.old_role}' a '${data.new_role}' ${data.changed_by ? `(por ${data.changed_by})` : ''}`,
    
    // Propiedades
    property_created: (data) => `Nueva propiedad creada ${data.created_by ? `por ${data.created_by}` : ''}: "${data.property_title}"`,
    property_updated: (data) => data.description || `Propiedad actualizada: "${data.property_title}"`,
    property_deleted: (data) => `Propiedad eliminada ${data.deleted_by ? `por ${data.deleted_by}` : ''}: "${data.property_title}"`,
    property_status_changed: (data) => `Propiedad "${data.property_title}" cambió estado de '${data.old_status}' a '${data.new_status}'`,
    
    // Contratos
    contract_signed: (data) => `Contrato #${data.contract_id} firmado para "${data.property_title}"`,
    contract_updated: (data) => `Contrato #${data.contract_id} actualizado`,
    contract_deleted: (data) => `Contrato #${data.contract_id} eliminado`,
    
    // Pagos
    payment_received: (data) => `Pago de $${data.amount} recibido`,
    payment_updated: (data) => `Pago #${data.payment_id} actualizado`,
    
    // Mantenimientos
    maintenance_requested: (data) => `Mantenimiento solicitado para "${data.property_title}"`,
    maintenance_updated: (data) => `Mantenimiento #${data.maintenance_id} actualizado`,
    
    // Solicitudes de arriendo
    rental_request: (data) => `Solicitud de arriendo de ${data.requested_by} para "${data.property_title}"`,
    rental_request_updated: (data) => `Solicitud de arriendo #${data.request_id} actualizada`,
  };
  
  const textFn = texts[activity.type];
  return textFn ? textFn(activity.data) : activity.data?.description || 'Actividad desconocida';
};

const formatTimeAgo = (dateString: string): string => {
  try {
    if (!dateString) return "Hace un momento";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recientemente";
    
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
  } catch (error) {
    return "Recientemente";
  }
};

const startActivityPolling = () => {
  // Refrescar cada 30 segundos
  if (!activityInterval) {
    activityInterval = window.setInterval(() => {
      console.log('🔄 Polling: Actualizando actividades...');
      loadActivities();
    }, 30000); // 30 segundos
  }
};

const stopActivityPolling = () => {
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
};

// ==================== ESTADO DE PROPIEDADES ====================
const propertiesStatus = computed(() => {
  if (!stats.value) return [];

  const total = stats.value.properties.total || 1;

  return [
    {
      status: 'Disponibles',
      count: stats.value.properties.active,
      percentage: Math.round((stats.value.properties.active / total) * 100),
      color: '#10b981',
    },
    {
      status: 'Pendientes',
      count: stats.value.properties.pending,
      percentage: Math.round((stats.value.properties.pending / total) * 100),
      color: '#f59e0b',
    },
    {
      status: 'Inactivas',
      count: total - stats.value.properties.active - stats.value.properties.pending,
      percentage: Math.round(((total - stats.value.properties.active - stats.value.properties.pending) / total) * 100),
      color: '#6b7280',
    },
  ];
});

// ==================== ACCIONES RÁPIDAS ====================
const quickActions = ref([
  {
    icon: '➕',
    iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    label: 'Agregar Propiedad',
    description: 'Publicar una nueva propiedad en la plataforma',
    link: '/admin/properties/new',
  },
  {
    icon: '👥',
    iconBg: 'linear-gradient(135deg, #3b86f7 0%, #1e40af 100%)',
    label: 'Gestionar Usuarios',
    description: 'Ver y administrar todos los usuarios',
    link: '/admin/users',
  },
  {
    icon: '📊',
    iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    label: 'Ver Reportes',
    description: 'Generar reportes y análisis detallados',
    link: '/admin/reports',
  },
  {
    icon: '⚙️',
    iconBg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    label: 'Configuración',
    description: 'Ajustes generales del sistema',
    link: '/admin/settings',
  },
]);

// ==================== MÉTODOS ====================

const loadDashboardData = async () => {
  isLoading.value = true;
  loadError.value = null;

  try {
    console.log('🔄 Cargando datos del dashboard...');

    // Cargar en paralelo
    const [statsData] = await Promise.all([
      adminService.getDashboardStats(),
      loadActivities(), // Cargar actividades también
    ]);

    stats.value = statsData;
    console.log('✅ Datos del dashboard cargados:', statsData);

  } catch (error: any) {
    console.error('❌ Error cargando dashboard:', error);
    loadError.value = error.response?.data?.message || 'Error al cargar datos';
    showError('Error al cargar datos del dashboard');
  } finally {
    isLoading.value = false;
  }
};

const refreshStats = async () => {
  try {
    const newStats = await adminService.getDashboardStats();
    stats.value = newStats;
    console.log('✅ Estadísticas actualizadas');
  } catch (error) {
    console.error('❌ Error actualizando estadísticas:', error);
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const goToNewProperty = () => {
  router.push('/admin/properties/new');
};

const goToProperties = () => {
  router.push('/admin/properties');
};

const exportReport = () => {
  console.log('📊 Exportando reporte...');
};

// ==================== LIFECYCLE ====================

onMounted(async () => {
  await loadDashboardData();
  startActivityPolling();

  // Escuchar eventos (si los tienes configurados)
  eventBus.on(EVENTS.NOTIFICATION_RECEIVED, () => {
    console.log('📢 Evento recibido, actualizando...');
    refreshStats();
    loadActivities();
  });

  console.log('✅ Dashboard montado y polling iniciado');
});

onUnmounted(() => {
  stopActivityPolling();
  eventBus.off(EVENTS.NOTIFICATION_RECEIVED, refreshStats);
  console.log('🧹 Dashboard desmontado, polling detenido');
});
</script>

<style scoped>
/* Añade estos estilos */
.activity-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.last-update {
  font-size: 0.8rem;
  color: #6b7280;
}

.retry-btn.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.activity-empty-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<style scoped>
.dashboard {
  max-width: 1600px;
  margin: 0 auto;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b251d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #6b7280;
  font-weight: 600;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.error-container p {
  color: #ef4444;
  font-weight: 600;
}

.retry-btn {
  background: #3b251d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #8b6f47;
  transform: translateY(-2px);
}

/* Header */
.dashboard-header {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  padding: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 900;
  color: #1f2937;
  margin: 0 0 0.5rem;
  letter-spacing: -0.5px;
}

.highlight {
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dashboard-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 37, 29, 0.2);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 37, 29, 0.3);
}

.action-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.action-btn.secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-icon {
  font-size: 1.1rem;
}

/* Stats Section */
.stats-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 1.25rem;
  letter-spacing: -0.5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* Secondary Stats */
.secondary-stats {
  margin-bottom: 2rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

/* Chart Card */
.chart-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.chart-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.chart-filter {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-filter:hover {
  border-color: #3b251d;
}

.chart-placeholder {
  height: 300px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.75rem;
}

.placeholder-content p {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.5rem;
}

.revenue-amount {
  font-size: 2rem;
  font-weight: 900;
  color: #1f2937;
  margin: 0.5rem 0;
}

.placeholder-content small {
  font-size: 0.85rem;
  color: #9ca3af;
}

/* Activity Card */
.activity-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.activity-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.activity-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #f9fafb;
  transform: rotate(180deg);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.activity-item:hover {
  background: #f9fafb;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
}

.activity-empty {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

/* Properties Overview */
.properties-overview {
  margin-bottom: 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.overview-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.overview-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.overview-btn {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.overview-btn:hover {
  background: #f9fafb;
  border-color: #3b251d;
  color: #3b251d;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.property-status-card {
  background: #f9fafb;
  border: 2px solid;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.property-status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-count {
  font-size: 2.5rem;
  font-weight: 900;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.status-footer {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.status-percentage {
  font-size: 1rem;
  font-weight: 800;
}

.status-label {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.quick-action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #3b251d;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.action-description {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.action-arrow {
  font-size: 1.25rem;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.quick-action-card:hover .action-arrow {
  color: #3b251d;
  transform: translateX(4px);
}

/* Responsive */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .header-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }

  .stats-grid,
  .stats-row,
  .properties-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .overview-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .overview-btn {
    width: 100%;
  }

  .chart-placeholder {
    height: 200px;
  }
}
</style>
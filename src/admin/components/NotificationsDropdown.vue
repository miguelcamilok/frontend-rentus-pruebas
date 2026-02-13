<template>
  <div class="notifications-dropdown" ref="dropdownRef">
    <!-- Trigger Button -->
    <button class="icon-btn" @click="toggleDropdown">
      <font-awesome-icon icon="bell" class="icon" />
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <transition name="dropdown-fade">
      <div v-if="isOpen" class="dropdown-panel">
        <!-- Header -->
        <div class="dropdown-header">
          <div class="header-left">
            <h3 class="dropdown-title">Notificaciones</h3>
            <span v-if="unreadCount > 0" class="unread-badge">
              {{ unreadCount }} nueva{{ unreadCount !== 1 ? 's' : '' }}
            </span>
          </div>
          <div class="header-actions">
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="mark-all-btn"
              title="Marcar todas como leídas"
            >
              <span class="check-icon">✓</span>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="dropdown-content">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando notificaciones...</p>
          </div>

          <!-- Notifications List -->
          <div v-else-if="notifications.length > 0" class="notifications-list">
            <transition-group name="notification-item">
              <div
                v-for="notification in displayNotifications"
                :key="notification.id"
                class="notification-item"
                :class="{ unread: !notification.read }"
                @click="handleNotificationClick(notification)"
              >
                <!-- Indicator -->
                <div v-if="!notification.read" class="unread-indicator"></div>

                <!-- Icon -->
                <div class="notification-icon" :class="getNotificationType(notification.type)">
                  <span class="icon-emoji">{{ getNotificationIcon(notification.type) }}</span>
                </div>

                <!-- Content -->
                <div class="notification-content">
                  <p class="notification-text" v-html="notification.message"></p>
                  <span class="notification-time">
                    {{ formatTimeAgo(notification.created_at) }}
                  </span>
                </div>

                <!-- Actions -->
                <button
                  class="delete-btn"
                  @click.stop="deleteNotification(notification.id)"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            </transition-group>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <font-awesome-icon icon="bell" class="empty-icon" />
            <p class="empty-title">No hay notificaciones</p>
            <p class="empty-description">Te notificaremos cuando haya novedades</p>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="dropdown-footer">
          <button @click="viewAllNotifications" class="view-all-btn">
            Ver todas las notificaciones →
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted} from 'vue';
import { useRouter } from 'vue-router';
import { notificationService, type NotificationItem } from '../../services/notificationService';
import { eventBus, EVENTS } from '../../events/eventBus';
import { useAlerts } from '../../composables/useAlerts';

const router = useRouter();
const { success, error: showError } = useAlerts();

// State
const isOpen = ref(false);
const loading = ref(false);
const notifications = ref<NotificationItem[]>([]);
const dropdownRef = ref<HTMLElement | null>(null);

// Computed
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
);

const displayNotifications = computed(() => 
  notifications.value.slice(0, 5) // Mostrar solo las 5 más recientes
);

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && notifications.value.length === 0) {
    loadNotifications();
  }
};

const loadNotifications = async () => {
  loading.value = true;
  try {
    const response = await notificationService.getNotifications();
    notifications.value = response;
  } catch (err) {
    console.error('Error cargando notificaciones:', err);
    showError('Error al cargar notificaciones');
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = async (notification: NotificationItem) => {
  // Marcar como leída
  if (!notification.read) {
    await markAsRead(notification.id);
  }

  // Cerrar dropdown
  isOpen.value = false;

  // Navegar según el tipo
  const data = notification.data ? JSON.parse(notification.data) : {};

  switch (notification.type) {
    case 'rental_request':
      router.push('/admin/requests');
      break;
    
    case 'counter_proposal':
      router.push('/admin/requests');
      break;
    
    case 'contract_sent':
      router.push('/admin/contracts');
      break;
    
    case 'visit_reminder':
      if (data.property_id) {
        router.push(`/admin/properties/${data.property_id}`);
      }
      break;

    case 'payment_reminder':
      router.push('/admin/payments');
      break;

    case 'maintenance':
      router.push('/admin/maintenances');
      break;

    default:
      router.push('/admin/dashboard');
      break;
  }
};

const markAsRead = async (notificationId: number) => {
  try {
    await notificationService.markAsRead(notificationId);
    const notif = notifications.value.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
    eventBus.emit(EVENTS.NOTIFICATION_READ, notificationId);
  } catch (err) {
    console.error('Error marcando como leída:', err);
  }
};

const markAllAsRead = async () => {
  try {
    await notificationService.markAllAsRead();
    notifications.value.forEach(n => n.read = true);
    success('Todas las notificaciones marcadas como leídas');
    eventBus.emit(EVENTS.NOTIFICATION_READ, 'all');
  } catch (err) {
    console.error('Error marcando todas como leídas:', err);
    showError('Error al marcar todas como leídas');
  }
};

const deleteNotification = async (notificationId: number) => {
  try {
    await notificationService.deleteNotification(notificationId);
    notifications.value = notifications.value.filter(n => n.id !== notificationId);
    success('Notificación eliminada');
  } catch (err) {
    console.error('Error eliminando notificación:', err);
    showError('Error al eliminar notificación');
  }
};

const viewAllNotifications = () => {
  isOpen.value = false;
  // TODO: Crear página de notificaciones completa
  router.push('/admin/notifications');
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

const getNotificationType = (type: string): string => {
  const types: Record<string, string> = {
    rental_request: 'primary',
    counter_proposal: 'warning',
    contract_sent: 'success',
    contract_accepted: 'success',
    visit_reminder: 'info',
    payment_reminder: 'warning',
    maintenance: 'danger',
    system: 'info',
  };
  return types[type] || 'info';
};

const getNotificationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    rental_request: '🏠',
    counter_proposal: '📅',
    contract_sent: '📄',
    contract_accepted: '✅',
    visit_reminder: '⏰',
    payment_reminder: '💰',
    maintenance: '🔧',
    system: '🔔',
  };
  return icons[type] || '📌';
};

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// Listen for new notifications
const handleNewNotification = (notification: NotificationItem) => {
  // Agregar al inicio de la lista
  notifications.value.unshift(notification);
  
  // Si el dropdown está cerrado, mostrar un alert
  if (!isOpen.value) {
    success('Nueva notificación recibida', notification.message.substring(0, 50) + '...');
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  eventBus.on(EVENTS.NOTIFICATION_RECEIVED, handleNewNotification);
  
  // Cargar notificaciones iniciales
  loadNotifications();
  
  // Actualizar cada 2 minutos (sin recargar la página)
  const interval = setInterval(loadNotifications, 120000);
  (window as any).notificationInterval = interval;
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  eventBus.off(EVENTS.NOTIFICATION_RECEIVED, handleNewNotification);
  
  if ((window as any).notificationInterval) {
    clearInterval((window as any).notificationInterval);
  }
});
</script>

<style scoped>
.notifications-dropdown {
  position: relative;
}

/* Trigger Button */
.icon-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f9fafb;
}

.icon {
  font-size: 1.25rem;
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* Dropdown Panel */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: -100px;
  width: 420px;
  max-height: 600px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.dropdown-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dropdown-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
}

.unread-badge {
  background: linear-gradient(135deg, #3b86f7 0%, #1e40af 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.mark-all-btn {
  background: none;
  border: 1px solid #e5e7eb;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-size: 1rem;
}

.mark-all-btn:hover {
  background: #f9fafb;
  border-color: #3b251d;
  color: #3b251d;
}

/* Content */
.dropdown-content {
  flex: 1;
  overflow-y: auto;
  max-height: 450px;
}

.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b251d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Notifications List */
.notifications-list {
  padding: 0.5rem 0;
}

.notification-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: linear-gradient(90deg, rgba(59, 134, 247, 0.05) 0%, rgba(59, 134, 247, 0.01) 100%);
  border-left-color: #3b86f7;
}

.unread-indicator {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #3b86f7;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(59, 134, 247, 0.6);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.notification-icon.primary {
  background: linear-gradient(135deg, rgba(59, 134, 247, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%);
}

.notification-icon.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
}

.notification-icon.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
}

.notification-icon.danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
}

.notification-icon.info {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%);
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.delete-btn {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  color: #9ca3af;
  opacity: 0;
  transition: all 0.2s ease;
}

.notification-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
}

/* Footer */
.dropdown-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}

.view-all-btn {
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #3b251d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.notification-item-enter-active,
.notification-item-leave-active {
  transition: all 0.3s ease;
}

.notification-item-enter-from,
.notification-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .dropdown-panel {
    right: -50px;
    width: 90vw;
    max-width: 380px;
  }
}
</style>
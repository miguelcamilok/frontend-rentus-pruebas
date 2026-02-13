<template>
  <nav class="admin-navbar">
    <div class="navbar-content">
      <!-- Left Section -->
      <div class="navbar-left">
        <button class="menu-toggle" @click="$emit('toggleSidebar')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <div class="breadcrumb">
          <span class="breadcrumb-item">Admin</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item current">{{ currentPageTitle }}</span>
        </div>
      </div>

      <!-- Right Section -->
      <div class="navbar-right">

        <!-- Search Bar -->
        <div class="search-container">
          <div class="search-icon">🔍</div>
          <input type="text" placeholder="Buscar..." class="search-input" v-model="searchQuery"
            @keyup.enter="handleSearch" />
          <kbd class="search-kbd">⌘K</kbd>
        </div>

        <!-- Notifications Dropdown -->
        <NotificationsDropdown />

        <!-- Settings -->
        <button class="icon-btn" @click="goToSettings">
          <font-awesome-icon icon="cog" class="icon" />
        </button>

        <!-- User Profile -->
        <div class="user-profile" @click="toggleUserMenu">
          <div class="avatar">
            <img v-if="currentUser?.photo" :src="currentUser.photo" :alt="currentUser.name" />
            <span v-else class="avatar-placeholder">
              {{ userInitials }}
            </span>
          </div>
          <div class="user-info">
            <p class="user-name">{{ currentUser?.name || 'Admin' }}</p>
            <p class="user-role">{{ userRoleLabel }}</p>
          </div>
          <span class="dropdown-arrow">▼</span>
        </div>

        <!-- User Dropdown Menu -->
        <transition name="dropdown">
          <div v-if="showUserMenu" class="user-dropdown">
            <div class="dropdown-header">
              <p class="dropdown-user-name">{{ currentUser?.name }}</p>
              <p class="dropdown-user-email">{{ currentUser?.email }}</p>
            </div>

            <a href="#" class="dropdown-item" @click.prevent="goToHome">
              <span class="dropdown-icon">🏠</span>
              <span>Home</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" @click.prevent="goToProfile">
              <span class="dropdown-icon">👤</span>
              <span>Mi Perfil</span>
            </a>

            <a href="#" class="dropdown-item" @click.prevent="goToSettings">
              <span class="dropdown-icon">⚙️</span>
              <span>Configuración</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item danger" @click.prevent="handleLogout">
              <span class="dropdown-icon">🚪</span>
              <span>{{ isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión' }}</span>
            </a>
          </div>
        </transition>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoggingOut" class="logout-overlay">
      <div class="logout-spinner"></div>
      <p>Cerrando sesión...</p>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminAuth } from '../composables/useAdminAuth';
import { useAlerts } from '../../composables/useAlerts';
import NotificationsDropdown from '../components/NotificationsDropdown.vue';

const route = useRoute();
const router = useRouter();
const { user: currentUser, logout } = useAdminAuth();
const { confirm } = useAlerts();

// Emits
defineEmits<{
  toggleSidebar: [];
}>();

// State
const searchQuery = ref('');
const showUserMenu = ref(false);
const isLoggingOut = ref(false);

// Computed
const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'Usuarios',
    '/admin/properties': 'Propiedades',
    '/admin/contracts': 'Contratos',
    '/admin/payments': 'Pagos',
    '/admin/maintenances': 'Mantenimiento',
    '/admin/visits': 'Visitas',
    '/admin/reports': 'Reportes',
  };

  return titles[route.path] || 'Admin Panel';
});

const userInitials = computed(() => {
  if (!currentUser.value?.name) return 'AD';
  return currentUser.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const userRoleLabel = computed(() => {
  const roles: Record<string, string> = {
    admin: 'Administrador',
    support: 'Soporte',
    user: 'Usuario',
  };
  return roles[currentUser.value?.role || 'user'];
});

// Methods
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const goToHome = () => {
  router.push('/');
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('🔍 Buscando:', searchQuery.value);
    // TODO: Implementar búsqueda
  }
};

const goToProfile = () => {
  showUserMenu.value = false;
  router.push('/perfil');
};

const goToSettings = () => {
  showUserMenu.value = false;
  router.push('/ajustes');
};

const handleLogout = async () => {
  if (isLoggingOut.value) return;

  confirm(
    '¿Estás seguro que deseas cerrar sesión?',
    async () => {
      // Usuario confirmó
      showUserMenu.value = false;
      isLoggingOut.value = true;

      try {
        console.log('🚪 Cerrando sesión...');
        await logout();
        console.log('✅ Sesión cerrada exitosamente');

        // Redirigir al login
        router.push({
          name: 'Login',
          query: { message: 'Sesión cerrada exitosamente' }
        });
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
      } finally {
        isLoggingOut.value = false;
      }
    },
    () => {
      // Usuario canceló
      console.log('❌ Logout cancelado');
    },
    {
      title: 'Cerrar Sesión',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar'
    }
  );
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-profile') && !target.closest('.user-dropdown')) {
    showUserMenu.value = false;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.admin-navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 280px;
  height: 72px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: 90;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  gap: 2rem;
}

/* Logout Overlay */
.logout-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 9999;
}

.logout-spinner {
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

.logout-overlay p {
  color: #1f2937;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Left Section */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-toggle:hover {
  background: #f9fafb;
  color: #3b251d;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.breadcrumb-item {
  color: #6b7280;
  font-weight: 500;
}

.breadcrumb-item.current {
  color: #1f2937;
  font-weight: 700;
}

.breadcrumb-separator {
  color: #d1d5db;
}

/* Right Section */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

/* Search */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  width: 300px;
  transition: all 0.2s ease;
}

.search-container:focus-within {
  background: white;
  border-color: #3b251d;
  box-shadow: 0 0 0 3px rgba(59, 37, 29, 0.1);
}

.search-icon {
  font-size: 1rem;
  margin-right: 0.5rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9rem;
  color: #1f2937;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-kbd {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

/* Icon Buttons */
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

/* User Profile */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.user-profile:hover {
  background: white;
  border-color: #3b251d;
  box-shadow: 0 2px 8px rgba(59, 37, 29, 0.1);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1;
}

.user-role {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1;
}

.dropdown-arrow {
  font-size: 0.65rem;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.user-profile:hover .dropdown-arrow {
  color: #3b251d;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-width: 240px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.dropdown-user-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.dropdown-user-email {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f9fafb;
  color: #3b251d;
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.dropdown-icon {
  font-size: 1.1rem;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-navbar {
    left: 0;
  }

  .menu-toggle {
    display: flex;
  }

  .search-container {
    width: 200px;
  }

  .user-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar-content {
    padding: 0 1rem;
  }

  .breadcrumb {
    display: none;
  }

  .search-container {
    width: auto;
    flex: 1;
  }

  .search-kbd {
    display: none;
  }
}
</style>
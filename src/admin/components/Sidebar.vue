<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Logo Section -->
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
            <path d="M16 8L8 14V24H24V14L16 8Z" fill="white" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#3b251d" />
                <stop offset="100%" stop-color="#8b6f47" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <transition name="fade">
          <span v-if="!isCollapsed" class="logo-text">Admin Panel</span>
        </transition>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <p v-if="!isCollapsed" class="nav-section-title">Principal</p>
        
        <router-link
          v-for="item in mainMenuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <transition name="fade">
            <span v-if="!isCollapsed" class="nav-text">{{ item.label }}</span>
          </transition>
          <span v-if="item.badge && !isCollapsed" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </div>

      <div class="nav-section">
        <p v-if="!isCollapsed" class="nav-section-title">Gestión</p>
        
        <router-link
          v-for="item in managementMenuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <transition name="fade">
            <span v-if="!isCollapsed" class="nav-text">{{ item.label }}</span>
          </transition>
        </router-link>
      </div>

      <div class="nav-section">
        <p v-if="!isCollapsed" class="nav-section-title">Sistema</p>
        
        <router-link
          v-for="item in systemMenuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <transition name="fade">
            <span v-if="!isCollapsed" class="nav-text">{{ item.label }}</span>
          </transition>
        </router-link>
      </div>
    </nav>

    <!-- Collapse Button -->
    <button class="collapse-btn" @click="$emit('toggle')">
      <span v-html="isCollapsed ? expandIcon : collapseIcon"></span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
}

// Props
defineProps<{
  isCollapsed: boolean;
}>();

// Emits
defineEmits<{
  toggle: [];
}>();

const route = useRoute();

// Menú principal
const mainMenuItems: MenuItem[] = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: '📊',
  },
];

// Menú de gestión
const managementMenuItems: MenuItem[] = [
  {
    path: '/admin/users',
    label: 'Usuarios',
    icon: '👥',
  },
  {
    path: '/admin/properties',
    label: 'Propiedades',
    icon: '🏠',
  },
  {
    path: '/admin/contracts',
    label: 'Contratos',
    icon: '📄',
  },
  {
    path: '/admin/payments',
    label: 'Pagos',
    icon: '💳',
  },
  {
    path: '/admin/maintenances',
    label: 'Mantenimiento',
    icon: '🔧',
  },
  {
    path: '/admin/visits',
    label: 'Visitas',
    icon: '📅',
  },
];

// Menú de sistema
const systemMenuItems: MenuItem[] = [
  {
    path: '/admin/reports',
    label: 'Reportes',
    icon: '📈',
  },
];

// Icons
const collapseIcon = '◀';
const expandIcon = '▶';

// Verificar si la ruta está activa
const isActive = (path: string) => {
  return route.path.startsWith(path);
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 80px;
}

/* Header */
.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.5px;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 600;
  font-size: 0.95rem;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  border-radius: 0 3px 3px 0;
  transition: height 0.2s ease;
}

.nav-item:hover {
  background: #f9fafb;
  color: #3b251d;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(59, 37, 29, 0.08) 0%, rgba(59, 37, 29, 0.02) 100%);
  color: #3b251d;
  font-weight: 700;
}

.nav-item.active::before {
  height: 80%;
}

.nav-icon {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

/* Collapse Button */
.collapse-btn {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e5e7eb;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 0.75rem;
  color: #6b7280;
}

.collapse-btn:hover {
  background: #f9fafb;
  border-color: #3b251d;
  color: #3b251d;
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 37, 29, 0.15);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.collapsed {
    transform: translateX(0);
  }
}
</style>

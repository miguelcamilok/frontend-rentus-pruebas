<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <Sidebar 
      :is-collapsed="isSidebarCollapsed"
      @toggle="toggleSidebar"
    />

    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Top Navbar -->
      <AdminNavbar @toggle-sidebar="toggleSidebar" />

      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import AdminNavbar from '../components/AdminNavbar.vue';

// Estado del sidebar
const isSidebarCollapsed = ref(false);

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #fafafa;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.page-content {
  flex: 1;
  padding: 2rem;
  margin-top: 72px; /* Altura del navbar */
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
  }

  .main-content.sidebar-collapsed {
    margin-left: 0;
  }

  .page-content {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
    margin-top: 64px;
  }
}
</style>
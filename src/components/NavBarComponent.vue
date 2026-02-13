<template>
  <header class="property-header">
    <div class="logo" @click="goHome" style="cursor: pointer">
      <img src="../assets/logo-white.png" alt="Logo" />
      <div class="logo-text"><strong>Rent</strong><span>Us</span></div>
    </div>

    <!-- Hamburger menu button -->
    <button class="hamburger-btn" @click="toggleMobileMenu" :class="{ active: showMobileMenu }" aria-label="Menu">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Barra de navegación con menú móvil -->
    <nav class="navigation-section" :class="{ 'mobile-active': showMobileMenu }">
      <div class="nav-links">

        <!-- LINK INICIO -->
        <router-link to="/" class="nav-link" :class="{ active: isActive('/') }" @click="closeMobileMenu">
          <font-awesome-icon icon="home" class="nav-icon" />
          <span class="nav-text">{{ $t('navbar.links.home') }}</span>
        </router-link>

        <!-- LINK PROPIEDADES -->
        <router-link to="/propiedades" class="nav-link" :class="{ active: isActive('/propiedades') }"
          @click="closeMobileMenu">
          <font-awesome-icon icon="building" class="nav-icon" />
          <span class="nav-text">{{ $t('navbar.links.properties') }}</span>
        </router-link>

        <!-- LINK NOSOTROS -->
        <router-link to="/sobre-nosotros" class="nav-link" :class="{ active: isActive('/sobre-nosotros') }"
          @click="closeMobileMenu">
          <font-awesome-icon icon="people-group" class="nav-icon" />
          <span class="nav-text">{{ $t('navbar.links.about') }}</span>
        </router-link>
      </div>

      <!-- Login button en menú móvil -->
      <button v-if="!isLoggedIn" @click="goLogin" class="login-btn mobile-login-btn" type="button">
        {{ $t('navbar.auth.login') }}
      </button>
    </nav>
    <div class="header-right">
      <!-- Language Toggle -->
      <div class="language-toggle" @click="toggleLanguage">
        <div class="toggle-track">
          <div class="toggle-slider" :class="{ active: currentLanguage === 'es' }"></div>
          <div class="language-option" :class="{ active: currentLanguage === 'en' }">
            <span class="lang-code">EN</span>
          </div>
          <div class="language-option" :class="{ active: currentLanguage === 'es' }">
            <span class="lang-code">ES</span>
          </div>
          <div class="toggle-glow"></div>
        </div>
      </div>

      <!-- Login button desktop -->
      <button v-if="!isLoggedIn" @click="goLogin" class="login-btn desktop-login-btn" type="button">
        {{ $t('navbar.auth.login') }}
      </button>

      <!-- DROPDOWN USUARIO -->
      <div v-else class="user-profile" id="userToggle" @click="toggleUserDropdown">
        <div class="user-avatar">
          <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" class="avatar-img" />
          <img v-else src="/img/default.webp" alt="Usuario" class="avatar-img" />
          <div class="status-indicator"></div>
        </div>

        <div class="user-details">
          <div class="user-greeting">{{ $t('navbar.auth.greeting') }}, {{ firstName }}</div>
          <div class="user-role"></div>
        </div>

        <div class="dropdown-arrow" :class="{ rotated: showDropdown }">
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>

        <!-- Dropdown Menu ULTRA MODERNO -->
        <transition name="dropdown-fade">
          <div v-if="showDropdown" class="user-dropdown-menu" @click.stop>
            <!-- Header con efecto glassmorphism -->
            <div class="dropdown-header">
              <div class="header-background"></div>
              <button class="dropdown-close-btn" @click="closeDropdown" aria-label="Cerrar menú">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-linecap="round" />
                </svg>
              </button>

              <div class="dropdown-avatar-wrapper">
                <div class="avatar-glow"></div>
                <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" class="dropdown-avatar" />
                <img v-else src="/img/default.webp" alt="Usuario" class="dropdown-avatar" />
                <div class="avatar-border"></div>
              </div>

              <div class="dropdown-user-info">
                <div class="dropdown-name">{{ fullName }}</div>
                <div class="dropdown-email">{{ userEmail }}</div>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <!-- Items con animaciones stagger -->
            <div class="dropdown-items">
              <!-- Mi Perfil -->
              <div @click="goPerfil" class="dropdown-item" style="animation-delay: 0s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="user" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.myProfile') }}</div>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Notificaciones -->
              <div @click="openNotificaciones" class="dropdown-item" style="animation-delay: 0.05s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="bell" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.notifications') }}</div>
                <span v-if="unreadCount > 0" class="notification-badge">
                  {{ unreadCount }}
                </span>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Contratos -->
              <div @click="goContratos" class="dropdown-item" style="animation-delay: 0.1s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="file-alt" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.contracts') }}</div>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Pagos -->
              <div @click="goPagos" class="dropdown-item" style="animation-delay: 0.15s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="dollar-sign" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.payments') }}</div>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Sección Solicitudes -->
              <div class="dropdown-section-divider" style="animation-delay: 0.2s">
                <span class="divider-text">{{ $t('navbar.dropdown.sections.requests') }}</span>
                <div class="divider-line"></div>
              </div>

              <!-- Mantenimiento -->
              <div @click="openMaintenanceModal" class="dropdown-item" style="animation-delay: 0.25s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="wrench" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.maintenance') }}</div>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Solicitudes (Dueño) -->
              <div @click="openSolicitudesModal" class="dropdown-item" style="animation-delay: 0.3s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="clipboard-list" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.ownerRequests') }}</div>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Mis Solicitudes -->
              <div @click="openMyRequestsModalFn" class="dropdown-item" style="animation-delay: 0.35s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="calendar-check" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.myRequests') }}</div>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Sección Configuración -->
              <div class="dropdown-section-divider" style="animation-delay: 0.4s">
                <span class="divider-text">{{ $t('navbar.dropdown.sections.settings') }}</span>
                <div class="divider-line"></div>
              </div>


              <!-- Admin Panel (solo para admin/support) -->
              <div v-if="currentUser?.role === 'admin' || currentUser?.role === 'support'" @click="goToAdminPanel"
                class="dropdown-item admin-panel-item" style="animation-delay: 0.42s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="shield-alt" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.adminPanel') }}</div>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Ajustes -->
              <div @click="goAjustes" class="dropdown-item" style="animation-delay: 0.45s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="cog" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.dropdown.settings') }}</div>
                <font-awesome-icon icon="chevron-right" class="item-arrow" />
              </div>

              <!-- Cerrar Sesión -->
              <div @click="handleLogout" class="dropdown-item logout-item" style="animation-delay: 0.5s">
                <div class="item-icon-wrapper">
                  <font-awesome-icon icon="sign-out-alt" class="item-icon" />
                  <div class="icon-glow"></div>
                </div>
                <div class="item-text">{{ $t('navbar.auth.logout') }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>

  <div class="dropdown-backdrop" :class="{ active: showDropdown }" @click="closeDropdown"></div>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <MaintenanceModal :is-visible="showMaintenanceModal" @close="showMaintenanceModal = false"
    @submitted="handleMaintenanceSubmitted" />

  <RequestsView :open="showRequestModal" @close="showRequestModal = false" />

  <NotificationsView :open="showNotificaciontModal" @close="showNotificaciontModal = false" />

  <MyRequestsModal :open="showMyRequestsModal" @close="showMyRequestsModal = false" />

  <!-- Alerta personalizada -->
  <transition name="alert-slide">
    <div v-if="alert.show" class="custom-alert" :class="`alert-${alert.type}`">
      <div class="alert-icon">
        <font-awesome-icon :icon="alert.type === 'success' ? 'check-circle' :
          alert.type === 'error' ? 'times-circle' :
            'info-circle'" />
      </div>
      <div class="alert-content">
        <div class="alert-title">{{ alert.title }}</div>
        <div class="alert-message">{{ alert.message }}</div>
      </div>
      <button @click="closeAlert" class="alert-close">
        <font-awesome-icon icon="times" />
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authService } from "../services/auth";
import type { User } from "../services/auth";
import { notificationService } from "../services/notificationService";
import MaintenanceModal from '../components/modals/Maintenance/MaintenanceModal.vue';
import RequestsView from "../components/modals/ModalRequest/RequestsView.vue";
import NotificationsView from "../components/modals/Notifications/NotificationsView.vue";
import MyRequestsModal from "../components/modals/ModalRequest/MyRequestsModal.vue";
import { eventBus, EVENTS } from '../events/eventBus';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

// Estado de autenticación
const isLoggedIn = ref(false);
const currentUser = ref<User | null>(null);
const fullName = ref("Usuario");
const firstName = ref("Usuario");
const userEmail = ref("");
const profilePhoto = ref("");

// Estado de UI
const showDropdown = ref(false);
const showMobileMenu = ref(false);
const showMaintenanceModal = ref(false);
const showRequestModal = ref(false);
const showNotificaciontModal = ref(false);
const showMyRequestsModal = ref(false);
const unreadCount = ref(0);

// Estado de idioma
const currentLanguage = ref(locale.value);

// Sistema de alertas
interface Alert {
  show: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const alert = ref<Alert>({
  show: false,
  type: 'success',
  title: '',
  message: ''
});

let alertTimeout: number | undefined;

const showAlert = (type: Alert['type'], title: string, message: string) => {
  alert.value = { show: true, type, title, message };

  if (alertTimeout) clearTimeout(alertTimeout);
  alertTimeout = window.setTimeout(() => {
    closeAlert();
  }, 5000);
};

const closeAlert = () => {
  alert.value.show = false;
  if (alertTimeout) clearTimeout(alertTimeout);
};

const isActive = (path: string) => {
  return route.path === path;
};

// ==================== Funciones de idioma ====================

const toggleLanguage = () => {
  const newLanguage = currentLanguage.value === 'es' ? 'en' : 'es';
  changeLanguage(newLanguage);
};

const changeLanguage = (lang: string) => {
  currentLanguage.value = lang;
  locale.value = lang;
  localStorage.setItem('lang', lang);

  // Emitir evento para sincronizar con otras partes de la app
  eventBus.emit(EVENTS.LANGUAGE_CHANGED, lang);
};

// Escuchar cambios de idioma desde otras partes (ej: Settings)
const handleLanguageChange = (lang: string) => {
  if (currentLanguage.value !== lang) {
    currentLanguage.value = lang;
    locale.value = lang;
  }
};

// ==================== Funciones de autenticación ====================

const checkAuthAndLoadUser = async () => {
  try {
    if (!authService.isAuthenticated()) {
      isLoggedIn.value = false;
      currentUser.value = null;
      return;
    }

    const storedUser = authService.getUser();
    if (storedUser) {
      updateUserData(storedUser);
      isLoggedIn.value = true;
    }

    const user = await authService.getMe();
    updateUserData(user);
    currentUser.value = user;
    isLoggedIn.value = true;

    await loadUnreadCount();

  } catch (error) {
    console.error("Error verificando autenticación:", error);
    await handleLogout();
  }
};

const goToAdminPanel = () => {
  router.push('/admin/dashboard');
  closeDropdown();
  closeMobileMenu();
};

const updateUserData = (user: User) => {
  fullName.value = user.name || "Usuario";
  firstName.value = fullName.value.split(" ")[0];
  userEmail.value = user.email || "";

  if (firstName.value.length > 10) {
    firstName.value = firstName.value.slice(0, 10) + "...";
  }

  profilePhoto.value = user.photo || "";
};

const handleLogout = async () => {
  try {
    await authService.logout();
    showAlert('success', t('navbar.alerts.logoutSuccess.title'), t('navbar.alerts.logoutSuccess.message'));
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    showAlert('error', t('navbar.alerts.logoutError.title'), t('navbar.alerts.logoutError.message'));
  } finally {
    isLoggedIn.value = false;
    currentUser.value = null;
    fullName.value = "Usuario";
    firstName.value = "Usuario";
    userEmail.value = "";
    profilePhoto.value = "";
    showDropdown.value = false;

    router.push("/login");
  }
};

// ==================== Funciones de navegación ====================

const goHome = () => {
  router.push("/");
  closeMobileMenu();
};

const goLogin = () => {
  router.push("/login");
  closeMobileMenu();
};

const goPerfil = () => {
  router.push('/perfil');
  closeDropdown();
  closeMobileMenu();
};

const goContratos = () => {
  router.push("/contratos");
  closeDropdown();
  closeMobileMenu();
};

const goPagos = () => {
  router.push("/pagos");
  closeDropdown();
  closeMobileMenu();
};

const goAjustes = () => {
  router.push("/ajustes");
  closeDropdown();
  closeMobileMenu();
};

// ==================== Funciones de UI ====================

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  if (showMobileMenu.value) {
    showDropdown.value = false;
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

const toggleUserDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    showMobileMenu.value = false;
    if (window.innerWidth <= 768) {
      document.body.classList.add('dropdown-open');
    }
  } else {
    document.body.classList.remove('dropdown-open');
  }
};

const closeDropdown = () => {
  showDropdown.value = false;
  document.body.classList.remove('dropdown-open');
};

// ==================== Funciones de modales ====================

const openMaintenanceModal = () => {
  showMaintenanceModal.value = true;
  closeDropdown();
};

const handleMaintenanceSubmitted = (data: any) => {
  console.log('Solicitud de mantenimiento enviada:', data);
  showAlert('success', t('navbar.alerts.maintenanceSuccess.title'), t('navbar.alerts.maintenanceSuccess.message'));
};

const openSolicitudesModal = () => {
  showRequestModal.value = true;
  closeDropdown();
};

const openMyRequestsModalFn = () => {
  showMyRequestsModal.value = true;
  closeDropdown();
};

const openNotificaciones = () => {
  showNotificaciontModal.value = true;
  closeDropdown();
};

// ==================== Funciones de notificaciones ====================

const loadUnreadCount = async () => {
  try {
    if (!isLoggedIn.value) return;

    const response = await notificationService.getUnreadCount();
    unreadCount.value = response.count;
  } catch (error) {
    console.error("Error cargando contador de notificaciones:", error);
  }
};

const handlePhotoUpdate = (newPhoto: string) => {
  profilePhoto.value = newPhoto;

  if (currentUser.value) {
    currentUser.value.photo = newPhoto;
    const isRemembered = !!localStorage.getItem("auth_token");
    const storage = isRemembered ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(currentUser.value));
  }
};

// ==================== Event handlers ====================

const handleClickOutside = (event: MouseEvent) => {
  const userMenu = document.getElementById("userToggle");
  const dropdown = document.querySelector(".user-dropdown-menu");
  const hamburger = document.querySelector(".hamburger-btn");
  const mobileNav = document.querySelector(".navigation-section");

  if (
    userMenu &&
    dropdown &&
    !userMenu.contains(event.target as Node) &&
    !dropdown.contains(event.target as Node) &&
    showDropdown.value
  ) {
    closeDropdown();
  }

  if (
    hamburger &&
    mobileNav &&
    !hamburger.contains(event.target as Node) &&
    !mobileNav.contains(event.target as Node) &&
    showMobileMenu.value
  ) {
    showMobileMenu.value = false;
  }
};

// ==================== Watchers ====================

watch(() => route.path, async () => {
  if (authService.isAuthenticated() && !isLoggedIn.value) {
    await checkAuthAndLoadUser();
  }
});

// ==================== Lifecycle hooks ====================
let notificationInterval: number | undefined;

onMounted(async () => {
  await checkAuthAndLoadUser();

  // Cargar idioma guardado
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    currentLanguage.value = savedLang;
    locale.value = savedLang;
  }

  document.addEventListener("click", handleClickOutside);
  eventBus.on(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);
  eventBus.on(EVENTS.LANGUAGE_CHANGED, handleLanguageChange);

  notificationInterval = window.setInterval(() => {
    if (isLoggedIn.value) {
      loadUnreadCount();
    }
  }, 30000);
});

onBeforeUnmount(() => {
  if (notificationInterval) clearInterval(notificationInterval);

  document.removeEventListener("click", handleClickOutside);
  eventBus.off(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);
  eventBus.off(EVENTS.LANGUAGE_CHANGED, handleLanguageChange);

  document.body.classList.remove("dropdown-open");
  document.body.classList.remove("mobile-menu-open");
});
</script>

<style scoped>
@import "../assets/css/components/navbar.css";

.admin-panel-item {
  background: linear-gradient(135deg, #3b251d05 0%, #8b6f4705 100%);
  border-left: 3px solid #3b251d;
}

.admin-panel-item:hover {
  background: linear-gradient(135deg, #3b251d10 0%, #8b6f4710 100%);
  border-left-color: #8b6f47;
}
</style>
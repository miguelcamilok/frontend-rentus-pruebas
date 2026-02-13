// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from "../layouts/MainLayout.vue";
import HomeView from "../views/HomeView.vue";
import MapView from "../components/modals/Maps/MapView.vue";
import PropertyDetail from "../views/Property/PropertyDetail.vue";
import LoginView from "../views/Auth/LoginView.vue";
import RegisterView from "../views/Auth/RegisterView.vue";
import ConfirmEmailView from "../views/Auth/ConfirmEmailView.vue";
import ResetPasswordView from "../views/Auth/ResetPasswordView.vue";
import ProfileView from "../views/Dropdown/ProfileView.vue";
import PropertyView from "../views/Property/PropertyView.vue";
import PropertyCreate from "../views/Property/PropertyCreate.vue";
import PropertyEdit from "../views/Property/PropertyEdit.vue";
import AboutUsView from "../views/AboutUsView.vue";
import ContractView from "../views/Dropdown/ContractView.vue";
import SettingsView from "../views/Dropdown/SettingsView.vue";
import { authService } from "../services/auth";

// ==================== IMPORTAR RUTAS DEL ADMIN PANEL ====================
import { adminRoutes } from "../admin/router/admin.routes";

const routes: RouteRecordRaw[] = [
  // ==================== RUTAS CON LAYOUT ====================
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomeView,
        meta: { title: "Inicio" },
      },
      {
        path: "properties/:id",
        name: "PropertyDetail",
        component: PropertyDetail,
        meta: { title: "Detalle de Propiedad" },
      },
      {
        path: "/perfil",
        name: "ProfileView",
        component: ProfileView,
        meta: { title: "Perfil", requiresAuth: true },
      },
      {
        path: "/propiedades",
        name: "PropertyView",
        component: PropertyView,
        meta: { title: "Propiedades" },
      },
      {
        path: "/properties/create",
        name: "PropertyCreate",
        component: PropertyCreate,
        meta: { title: "Crear Propiedad", requiresAuth: true },
      },
      {
        path: "/propiedades/:id/editar",
        name: "PropertyEdit",
        component: PropertyEdit,
        meta: { title: "Editar Propiedad", requiresAuth: true },
      },
      {
        path: "/sobre-nosotros",
        name: "AboutUsView",
        component: AboutUsView,
        meta: { title: "Sobre Nosotros" },
      },
      {
        path: "/contratos",
        name: "ContractView",
        component: ContractView,
        meta: { title: "Contratos", requiresAuth: true },
      },
      {
        path: "/ajustes",
        name: "SettingsView",
        component: SettingsView,
        meta: { title: "Ajustes de Cuenta", requiresAuth: true },
      },
    ],
  },

  // ==================== RUTAS DEL ADMIN PANEL ====================
  ...adminRoutes,

  // ==================== MAPA (SIN LAYOUT) ====================
  {
    path: "/map/:id",
    name: "MapView",
    component: MapView,
    props: true,
    meta: { title: "Mapa de Propiedad" },
  },

  // ==================== AUTENTICACIÓN (SIN LAYOUT) ====================
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { title: "Iniciar Sesión", hideForAuth: true },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    meta: { title: "Registro", hideForAuth: true },
  },
  {
    path: "/confirm-email",
    name: "ConfirmEmail",
    component: ConfirmEmailView,
    meta: { title: "Confirmar Email" },
    beforeEnter: (to, _from, next) => {
      const token =
        typeof to.query.token === "string"
          ? to.query.token
          : undefined;

      if (!token) {
        next({ name: "home" });
        return;
      }

      next();
    },
  },

  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ResetPasswordView,
    meta: { title: "Recuperar Contraseña", hideForAuth: true },
  },

  // ==================== 404 NOT FOUND ====================
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Comportamiento de scroll: siempre ir al inicio en cada navegación
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: "smooth" };
    }
  },
});

// ==================== GUARD ANTES DE CADA NAVEGACIÓN ====================
router.beforeEach(async (to, from, next) => {
  console.log(`🧭 Navegando de ${from.path} → ${to.path}`);

  // Actualizar título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} | RentUs`;
  } else {
    document.title = "RentUs - Encuentra tu hogar ideal";
  }

  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const hideForAuth = to.matched.some((record) => record.meta.hideForAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const requiresRole = to.meta.requiresRole as string | undefined;

  // ==================== CASO 1: Ruta requiere autenticación ====================
  if (requiresAuth && !isAuthenticated) {
    console.log("🔒 Ruta protegida, redirigiendo a login");

    // Guardar la ruta a la que intentaba acceder
    localStorage.setItem("redirectAfterLogin", to.fullPath);

    next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // ==================== CASO 2: Usuario autenticado intenta acceder a login/register ====================
  if (hideForAuth && isAuthenticated) {
    console.log("👤 Usuario autenticado, redirigiendo");

    try {
      // Obtener información del usuario para decidir redirección
      const user = await authService.getMe();

      // Si es admin o support, redirigir al dashboard admin
      if (user.role === 'admin' || user.role === 'support') {
        console.log("🔐 Usuario admin/support detectado, redirigiendo al dashboard");
        next({ name: "admin-dashboard" });
      } else {
        next({ name: "home" });
      }
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      next({ name: "home" });
    }
    return;
  }

  // ==================== CASO 3: Verificar validez del token en rutas protegidas ====================
  if (isAuthenticated && requiresAuth) {
    try {
      // Intentar obtener el usuario para validar el token
      const user = await authService.getMe();
      console.log("✅ Token válido, permitiendo acceso");

      // ==================== CASO 3.1: Verificar acceso al admin panel ====================
      if (requiresAdmin) {
        const userRole = user.role;

        console.log(`🔐 Verificando acceso admin. Rol del usuario: ${userRole}`);

        // Solo admin y support pueden acceder
        if (userRole !== 'admin' && userRole !== 'support') {
          console.warn("🚫 Acceso denegado: Se requiere rol de administrador");
          next({
            name: "home",
            query: { error: 'unauthorized' }
          });
          return;
        }

        // ==================== CASO 3.2: Verificar rol específico ====================
        if (requiresRole && userRole !== requiresRole) {
          console.warn(`🚫 Acceso denegado: Se requiere rol ${requiresRole}, tienes ${userRole}`);
          next({
            name: "admin-dashboard",
            query: { error: 'insufficient_permissions' }
          });
          return;
        }

        console.log("✅ Acceso admin permitido");
      }

      next();
    } catch (error) {
      console.error("❌ Token inválido:", error);

      // Token inválido, limpiar y redirigir a login
      await authService.logout();
      localStorage.setItem("redirectAfterLogin", to.fullPath);

      next({
        name: "Login",
        query: { redirect: to.fullPath },
      });
    }
    return;
  }

  // ==================== CASO 4: Rutas admin sin autenticación ====================
  if (requiresAdmin && !isAuthenticated) {
    console.log("🔒 Admin panel requiere autenticación, redirigiendo a login");
    localStorage.setItem("redirectAfterLogin", to.fullPath);

    next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // ==================== CASO 5: Permitir navegación ====================
  console.log("✅ Navegación permitida");
  next();
});

// ==================== GUARD DESPUÉS DE CADA NAVEGACIÓN ====================
router.afterEach((to, from) => {
  // Log para debugging en desarrollo
  if (import.meta.env.DEV) {
    console.log(`📍 Navegación completada: ${from.path} → ${to.path}`);
  }

  // Aquí puedes agregar analytics, tracking, etc.
  // Ejemplo: trackPageView(to.path);
});

// ==================== MANEJO DE ERRORES DE NAVEGACIÓN ====================
router.onError((error) => {
  console.error("❌ Error en navegación:", error);

  // Puedes mostrar un mensaje al usuario o registrar el error
  // Ejemplo: notifyError('Error al cargar la página');
});

export default router;
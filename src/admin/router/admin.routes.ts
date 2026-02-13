import type { RouteRecordRaw } from 'vue-router';

// Lazy loading de componentes
const AdminLayout = () => import('../layouts/AdminLayout.vue');
const Dashboard = () => import('../pages/Dashboard.vue');

// Páginas placeholder (crear después)
const Users = () => import('../pages/Users.vue');
const Properties = () => import('../pages/Properties.vue');
const Contracts = () => import('../pages/Contracts.vue');
const Payments = () => import('../pages/Payments.vue');
const Maintenances = () => import('../pages/Maintenances.vue');
const Visits = () => import('../pages/Visits.vue');
const Reports = () => import('../pages/Reports.vue');

/**
 * Rutas del Admin Panel
 * Todas estas rutas están protegidas por el middleware de autenticación
 */
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      requiresAdmin: true, // Requiere rol admin o support
      title: 'Admin Panel',
    },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: Dashboard,
        meta: {
          title: 'Dashboard',
          icon: '📊',
        },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: Users,
        meta: {
          title: 'Usuarios',
          icon: '👥',
          requiresRole: 'admin', // Solo admin
        },
      },
      {
        path: 'properties',
        name: 'admin-properties',
        component: Properties,
        meta: {
          title: 'Propiedades',
          icon: '🏠',
        },
      },
      {
        path: 'contracts',
        name: 'admin-contracts',
        component: Contracts,
        meta: {
          title: 'Contratos',
          icon: '📄',
        },
      },
      {
        path: 'payments',
        name: 'admin-payments',
        component: Payments,
        meta: {
          title: 'Pagos',
          icon: '💳',
        },
      },
      {
        path: 'maintenances',
        name: 'admin-maintenances',
        component: Maintenances,
        meta: {
          title: 'Mantenimiento',
          icon: '🔧',
        },
      },
      {
        path: 'visits',
        name: 'admin-visits',
        component: Visits,
        meta: {
          title: 'Visitas',
          icon: '📅',
        },
      },
      {
        path: 'reports',
        name: 'admin-reports',
        component: Reports,
        meta: {
          title: 'Reportes',
          icon: '📈',
        },
      },
    ],
  },
];

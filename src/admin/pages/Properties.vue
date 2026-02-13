<template>
  <!-- AlertsContainer -->
  <AlertsContainer />

  <div class="properties-page">
    <!-- ==================== HEADER ==================== -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-wrapper">
            <font-awesome-icon :icon="['fas', 'home']" />
          </div>
          <div>
            <h1 class="page-title">Gestión de Propiedades</h1>
            <p class="page-subtitle">
              Administra y supervisa todas las propiedades publicadas en la plataforma
            </p>
          </div>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <font-awesome-icon :icon="['fas', 'plus']" />
          <span>Nueva Propiedad</span>
        </button>
      </div>
    </div>

    <!-- ==================== ESTADÍSTICAS ==================== -->
    <div class="stats-section" v-if="stats && !loadingStats">
      <div class="stats-grid">
        <!-- Total de Propiedades -->
        <div class="stat-card" :style="{ '--accent-color': '#2563eb' }">
          <div class="stat-header">
            <span class="stat-icon">
              <font-awesome-icon :icon="['fas', 'building']" />
            </span>
            <div class="stat-content">
              <div class="stat-label">Total Propiedades</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
          </div>
          <div class="stat-chart">
            <div class="stat-bar" :style="{ width: '100%' }"></div>
          </div>
        </div>

        <!-- Disponibles -->
        <div class="stat-card" :style="{ '--accent-color': '#059669' }">
          <div class="stat-header">
            <span class="stat-icon success">
              <font-awesome-icon :icon="['fas', 'check-circle']" />
            </span>
            <div class="stat-content">
              <div class="stat-label">Disponibles</div>
              <div class="stat-value">{{ stats.available }}</div>
            </div>
          </div>
          <div class="stat-chart">
            <div
              class="stat-bar"
              :style="{
                width: `${stats.total > 0 ? (stats.available / stats.total) * 100 : 0}%`,
              }"
            ></div>
          </div>
        </div>

        <!-- Pendientes de Aprobación -->
        <div class="stat-card" :style="{ '--accent-color': '#f59e0b' }">
          <div class="stat-header">
            <span class="stat-icon warning">
              <font-awesome-icon :icon="['fas', 'clock']" />
            </span>
            <div class="stat-content">
              <div class="stat-label">Pendientes</div>
              <div class="stat-value">{{ stats.pending_approval }}</div>
            </div>
          </div>
          <div class="stat-chart">
            <div
              class="stat-bar"
              :style="{
                width: `${stats.total > 0 ? (stats.pending_approval / stats.total) * 100 : 0}%`,
              }"
            ></div>
          </div>
        </div>

        <!-- Precio Promedio -->
        <div class="stat-card" :style="{ '--accent-color': '#8b5cf6' }">
          <div class="stat-header">
            <span class="stat-icon purple">
              <font-awesome-icon :icon="['fas', 'dollar-sign']" />
            </span>
            <div class="stat-content">
              <div class="stat-label">Precio Promedio</div>
              <div class="stat-value price">{{ formatPrice(stats.average_price) }}</div>
            </div>
          </div>
          <div class="stat-chart">
            <div class="stat-bar" :style="{ width: '75%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== FILTROS ==================== -->
    <div class="filters-section">
      <div class="filters-container">
        <!-- Buscador -->
        <div class="search-box">
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
          <input
            type="text"
            class="search-input"
            placeholder="Buscar por título, ciudad o propietario..."
            v-model="searchQuery"
            @input="handleSearchInput"
          />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>

        <!-- Controles de Filtro -->
        <div class="filter-controls">
          <!-- Filtro por Estado de Disponibilidad -->
          <div class="filter-group">
            <label class="filter-label">Estado</label>
            <select class="filter-select" v-model="filterStatus" @change="applyFilters">
              <option value="">Todos</option>
              <option value="available">Disponible</option>
              <option value="rented">Rentada</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>

          <!-- Filtro por Aprobación -->
          <div class="filter-group">
            <label class="filter-label">Aprobación</label>
            <select class="filter-select" v-model="filterApproval" @change="applyFilters">
              <option value="">Todas</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </select>
          </div>

          <!-- Filtro por Visibilidad -->
          <div class="filter-group">
            <label class="filter-label">Visibilidad</label>
            <select class="filter-select" v-model="filterVisibility" @change="applyFilters">
              <option value="">Todas</option>
              <option value="published">Publicada</option>
              <option value="hidden">Oculta</option>
            </select>
          </div>

          <!-- Botón Limpiar Filtros -->
          <button
            v-if="hasActiveFilters"
            class="btn-clear-filters"
            @click="clearFilters"
          >
            <font-awesome-icon :icon="['fas', 'times-circle']" />
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== TABLA DE PROPIEDADES ==================== -->
    <div class="table-section">
      <!-- LOADING STATE -->
      <div v-if="loading && properties.length === 0" class="loading-state">
        <font-awesome-icon :icon="['fas', 'spinner']" spin class="spinner-icon" />
        <p>Cargando propiedades...</p>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="error && properties.length === 0" class="error-state">
        <font-awesome-icon :icon="['fas', 'times-circle']" class="error-icon" />
        <h3>Error al cargar propiedades</h3>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="loadProperties">
          Reintentar
        </button>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="properties.length === 0" class="empty-state">
        <font-awesome-icon :icon="['fas', 'home']" class="empty-icon" />
        <h3 class="empty-title">No se encontraron propiedades</h3>
        <p class="empty-description">
          {{ hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Aún no hay propiedades registradas en el sistema' }}
        </p>
      </div>

      <!-- TABLA CON DATOS -->
      <div v-else class="table-container">
        <table class="properties-table">
          <thead>
            <tr>
              <th @click="toggleSort('id')" class="sortable">
                <div class="th-content">
                  <span>ID</span>
                  <font-awesome-icon 
                    :icon="['fas', getSortIcon('id')]" 
                    class="sort-icon"
                    :class="{ active: sortField === 'id' }"
                  />
                </div>
              </th>
              <th @click="toggleSort('title')" class="sortable">
                <div class="th-content">
                  <span>Propiedad</span>
                  <font-awesome-icon 
                    :icon="['fas', getSortIcon('title')]" 
                    class="sort-icon"
                    :class="{ active: sortField === 'title' }"
                  />
                </div>
              </th>
              <th>Ubicación</th>
              <th @click="toggleSort('monthly_price')" class="sortable">
                <div class="th-content">
                  <span>Precio</span>
                  <font-awesome-icon 
                    :icon="['fas', getSortIcon('monthly_price')]" 
                    class="sort-icon"
                    :class="{ active: sortField === 'monthly_price' }"
                  />
                </div>
              </th>
              <th>Estado</th>
              <th>Aprobación</th>
              <th @click="toggleSort('views')" class="sortable">
                <div class="th-content">
                  <span>Vistas</span>
                  <font-awesome-icon 
                    :icon="['fas', getSortIcon('views')]" 
                    class="sort-icon"
                    :class="{ active: sortField === 'views' }"
                  />
                </div>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="property in properties"
              :key="property.id"
              class="property-row"
            >
              <!-- ID -->
              <td>
                <span class="id-badge">#{{ property.id }}</span>
              </td>

              <!-- Propiedad (Imagen + Info) -->
              <td>
                <div class="property-cell">
                  <div class="property-avatar">
                    <img
                      v-if="property.image_url"
                      :src="property.image_url"
                      :alt="property.title"
                      class="avatar-img"
                      @error="handleImageError"
                    />
                    <div v-else class="avatar-placeholder">
                      <font-awesome-icon :icon="['fas', 'home']" />
                    </div>
                  </div>
                  <div class="property-info">
                    <div class="property-name">{{ truncate(property.title, 30) }}</div>
                    <div class="property-specs">
                      <span>
                        <font-awesome-icon :icon="['fas', 'bed']" />
                        {{ property.num_bedrooms }}
                      </span>
                      <span>
                        <font-awesome-icon :icon="['fas', 'bath']" />
                        {{ property.num_bathrooms }}
                      </span>
                      <span>
                        <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                        {{ property.area_m2 }}m²
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Ubicación -->
              <td>
                <div class="location-info">
                  <div class="city">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                    {{ property.city }}
                  </div>
                  <div class="address">{{ truncate(property.address, 25) }}</div>
                </div>
              </td>

              <!-- Precio -->
              <td>
                <div class="price-info">
                  <div class="price-amount">{{ formatPrice(property.monthly_price) }}</div>
                  <div class="price-period">/mes</div>
                </div>
              </td>

              <!-- Estado de Disponibilidad -->
              <td>
                <span 
                  class="badge status-badge"
                  :style="{
                    color: getStatusConfig(property.status).color,
                    background: getStatusConfig(property.status).bg
                  }"
                >
                  <font-awesome-icon :icon="['fas', getStatusConfig(property.status).icon]" />
                  {{ getStatusConfig(property.status).label }}
                </span>
              </td>

              <!-- Estado de Aprobación -->
              <td>
                <span 
                  class="badge approval-badge"
                  :style="{
                    color: getApprovalConfig(property.approval_status).color,
                    background: getApprovalConfig(property.approval_status).bg
                  }"
                >
                  <font-awesome-icon :icon="['fas', getApprovalConfig(property.approval_status).icon]" />
                  {{ getApprovalConfig(property.approval_status).label }}
                </span>
              </td>

              <!-- Vistas - AHORA CLICKEABLE -->
              <td>
                <div class="views-count clickable" @click="openDetailsModal(property)" title="Ver detalles">
                  <font-awesome-icon :icon="['fas', 'eye']" class="views-icon" />
                  <span class="views-number">{{ property.views || 0 }}</span>
                </div>
              </td>

              <!-- Acciones -->
              <td>
                <div class="action-buttons">
                  <!-- Aprobar (solo si está pendiente) -->
                  <button
                    v-if="property.approval_status === 'pending'"
                    class="btn-action btn-approve"
                    @click="approveProperty(property)"
                    title="Aprobar propiedad"
                    :disabled="statusUpdateLoading[property.id]"
                  >
                    <font-awesome-icon 
                      :icon="['fas', statusUpdateLoading[property.id] ? 'spinner' : 'check']" 
                      :spin="statusUpdateLoading[property.id]"
                    />
                  </button>

                  <!-- Rechazar (solo si está pendiente o aprobada) -->
                  <button
                    v-if="property.approval_status !== 'rejected'"
                    class="btn-action btn-reject"
                    @click="rejectProperty(property)"
                    title="Rechazar propiedad"
                    :disabled="statusUpdateLoading[property.id]"
                  >
                    <font-awesome-icon 
                      :icon="['fas', statusUpdateLoading[property.id] ? 'spinner' : 'ban']" 
                      :spin="statusUpdateLoading[property.id]"
                    />
                  </button>

                  <!-- Editar -->
                  <button
                    class="btn-action btn-edit"
                    @click="openEditModal(property)"
                    title="Editar propiedad"
                  >
                    <font-awesome-icon :icon="['fas', 'pen']" />
                  </button>

                  <!-- Eliminar -->
                  <button
                    class="btn-action btn-delete"
                    @click="confirmDeleteProperty(property)"
                    title="Eliminar propiedad"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- ==================== PAGINACIÓN ==================== -->
        <div v-if="pagination.lastPage > 1" class="pagination">
          <button 
            class="pagination-btn"
            :disabled="pagination.currentPage === 1 || paginationLoading"
            @click="changePage(pagination.currentPage - 1)"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
            Anterior
          </button>
          
          <div class="pagination-pages">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="pagination-page"
              :class="{ active: page === pagination.currentPage }"
              @click="changePage(page)"
              :disabled="page === '...' || paginationLoading"
            >
              {{ page }}
            </button>
          </div>
          
          <div class="pagination-info">
            Página {{ pagination.currentPage }} de {{ pagination.lastPage }}
            <span class="separator">|</span>
            {{ pagination.total }} propiedades
          </div>
          
          <button 
            class="pagination-btn"
            :disabled="pagination.currentPage === pagination.lastPage || paginationLoading"
            @click="changePage(pagination.currentPage + 1)"
          >
            Siguiente
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODALES -->
  <PropertyDetailsModal
    :show="detailsModalOpen"
    :property-id="selectedPropertyId"
    @close="closeDetailsModal"
    @edit="handleEditFromDetails"
  />

  <PropertyEditModal
    :show="editModalOpen"
    :property="selectedProperty"
    @close="closeEditModal"
    @saved="handlePropertySaved"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { propertyManagementService, type Property, type PropertyStats } from '../../services/propertyManagementService';
import { eventBus } from '../../events/eventBus';
import { useAlerts } from '../../composables/useAlerts';
import AlertsContainer from '../../components/AlertsContainer.vue';
import PropertyDetailsModal from '../components/Properties/PropertyDetailsModal.vue';
import PropertyEditModal from '../components/Properties/PropertyEditModal.vue';
import type {
  PropertyAvailabilityStatus,
  PropertyApprovalStatus,
  PropertyVisibility,
} from '../../types/property';


const { success, error: showError, confirm } = useAlerts();

// Estado
const properties = ref<Property[]>([]);
const stats = ref<PropertyStats | null>(null);
const loading = ref(true);
const loadingStats = ref(true);
const error = ref('');
const statusUpdateLoading = ref<Record<number, boolean>>({});
const paginationLoading = ref(false);

// Modales
const detailsModalOpen = ref(false);
const editModalOpen = ref(false);
const selectedPropertyId = ref<number | null>(null);
const selectedProperty = ref<Property | null>(null);

// Filtros individuales
const filterStatus = ref<PropertyAvailabilityStatus | ''>('');
const filterApproval = ref<PropertyApprovalStatus | ''>('');
const filterVisibility = ref<PropertyVisibility | ''>('');
const searchQuery = ref('');
const sortField = ref<'created_at' | string>('created_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Paginación
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  perPage: 10,
  total: 0,
});

// Computed
const hasActiveFilters = computed(() => 
  searchQuery.value !== '' || 
  filterStatus.value !== '' || 
  filterApproval.value !== '' || 
  filterVisibility.value !== ''
);

const visiblePages = computed(() => {
  const current = pagination.value.currentPage;
  const last = pagination.value.lastPage;
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  
  let prev = 0;
  for (const i of range) {
    if (prev) {
      if (i - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (i - prev !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    prev = i;
  }
  
  return rangeWithDots;
});

// Métodos de Modales
const openDetailsModal = (property: Property) => {
  selectedPropertyId.value = property.id;
  detailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  detailsModalOpen.value = false;
  selectedPropertyId.value = null;
};

const openCreateModal = () => {
  selectedProperty.value = null;
  editModalOpen.value = true;
};

const openEditModal = (property: Property) => {
  selectedProperty.value = property;
  editModalOpen.value = true;
};

const handleEditFromDetails = (property: Property) => {
  closeDetailsModal();
  openEditModal(property);
};

const closeEditModal = () => {
  editModalOpen.value = false;
  selectedProperty.value = null;
};

const handlePropertySaved = async (_property: Property) => {
  await loadProperties();
  await loadStats();
};

// Métodos de Carga
const loadProperties = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const filters = {
      search: searchQuery.value,
      status: filterStatus.value,
      approval_status: filterApproval.value,
      visibility: filterVisibility.value,
      page: pagination.value.currentPage,
      perPage: pagination.value.perPage,
      sortBy: sortField.value,
      sortOrder: sortOrder.value,
    };
    
    const response = await propertyManagementService.getProperties(filters);
    
    properties.value = response.data;
    pagination.value = {
      currentPage: response.meta.current_page,
      lastPage: response.meta.last_page,
      perPage: response.meta.per_page,
      total: response.meta.total,
    };
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar propiedades';
    showError('Error al cargar propiedades', 'Error');
    console.error('Error cargando propiedades:', err);
  } finally {
    loading.value = false;
    paginationLoading.value = false;
  }
};

const loadStats = async () => {
  try {
    loadingStats.value = true;
    stats.value = await propertyManagementService.getPropertyStats();
  } catch (err: any) {
    console.error('Error cargando estadísticas:', err);
    showError('Error cargando estadísticas', 'Error');
  } finally {
    loadingStats.value = false;
  }
};

let searchTimeout: ReturnType<typeof setTimeout>;
const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1;
    loadProperties();
  }, 500);
};

const clearSearch = () => {
  searchQuery.value = '';
  pagination.value.currentPage = 1;
  loadProperties();
};

const applyFilters = () => {
  pagination.value.currentPage = 1;
  loadProperties();
};

const clearFilters = () => {
  searchQuery.value = '';
  filterStatus.value = '';
  filterApproval.value = '';
  filterVisibility.value = '';
  pagination.value.currentPage = 1;
  loadProperties();
};

const toggleSort = (field: string) => {
  if (sortField.value !== field) {
    // Nueva columna → empieza en DESC
    sortField.value = field;
    sortOrder.value = 'desc';
  } else {
    // Misma columna → toggle
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  }

  pagination.value.currentPage = 1;
  loadProperties();
};


const getSortIcon = (field: string): string => {
  if (sortField.value !== field) {
    return 'sort'; // icono neutro
  }

  return sortOrder.value === 'asc'
    ? 'sort-up'
    : 'sort-down';
};


const changePage = (page: number | string) => {
  if (typeof page === 'string') return;
  if (page < 1 || page > pagination.value.lastPage || page === pagination.value.currentPage) {
    return;
  }
  paginationLoading.value = true;
  pagination.value.currentPage = page;
  loadProperties();
};

const approveProperty = async (property: Property) => {
  try {
    statusUpdateLoading.value[property.id] = true;
    
    await propertyManagementService.approveProperty(property.id);
    
    success('Propiedad aprobada correctamente', 'Éxito');
    
    const propertyIndex = properties.value.findIndex(p => p.id === property.id);
    if (propertyIndex !== -1) {
      properties.value[propertyIndex].approval_status = 'approved';
    }
    
    await loadStats();
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Error al aprobar propiedad';
    showError(errorMsg, 'Error');
    console.error('Error aprobando propiedad:', err);
  } finally {
    statusUpdateLoading.value[property.id] = false;
  }
};

const rejectProperty = async (property: Property) => {
  try {
    statusUpdateLoading.value[property.id] = true;
    
    await propertyManagementService.rejectProperty(property.id);
    
    success('Propiedad rechazada correctamente', 'Éxito');
    
    const propertyIndex = properties.value.findIndex(p => p.id === property.id);
    if (propertyIndex !== -1) {
      properties.value[propertyIndex].approval_status = 'rejected';
    }
    
    await loadStats();
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Error al rechazar propiedad';
    showError(errorMsg, 'Error');
    console.error('Error rechazando propiedad:', err);
  } finally {
    statusUpdateLoading.value[property.id] = false;
  }
};

const confirmDeleteProperty = (property: Property) => {
  confirm(
    `¿Estás seguro de que deseas eliminar la propiedad "${property.title}"? Esta acción no se puede deshacer.`,
    () => deleteProperty(property),
    undefined,
    {
      title: 'Confirmar Eliminación',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    }
  );
};

const deleteProperty = async (property: Property) => {
  try {
    statusUpdateLoading.value[property.id] = true;
    
    await propertyManagementService.deleteProperty(property.id);
    
    success('Propiedad eliminada correctamente', 'Éxito');
    
    properties.value = properties.value.filter(p => p.id !== property.id);
    
    await loadStats();
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Error al eliminar propiedad';
    showError(errorMsg, 'Error');
    console.error('Error eliminando propiedad:', err);
  } finally {
    statusUpdateLoading.value[property.id] = false;
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  if (img.parentElement) {
    img.parentElement.innerHTML = '<div class="avatar-placeholder"><font-awesome-icon icon="home" /></div>';
  }
};

const truncate = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatPrice = (price: number) => {
  return propertyManagementService.formatPrice(price);
};

const getStatusConfig = (status: string) => {
  const config = propertyManagementService.getStatusConfig(status as any);
  // Mapear iconos a Font Awesome
  const iconMap: Record<string, string> = {
    '✓': 'check-circle',
    '⏸': 'pause-circle',
    '🔧': 'wrench',
  };
  return {
    ...config,
    icon: iconMap[config.icon] || 'circle'
  };
};

const getApprovalConfig = (status?: PropertyApprovalStatus) => {
  const safeStatus: PropertyApprovalStatus = status ?? 'pending';

  const config = propertyManagementService.getApprovalConfig(safeStatus);

  const iconMap: Record<string, string> = {
    '⏳': 'clock',
    '✓': 'check-circle',
    '✕': 'times-circle',
  };

  return {
    ...config,
    icon: iconMap[config.icon] || 'circle',
  };
};

const handlePropertyCreated = () => {
  loadProperties();
  loadStats();
};

const handlePropertyUpdated = () => {
  loadProperties();
  loadStats();
};

const handlePropertyDeleted = () => {
  loadProperties();
  loadStats();
};

onMounted(() => {
  loadProperties();
  loadStats();
  
  eventBus.on('property:created', handlePropertyCreated);
  eventBus.on('property:updated', handlePropertyUpdated);
  eventBus.on('property:deleted', handlePropertyDeleted);
  eventBus.on('property:approved', handlePropertyUpdated);
  eventBus.on('property:rejected', handlePropertyUpdated);
});

onUnmounted(() => {
  eventBus.off('property:created', handlePropertyCreated);
  eventBus.off('property:updated', handlePropertyUpdated);
  eventBus.off('property:deleted', handlePropertyDeleted);
  eventBus.off('property:approved', handlePropertyUpdated);
  eventBus.off('property:rejected', handlePropertyUpdated);
});
</script>

<style scoped>
.properties-page {
  animation: fadeIn 0.3s ease;
  min-height: 100vh;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header mejorado */
.page-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.5rem;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Stats mejoradas */
.stats-section {
  margin-bottom: 2rem;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #ffffff;
    border: 1px solid #e5e7eb;
border-radius: 20px;
  padding: 1.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: var(--accent-color);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-header {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: var(--accent-color);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.stat-icon.success {
  background: #059669;
}

.stat-icon.warning {
  background: #f59e0b;
}

.stat-icon.purple {
  background: #8b5cf6;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #1f2937;
  line-height: 1;
}

.stat-value.price {
  font-size: 1.75rem;
}

.stat-chart {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  background: var(--accent-color);
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Filters mejorados */
.filters-section {
  margin-bottom: 2rem;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
}

.filters-container {
  background: #ffffff;
    border: 1px solid #e5e7eb;
border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
      border: 1px solid #e5e7eb;
border-radius: 20px;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  background: #f8fafc;
  color: #1f2937;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b251d;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 37, 29, 0.1);
}

.clear-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #64748b;
}

.clear-btn:hover {
  background: #dc2626;
  color: white;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.filter-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  background: #f8fafc;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: #3b251d;
}

.filter-select:focus {
  outline: none;
  border-color: #3b251d;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 37, 29, 0.1);
}

.btn-clear-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: 2px solid #dc2626;
  border-radius: 12px;
  background: #ffffff;
  color: #dc2626;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-clear-filters:hover {
  background: #dc2626;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Table mejorada */
.table-section {
  background: #ffffff;
    border: 1px solid #e5e7eb;
border-radius: 20px;
  overflow: hidden;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s backwards;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.spinner-icon,
.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.spinner-icon {
  color: #3b251d;
}

.error-icon {
  color: #dc2626;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem;
}

.empty-description {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  max-width: 500px;
}

.btn-retry {
  margin-top: 2rem;
  padding: 0.875rem 2rem;
  background: #3b251d;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-retry:hover {
  background: #8b6f47;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.table-container {
  overflow-x: auto;
}

.properties-table {
  width: 100%;
  min-width: 1000px;
  border-collapse: separate;
  border-spacing: 0;
}

.properties-table thead {
  background: #f1f5f9;
}

.properties-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.properties-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.properties-table th.sortable:hover {
  background: #e2e8f0;
  color: #1f2937;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  opacity: 0.4;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.sort-icon.active {
  opacity: 1;
  color: #3b251d;
}

.properties-table td {
  padding: 1.5rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.95rem;
  color: #1f2937;
  background: #ffffff;
}

.property-row {
  transition: all 0.2s ease;
  animation: fadeInRow 0.3s ease backwards;
}

@keyframes fadeInRow {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.property-row:hover td {
  background: #f8fafc;
}

.id-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f1f5f9;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  color: #64748b;
}

.property-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.property-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.avatar-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  border: 2px solid #e5e7eb;
}

.property-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.property-name {
  font-weight: 700;
  color: #1f2937;
  font-size: 1rem;
}

.property-specs {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
}

.property-specs span {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.city {
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.address {
  font-size: 0.875rem;
  color: #64748b;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-amount {
  font-weight: 800;
  color: #3b251d;
  font-size: 1.25rem;
}

.price-period {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.views-count {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-weight: 700;
  color: #1f2937;
}

.views-count.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.views-count.clickable:hover {
  background: #f1f5f9;
  color: #3b251d;
  transform: translateY(-2px);
}

.views-icon {
  color: #94a3b8;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.views-count.clickable:hover .views-icon {
  color: #3b251d;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 40px;
  height: 40px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s ease;
  color: #64748b;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action:disabled:hover {
  transform: none;
}

.btn-approve:hover {
  background: #059669;
  border-color: #059669;
  color: white;
}

.btn-reject:hover {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
}

/* Pagination mejorada */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 2px solid #e5e7eb;
  background: #f1f5f9;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #1f2937;
}

.pagination-btn:hover:not(:disabled) {
  background: #3b251d;
  color: white;
  border-color: #3b251d;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-page {
  min-width: 44px;
  height: 44px;
  padding: 0.5rem;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page:hover:not(:disabled):not(.active) {
  background: #f1f5f9;
  border-color: #3b251d;
  transform: translateY(-1px);
}

.pagination-page.active {
  background: #3b251d;
  color: white;
  border-color: #3b251d;
}

.pagination-page:disabled {
  cursor: default;
  opacity: 0.6;
}

.pagination-info {
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.separator {
  margin: 0 0.5rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 1024px) {
  .properties-page {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .properties-page {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .filter-controls {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .properties-table {
    min-width: 800px;
  }

  .pagination {
    flex-direction: column;
    gap: 1.5rem;
  }

  .pagination-btn,
  .pagination-pages,
  .pagination-info {
    width: 100%;
  }

  .pagination-pages {
    justify-content: center;
  }

  .pagination-info {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .properties-table {
    min-width: 700px;
  }

  .property-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

.table-container::-webkit-scrollbar {
  height: 10px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 5px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 5px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
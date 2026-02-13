<template>
  <div class="properties-view">
    <PropertyCarousel :properties="properties" :loading-properties="loadingProperties" />

    <!-- Componente de búsqueda -->
    <PropertySearch v-model="filters" />

    <!-- Main Container -->
    <div class="main-container">
      <!-- Properties Section -->
      <section class="properties-section">
        <div class="section-header">
          <div class="header-left">
            <h2 class="section-title">{{ $t('properties.section.title') }}</h2>
            <p class="section-subtitle">
              <span class="results-count">{{ paginatedProperties.length }}</span>
              {{ paginatedProperties.length === 1
                ? $t('properties.section.results.single')
                : $t('properties.section.results.multiple')
              }}
            </p>
          </div>

          <!-- 🔥 BOTÓN ADD PROPERTY CON AUTENTICACIÓN -->
          <transition name="fade-slide">
            <router-link v-if="isAuthenticated" to="/properties/create" class="btn-add-property">
              <div class="btn-icon-wrapper">
                <svg class="btn-plus-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </div>
              <span class="btn-text">{{ $t('properties.section.addProperty') }}</span>
              <div class="btn-shine"></div>
            </router-link>
          </transition>
        </div>

        <!-- 🎨 PROPERTIES GRID CON NUEVO CARD COMPONENT -->
        <transition-group name="stagger" tag="div" class="properties-grid" v-if="paginatedProperties.length">
          <article v-for="(property, index) in paginatedProperties" :key="property.id" class="property-card"
            :style="{ animationDelay: (index * 0.1) + 's' }" @click="goToDetail(property.id)">
            <!-- Card Glow Effect -->
            <div class="card-glow"></div>

            <!-- Image Section -->
            <div class="card-image-section">
              <div class="image-wrapper">
                <img :src="property.image_url || DEFAULT_PROPERTY_IMAGE" :alt="property.title" class="property-img"
                  @error="handleImageError" />
                <div class="image-gradient"></div>
              </div>

              <!-- Status Badge -->
              <div class="status-badge" :class="property.status">
                <span class="status-pulse"></span>
                <span class="status-text">{{ friendlyStatus(property.status) }}</span>
              </div>

              <!-- Action Buttons -->
              <div v-if="authUser?.id === property.user_id" class="action-buttons">
                <router-link :to="{ name: 'PropertyEdit', params: { id: property.id } }" class="action-btn edit-btn"
                  :title="$t('properties.card.edit')" @click.stop>
                  <span class="btn-icon">✏️</span>
                  <div class="btn-bg"></div>
                </router-link>
                <button @click.stop="deleteProperty(property.id)" class="action-btn delete-btn"
                  :title="$t('properties.card.delete')">
                  <span class="btn-icon">🗑️</span>
                  <div class="btn-bg"></div>
                </button>
              </div>

              <!-- Type Tag -->
              <div class="type-tag">
                <font-awesome-icon :icon="['fas', getTypeIcon(property.title)]" />
                <span class="type-text">{{ detectTypeTranslated(property.title) }}</span>
              </div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <!-- Header -->
              <div class="card-header">
                <div class="card-header-left">
                  <h3 class="card-title">{{ property.title }}</h3>
                  <div class="card-location">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                    <span class="location-text">{{ property.city }}</span>
                  </div>
                </div>
                <div class="card-header-right">
                  <span class="price-label-small">{{ $t('properties.card.priceLabel') }}</span>
                  <span class="price-value-header">
                    {{ formatPrice(property.monthly_price) }}
                  </span>
                  <span class="price-period-small">{{ $t('properties.card.perMonth') }}</span>
                </div>
              </div>

              <!-- Features -->
              <div class="features-container">
                <div class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('properties.card.features.area') }}</span>
                    <span class="feature-value">{{ property.area_m2 }} m²</span>
                  </div>
                </div>
                <div v-if="property.num_bedrooms" class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'bed']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('properties.card.features.bedrooms') }}</span>
                    <span class="feature-value">{{ property.num_bedrooms }}</span>
                  </div>
                </div>
                <div v-if="property.num_bathrooms" class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'bath']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('properties.card.features.bathrooms') }}</span>
                    <span class="feature-value">{{ property.num_bathrooms }}</span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="card-description">
                {{ truncateDescription(property.description) }}
              </p>

              <!-- Card Footer -->
              <div class="card-footer">
                <button class="btn-view-details" @click.stop="goToDetail(property.id)">
                  <span class="btn-text">{{ $t('properties.card.viewDetails') }}</span>
                  <span class="btn-arrow">→</span>
                  <div class="btn-hover-effect"></div>
                </button>
              </div>
            </div>

            <!-- Card Border Effect -->
            <div class="card-border-effect"></div>
          </article>
        </transition-group>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-animation">
            <div class="empty-icon-container">
              <svg class="empty-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <div class="icon-rings">
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>
                <div class="ring ring-3"></div>
              </div>
            </div>
          </div>
          <h3 class="empty-title">{{ $t('properties.empty.title') }}</h3>
          <p class="empty-message">
            {{ $t('properties.empty.message') }}
          </p>
          <button @click="clearFilters" class="btn-reset-search">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
              <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="btn-text">{{ $t('properties.empty.resetButton') }}</span>
            <div class="btn-ripple"></div>
          </button>
        </div>

        <!-- 📄 PAGINADOR INTEGRADO -->
        <Pagination
          v-if="filteredProperties.length > itemsPerPage"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filteredProperties.length"
          :items-per-page="itemsPerPage"
          @update:page="handlePageChange"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "../../services/api";
import PropertyCarousel from "./PropertyCarousel.vue";
import PropertySearch from "../../components/search/PropertySearch.vue";
import Pagination from "../../components/navigation/PaginationControls.vue";
import { usePropertyTypes } from "../../types/usePropertyTypes";

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=";

// ==================== Composables ====================
const router = useRouter();
const { t } = useI18n();
const { 
  detectTypeNormalized,
  detectTypeTranslated,
  getTypeIcon 
} = usePropertyTypes();

// ==================== State ====================
const authUser = ref(null);
const properties = ref([]);
const loadingProperties = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(9); // 3x3 grid

const filters = ref({
    search: "",
    city: "",
    type: "",
    maxPrice: null,
});

// ==================== Watchers ====================
// Resetear a página 1 cuando cambien los filtros
watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

// ==================== Computed ====================

const filteredProperties = computed(() => {
    return properties.value.filter((p) => {
        // 🔥 Usa detectTypeNormalized del composable
        const typeFromTitle = detectTypeNormalized(p.title);

        const matchSearch =
            !filters.value.search ||
            p.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
            p.description.toLowerCase().includes(filters.value.search.toLowerCase()) ||
            p.city.toLowerCase().includes(filters.value.search.toLowerCase());

        const matchCity =
            !filters.value.city ||
            p.city.toLowerCase().includes(filters.value.city.toLowerCase());

        const matchType =
            !filters.value.type || filters.value.type === typeFromTitle;

        const rawMax = filters.value.maxPrice;
        const matchPrice = !rawMax || Number(p.monthly_price) <= rawMax;

        return matchSearch && matchCity && matchType && matchPrice;
    });
});

const totalPages = computed(() => {
  return Math.ceil(filteredProperties.value.length / itemsPerPage.value);
});

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProperties.value.slice(start, end);
});

const availableCount = computed(() => {
    return properties.value.filter(p => p.status === 'available').length;
});

const citiesCount = computed(() => {
    return new Set(properties.value.map(p => p.city)).size;
});

// ==================== Methods ====================

const handlePageChange = (page) => {
  currentPage.value = page;
  // Scroll suave hacia el inicio de la sección
  const section = document.querySelector('.properties-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

const loadAuthUser = async () => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const { data } = await api.get("/auth/me");
            // 🔥 CORRECCIÓN: El backend devuelve { success: true, user: {...} }
            if (data.success && data.user) {
                authUser.value = data.user;
            } else if (data.id) {
                // Por si acaso el formato fuera directo
                authUser.value = data;
            }
            console.log('✅ Usuario autenticado:', authUser.value);
        }
    } catch (err) {
        console.error(t('properties.errors.loadUser'), err);
        authUser.value = null;
    }
};

const loadProperties = async () => {
    loadingProperties.value = true;
    try {
        const { data } = await api.get("/properties");
        
        // 🔥 CORRECCIÓN: El backend devuelve { data: [...], meta: {...} }
        if (Array.isArray(data.data)) {
            properties.value = data.data;
            console.log('✅ Propiedades cargadas:', properties.value.length);
        } else if (Array.isArray(data)) {
            // Por si el backend devuelve array directo
            properties.value = data;
            console.log('✅ Propiedades cargadas (formato alternativo):', properties.value.length);
        } else {
            console.warn('⚠️ Formato de respuesta inesperado:', data);
            properties.value = [];
        }
    } catch (err) {
        console.error(t('properties.errors.loadProperties'), err);
        properties.value = [];
    } finally {
        loadingProperties.value = false;
    }
};

const isAuthenticated = computed(() => {
  const hasLocalToken = !!localStorage.getItem('auth_token');
  const hasSessionToken = !!sessionStorage.getItem('auth_token');
  const hasUser = !!authUser.value;
  
  return hasLocalToken || hasSessionToken || hasUser;
});

const friendlyStatus = (s) => {
    if (!s) return t('properties.card.status.available');
    const statusKey = s.toString().trim().toLowerCase();
    
    const statusMap = {
        available: t('properties.card.status.available'),
        rented: t('properties.card.status.rented'),
        reserved: t('properties.card.status.reserved'),
        sold: t('properties.card.status.sold'),
        maintenance: t('properties.card.status.maintenance'),
    };
    
    return statusMap[statusKey] || t('properties.card.status.available');
};

const truncateDescription = (description, maxLength = 120) => {
    if (!description) return t('properties.empty.message');
    return description.length > maxLength
        ? description.substring(0, maxLength) + "..."
        : description;
};

const clearFilters = () => {
    filters.value = {
        search: "",
        city: "",
        type: "",
        maxPrice: null,
    };
    currentPage.value = 1;
};

const goToDetail = (id) => {
    router.push({ name: 'PropertyDetail', params: { id } });
};

const deleteProperty = async (id) => {
    if (!confirm(t('properties.delete.confirm'))) return;

    try {
        await api.delete(`/properties/${id}`);
        properties.value = properties.value.filter((p) => p.id !== id);
        // Ajustar página si la actual se queda vacía
        if (paginatedProperties.value.length === 0 && currentPage.value > 1) {
          currentPage.value--;
        }
        alert(t('properties.delete.success'));
    } catch (error) {
        console.error("Error eliminando propiedad:", error);
        alert(t('properties.delete.error'));
    }
};

const handleImageError = (event) => {
    event.target.src = DEFAULT_PROPERTY_IMAGE;
};

// ==================== Lifecycle ====================
onMounted(async () => {
    console.log('🚀 Iniciando carga de datos...');
    await loadAuthUser();
    await loadProperties();
    console.log('✅ Datos cargados completamente');
});
</script>

<style scoped>
@import "../../assets/css/Properties/PropertyView.css";
/* ==================== MAIN CONTAINER ==================== */


/* ==================== ADD PROPERTY BUTTON ==================== */
.btn-add-property {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.75rem;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  text-decoration: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 6px -1px rgba(59, 37, 29, 0.1),
    0 2px 4px -1px rgba(59, 37, 29, 0.06);
}

.btn-add-property:hover {
  transform: translateY(-2px);
  box-shadow:
    0 20px 25px -5px rgba(59, 37, 29, 0.2),
    0 10px 10px -5px rgba(59, 37, 29, 0.1);
}

.btn-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-add-property:hover .btn-icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.btn-plus-icon {
  width: 16px;
  height: 16px;
}

.btn-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.btn-add-property:hover .btn-shine {
  transform: translateX(100%);
}

/* Animación de entrada del botón */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* ==================== PROPERTIES GRID ==================== */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

/* Animación stagger para las cards */
@keyframes staggerFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.stagger-enter-active {
  animation: staggerFadeIn 0.5s ease-out forwards;
}

.stagger-leave-active {
  transition: all 0.3s ease;
}

.stagger-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.stagger-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==================== RESPONSIVE AJUSTES ==================== */
@media (max-width: 768px) {
  .properties-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .properties-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
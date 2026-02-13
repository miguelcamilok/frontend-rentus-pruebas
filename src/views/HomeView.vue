<template>
  <div class="container">
    <!-- Partículas de fondo animadas -->
    <div class="particles-background">
      <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
    </div>

    <!-- Hero Section Moderna -->
    <section class="modern-hero">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="hero-content-wrapper">
        <div class="hero-text-section" data-aos="fade-right">
          <div class="hero-badge">
            <font-awesome-icon :icon="['fas', 'star']" class="badge-icon" />
            <span>{{ $t('home.hero.badge') }}</span>
          </div>

          <h1 class="hero-title">
            {{ $t('home.hero.title') }}
            <span class="gradient-text"> {{ $t('home.hero.titleHighlight') }}</span>
            <br />{{ $t('home.hero.titleEnd') }}
          </h1>

          <p class="hero-description">
            {{ $t('home.hero.description') }}
          </p>

          <!-- Stats en el hero -->
          <div class="hero-stats-inline">
            <div class="stat-inline-item">
              <div class="stat-inline-icon">
                <font-awesome-icon :icon="['fas', 'home']" />
              </div>
              <div class="stat-inline-content">
                <div class="stat-inline-number">
                  <template v-if="loadingProperties">
                    <div class="mini-loader"></div>
                  </template>
                  <template v-else>{{ propertyCount.toLocaleString() }}+</template>
                </div>
                <div class="stat-inline-label">{{ $t('home.hero.stats.properties') }}</div>
              </div>
            </div>

            <div class="stat-inline-item">
              <div class="stat-inline-icon">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
              </div>
              <div class="stat-inline-content">
                <div class="stat-inline-number">
                  <template v-if="loadingProperties">
                    <div class="mini-loader"></div>
                  </template>
                  <template v-else>{{ activeClientsCount.toLocaleString() }}+</template>
                </div>
                <div class="stat-inline-label">{{ $t('home.hero.stats.clients') }}</div>
              </div>
            </div>

            <div class="stat-inline-item">
              <div class="stat-inline-icon">
                <font-awesome-icon :icon="['fas', 'star']" />
              </div>
              <div class="stat-inline-content">
                <div class="stat-inline-number">1+</div>
                <div class="stat-inline-label">{{ $t('home.hero.stats.experience') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Imagen decorativa con efecto -->
        <div class="hero-image-section" data-aos="fade-left">
          <div class="floating-card card-1">
            <font-awesome-icon :icon="['fas', 'home']" class="card-icon" />
            <div class="card-text">{{ $t('home.hero.floatingCards.verified') }}</div>
          </div>
          <div class="floating-card card-2">
            <font-awesome-icon :icon="['fas', 'star']" class="card-icon" />
            <div class="card-text">{{ $t('home.hero.floatingCards.rated') }}</div>
          </div>
          <div class="hero-image-placeholder">
            <div class="image-grid">
              <div class="grid-item item-1"></div>
              <div class="grid-item item-2"></div>
              <div class="grid-item item-3"></div>
              <div class="grid-item item-4"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Buscador Moderno Flotante -->
    <PropertySearch v-model="filters" />



    <!-- Propiedades Section -->
    <section class="properties-modern-section">
      <div class="properties-container">
        <div class="section-header-modern" data-aos="fade-up">
          <div class="header-content">
            <span class="section-subtitle-badge">
              <font-awesome-icon :icon="['fas', 'star']" />
              {{ $t('home.properties.badge') }}
            </span>
            <h2 class="section-title-modern">
              {{ $t('home.properties.title') }}
              <span class="gradient-text">{{ $t('home.properties.titleHighlight') }}</span>
            </h2>
            <p class="section-description">
              {{ $t('home.properties.description') }}
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingProperties" class="loading-modern" data-aos="fade-up">
          <div class="loading-spinner-modern"></div>
          <p>{{ $t('home.properties.loading') }}</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorProperties" class="error-modern" data-aos="fade-up">
          <font-awesome-icon :icon="['fas', 'times-circle']" class="error-icon" />
          <p>{{ errorProperties }}</p>
          <button @click="fetchAllData" class="retry-btn-modern">
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
            {{ $t('home.properties.retry') }}
          </button>
        </div>

        <!-- Grid de propiedades moderno -->
        <div v-else-if="displayedProperties.length > 0" class="properties-grid">
          <article v-for="(property, index) in displayedProperties" :key="property.id" class="property-card"
            :style="{ animationDelay: (index * 0.1) + 's' }" :data-aos="'fade-up'" :data-aos-delay="index * 100"
            @click="viewPropertyDetails(property)">
            <!-- Card Glow Effect -->
            <div class="card-glow"></div>

            <!-- Image Section -->
            <div class="card-image-section">
              <div class="image-wrapper">
                <img :src="property.image_url || DEFAULT_PROPERTY_IMAGE" :alt="property.title" class="property-img"
                  @error="onImgError" />
                <div class="image-gradient"></div>
              </div>

              <!-- Status Badge -->
              <div class="status-badge" :class="property.status">
                <span class="status-pulse"></span>
                <span class="status-text">{{ getStatusText(property.status) }}</span>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button class="action-btn fav-btn" @click.stop="toggleFavorite(property)"
                  :class="{ 'active': property.is_favorite }" :title="$t('home.properties.card.favorite')">
                  <span class="btn-icon">
                    <font-awesome-icon :icon="['fas', 'star']" />
                  </span>
                  <div class="btn-bg"></div>
                </button>
                <button class="action-btn share-btn" @click.stop="shareProperty(property)" :title="$t('home.properties.card.share')">
                  <span class="btn-icon">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </span>
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
                  <h3 class="card-title">{{ property.title || 'Propiedad exclusiva' }}</h3>
                  <div class="card-location">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                    <span class="location-text">{{ property.city }}</span>
                  </div>
                </div>
                <div class="card-header-right">
                  <span class="price-label-small">{{ $t('home.properties.card.priceLabel') }}</span>
                  <span class="price-value-header">
                    {{ formatPrice(property.monthly_price) }}
                  </span>
                  <span class="price-period-small">{{ $t('home.properties.card.perMonth') }}</span>
                </div>
              </div>

              <!-- Features -->
              <div class="features-container">
                <div class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('home.properties.card.features.area') }}</span>
                    <span class="feature-value">{{ property.area_m2 }} m²</span>
                  </div>
                </div>
                <div v-if="property.num_bedrooms" class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'bed']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('home.properties.card.features.bedrooms') }}</span>
                    <span class="feature-value">{{ property.num_bedrooms }}</span>
                  </div>
                </div>
                <div v-if="property.num_bathrooms" class="feature-item">
                  <div class="feature-modern">
                    <font-awesome-icon :icon="['fas', 'bath']" />
                  </div>
                  <div class="feature-content">
                    <span class="feature-label">{{ $t('home.properties.card.features.bathrooms') }}</span>
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
                <button class="btn-view-details" @click.stop="viewPropertyDetails(property)">
                  <span class="btn-text">{{ $t('home.properties.card.viewDetails') }}</span>
                  <span class="btn-arrow">→</span>
                  <div class="btn-hover-effect"></div>
                </button>
              </div>
            </div>

            <!-- Card Border Effect -->
            <div class="card-border-effect"></div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state-modern" data-aos="fade-up">
          <font-awesome-icon :icon="['fas', 'home']" class="empty-icon-modern" />
          <h3>{{ $t('home.properties.empty.title') }}</h3>
          <p>{{ $t('home.properties.empty.description') }}</p>
          <button @click="clearFilters" class="clear-filters-btn-modern">
            <font-awesome-icon :icon="['fas', 'times']" />
            {{ $t('home.properties.empty.clearFilters') }}
          </button>
        </div>

        <!-- Ver más -->
        <div v-if="!loadingProperties && filteredProperties.length > PROPERTIES_LIMIT" class="view-more-modern"
          data-aos="fade-up">
          <div class="view-more-info">
            <p>
              {{ $t('home.properties.viewMore.showing') }} <strong>{{ displayedProperties.length }}</strong> {{ $t('home.properties.viewMore.of') }}
              <strong>{{ filteredProperties.length }}</strong> {{ $t('home.properties.viewMore.properties') }}
            </p>
          </div>
          <button @click="goToProperties" class="view-all-btn-modern">
            <span>{{ $t('home.properties.viewMore.button') }}</span>
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </button>
        </div>
      </div>
    </section>

    <!-- CTA Section Moderna -->
    <section class="cta-modern-section" data-aos="fade-up">
      <div class="cta-background">
        <div class="cta-orb cta-orb-1"></div>
        <div class="cta-orb cta-orb-2"></div>
      </div>
      <div class="cta-content">
        <font-awesome-icon :icon="['fas', 'star']" class="cta-icon" />
        <h2>{{ $t('home.cta.title') }}</h2>
        <p>{{ $t('home.cta.description') }}</p>
        <div class="cta-buttons">
          <button class="cta-btn primary" @click="goToProperties">
            <span>{{ $t('home.cta.viewProperties') }}</span>
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </button>
          <button class="cta-btn secondary">
            <font-awesome-icon :icon="['fas', 'phone']" />
            <span>{{ $t('home.cta.contact') }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="modalOpen && selectedProperty" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-box" @click.stop>
          <button class="modal-close" @click="closeModal" type="button">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>

          <div class="modal-header">
            <div class="property-status-badge" :class="selectedProperty.status || 'available'">
              <span class="status-dot" :class="selectedProperty.status || 'available'"></span>
              {{ friendlyStatus(selectedProperty.status) }}
            </div>
            <h2 class="modal-title">{{ selectedProperty.title || 'Propiedad' }}</h2>
            <div class="property-price-highlight">
              <span class="price-amount">{{ formatPrice(selectedProperty.monthly_price) }}</span>
              <span class="price-period">{{ $t('home.properties.card.perMonth') }}</span>
            </div>
          </div>

          <div class="modal-gallery">
            <img :src="selectedProperty.image_url || DEFAULT_PROPERTY_IMAGE" class="modal-main-image"
              :alt="selectedProperty.title" @error="onImgError" />
            <div class="image-badge">
              <font-awesome-icon :icon="['fas', 'camera']" class="badge-icon" />
              <span class="badge-text">{{ $t('home.modal.gallery') }}</span>
            </div>
          </div>

          <div class="modal-details-grid">
            <div class="detail-card location-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ $t('home.modal.sections.location.title') }}</h3>
                <p class="card-text">{{ selectedProperty.address || $t('home.modal.sections.location.notAvailable') }}</p>
                <p class="card-subtext">{{ selectedProperty.city || '' }}</p>
              </div>
            </div>

            <div class="detail-card features-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'ruler-combined']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ $t('home.modal.sections.features.title') }}</h3>
                <div class="features-list">
                  <div class="feature">
                    <span class="feature-label">{{ $t('home.modal.sections.features.area') }}</span>
                    <span class="feature-value">{{ selectedProperty.area_m2 || 0 }} m²</span>
                  </div>
                  <div class="feature" v-if="selectedProperty.num_bedrooms">
                    <span class="feature-label">{{ $t('home.modal.sections.features.bedrooms') }}</span>
                    <span class="feature-value">{{ selectedProperty.num_bedrooms }}</span>
                  </div>
                  <div class="feature" v-if="selectedProperty.num_bathrooms">
                    <span class="feature-label">{{ $t('home.modal.sections.features.bathrooms') }}</span>
                    <span class="feature-value">{{ selectedProperty.num_bathrooms }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-card services-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ $t('home.modal.sections.services.title') }}</h3>
                <div class="services-tags" v-if="getServicesArray(selectedProperty.included_services).length > 0">
                  <span v-for="service in getServicesArray(selectedProperty.included_services)" :key="service"
                    class="service-tag">
                    {{ service.trim() }}
                  </span>
                </div>
                <p v-else class="no-services">{{ $t('home.modal.sections.services.none') }}</p>
              </div>
            </div>

            <div class="detail-card publication-card">
              <div class="card-icon">
                <font-awesome-icon :icon="['fas', 'calendar']" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ $t('home.modal.sections.publication.title') }}</h3>
                <p class="card-text">{{ formatModalDate(selectedProperty.publication_date) }}</p>
                <p class="card-subtext">{{ $t('home.modal.sections.publication.publishedAgo') }} {{ timeAgo(selectedProperty.publication_date) }}</p>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h3 class="section-title">{{ $t('home.modal.sections.description.title') }}</h3>
            <p class="description-text">{{ selectedProperty.description || $t('home.modal.sections.description.notAvailable') }}</p>
          </div>

          <div v-if="selectedProperty.lat && selectedProperty.lng" class="location-section">
            <div class="section-header">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                {{ $t('home.modal.sections.map.title') }}
              </h3>
              <button class="btn-map-preview" @click="viewOnMap(selectedProperty)" type="button">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="btn-icon" />
                <span class="btn-text">{{ $t('home.modal.sections.map.viewFullMap') }}</span>
              </button>
            </div>
            <div class="coordinates-display">
              <div class="coordinate">
                <span class="coordinate-label">{{ $t('home.modal.sections.map.latitude') }}</span>
                <span class="coordinate-value">{{ Number(selectedProperty.lat).toFixed(6) }}</span>
              </div>
              <div class="coordinate">
                <span class="coordinate-label">{{ $t('home.modal.sections.map.longitude') }}</span>
                <span class="coordinate-value">{{ Number(selectedProperty.lng).toFixed(6) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="no-location-section">
            <div class="no-location-icon">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
            </div>
            <p class="no-location-text">{{ $t('home.modal.sections.map.notRegistered') }}</p>
          </div>

          <div class="modal-actions">
            <button v-if="selectedProperty.status === 'available'" class="btn-request-visit"
              @click="openRequestVisitModal(selectedProperty)" type="button">
              <font-awesome-icon :icon="['fas', 'calendar']" class="btn-icon" />
              <span class="btn-text">{{ $t('home.modal.sections.actions.requestVisit') }}</span>
            </button>

            <div v-else class="unavailable-notice">
              <div class="notice-icon">
                <font-awesome-icon :icon="['fas', 'times-circle']" />
              </div>
              <div class="notice-content">
                <h4>{{ $t('home.modal.sections.actions.unavailable.title') }}</h4>
                <p>{{ $t('home.modal.sections.actions.unavailable.description') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    
    <RequestVisitModal :open="showRequestModal" :property="propertyForRequest" @close="showRequestModal = false"
      @success="handleVisitRequestSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import RequestVisitModal from "../components/modals/ModalRequest/RequestVisitModal.vue";
import PropertySearch from '../components/search/PropertySearch.vue';
import { usePropertyTypes } from '../types/usePropertyTypes';  
import api from "../services/api";

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+";

// ==================== Composables ====================
const { t } = useI18n();
const router = useRouter();
const { 
  detectTypeNormalized,
  detectTypeTranslated,
  getTypeIcon 
} = usePropertyTypes();

// ==================== State ====================
const properties = ref<any[]>([]);
const selectedProperty = ref<any>(null);
const propertyForRequest = ref<any>(null);
const showRequestModal = ref(false);
const loadingProperties = ref(false);
const errorProperties = ref<string | null>(null);
const activeClientsCount = ref(0);
const propertyCount = ref(0);
const modalOpen = ref(false);

const PROPERTIES_LIMIT = 4;

const filters = ref({
  search: '',
  city: '',
  type: '',
  maxPrice: null as number | null
});

// ==================== Computed ====================

const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    // 🔥 Usa detectTypeNormalized del composable para comparar
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

const displayedProperties = computed(() => {
  const featured = filteredProperties.value.filter(p => p.featured);
  const regular = filteredProperties.value.filter(p => !p.featured);
  return [...featured, ...regular].slice(0, PROPERTIES_LIMIT);
});

// ==================== Methods ====================

function onImgError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img && img.src !== DEFAULT_PROPERTY_IMAGE) {
    img.src = DEFAULT_PROPERTY_IMAGE;
    img.onerror = null;
  }
}

const clearFilters = () => {
  filters.value = {
    search: "",
    city: "",
    type: "",
    maxPrice: null,
  };
};

const openRequestVisitModal = (property: any) => {
  if (!property) return;
  propertyForRequest.value = property;
  showRequestModal.value = true;
  closeModal();
};

const handleVisitRequestSuccess = () => {
  showRequestModal.value = false;
  console.log('Solicitud de visita enviada con éxito');
};

const closeModal = () => {
  modalOpen.value = false;
  selectedProperty.value = null;
  document.body.classList.remove("modal-open");
};

const viewOnMap = (property: any) => {
  closeModal();
  router.push({ name: 'MapView', params: { id: property.id } });
};

const friendlyStatus = (s: string) => {
  if (!s) return t('home.properties.card.status.available');
  const statusKey = s.toString().trim().toLowerCase();
  
  const statusMap: Record<string, string> = {
    available: t('home.properties.card.status.available'),
    rented: t('home.properties.card.status.rented'),
    reserved: t('home.properties.card.status.reserved'),
    sold: t('home.properties.card.status.sold'),
    maintenance: t('home.properties.card.status.maintenance'),
  };
  
  return statusMap[statusKey] || t('home.properties.card.status.available');
};

const formatModalDate = (dateString: string) => {
  if (!dateString) return t('home.modal.sections.location.notAvailable');
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const timeAgo = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'hoy';
  if (diffInDays === 1) return 'ayer';
  if (diffInDays < 7) return `hace ${diffInDays} días`;
  if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `hace ${Math.floor(diffInDays / 30)} meses`;
  return `hace ${Math.floor(diffInDays / 365)} años`;
};

async function fetchAllData() {
  loadingProperties.value = true;
  errorProperties.value = null;

  try {
    const [propRes, usersRes] = await Promise.all([
      api.get("/properties"),
      api.get("/users")
    ]);
    
    // Manejar diferentes formatos de respuesta
    // Formato 1: Respuesta directa (array)
    // Formato 2: Respuesta con data y meta
    
    // Para propiedades
    if (propRes.data && Array.isArray(propRes.data)) {
      properties.value = propRes.data;
    } else if (propRes.data && propRes.data.data && Array.isArray(propRes.data.data)) {
      properties.value = propRes.data.data;
    } else {
      properties.value = [];
    }
    
    propertyCount.value = properties.value.length;
    
    // Para usuarios
    if (usersRes.data && Array.isArray(usersRes.data)) {
      activeClientsCount.value = usersRes.data.length;
    } else if (usersRes.data && usersRes.data.data && Array.isArray(usersRes.data.data)) {
      activeClientsCount.value = usersRes.data.data.length;
    } else {
      activeClientsCount.value = 0;
    }
    
  } catch (error) {
    console.error("Error cargando datos:", error);
    errorProperties.value = t('home.properties.error');
    propertyCount.value = 0;
    activeClientsCount.value = 0;
  } finally {
    loadingProperties.value = false;
  }
}

function formatPrice(price: number) {
  if (!price) return "Consultar precio";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(price);
}

function truncateDescription(description: string, maxLength: number = 120) {
  if (!description) return t('home.modal.sections.description.notAvailable');
  return description.length > maxLength
    ? description.substring(0, maxLength) + "..."
    : description;
}

function getStatusText(status: string) {
  if (!status) return t('home.properties.card.status.available');
  const key = status.toString().trim().toLowerCase();

  const map: Record<string, string> = {
    "disponible": t('home.properties.card.status.available'),
    "ocupado": t('home.properties.card.status.reserved'),
    "en mantenimiento": t('home.properties.card.status.maintenance'),
    "vendido": t('home.properties.card.status.sold'),
    "arrendada": t('home.properties.card.status.rented'),
    "available": t('home.properties.card.status.available'),
    "reserved": t('home.properties.card.status.reserved'),
    "sold": t('home.properties.card.status.sold'),
    "rented": t('home.properties.card.status.rented'),
    "maintenance": t('home.properties.card.status.maintenance')
  };

  return map[key] || t('home.properties.card.status.available');
}

function getServicesArray(services: any) {
  if (!services) return [];

  if (Array.isArray(services)) {
    return services;
  }

  if (typeof services === 'string') {
    return services.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  return [];
}

function viewPropertyDetails(property: any) {
  router.push({ name: 'PropertyDetail', params: { id: property.id } });
}

function goToProperties() {
  router.push("/propiedades");
}

function toggleFavorite(property: any) {
  property.is_favorite = !property.is_favorite;
}

function shareProperty(property: any) {
  console.log("Compartir", property.title);
}

function getParticleStyle(_n: number) {
  const duration = 15 + Math.random() * 20;
  const delay = Math.random() * 5;
  const size = 4 + Math.random() * 8;

  return {
    left: `${Math.random() * 100}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    width: `${size}px`,
    height: `${size}px`
  };
}

// ==================== Lifecycle ====================
onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
@import "../assets/css/HomeView.css";
</style>
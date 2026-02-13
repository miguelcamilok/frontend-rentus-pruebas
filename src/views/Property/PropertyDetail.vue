<template>
  <div class="property-detail-page">
    <!-- Background decorativo -->
    <div class="page-background"></div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <font-awesome-icon :icon="['fas', 'spinner']" spin />
      </div>
      <p class="loading-text">{{ t('property.loadingDetails') }}</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
      </div>
      <h2>{{ t('property.notFound') }}</h2>
      <p>{{ error }}</p>
      <button @click="router.push('/')" class="btn-back">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        {{ t('property.backHome') }}
      </button>
    </div>
    
    <!-- Property Content -->
    <div v-else-if="property" class="property-content">
      <!-- Hero Section con imagen -->
      <div class="hero-section">
        <div class="hero-overlay"></div>
        
        <!-- Navegación de breadcrumb flotante -->
        <div class="breadcrumb-floating">
          <router-link to="/" class="breadcrumb-item">
            <font-awesome-icon :icon="['fas', 'home']" />
          </router-link>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="breadcrumb-separator" />
          <router-link to="/propiedades" class="breadcrumb-item">{{ t('property.properties') }}</router-link>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="breadcrumb-separator" />
          <span class="breadcrumb-current">{{ property.title }}</span>
        </div>
        
        <!-- Galería de imágenes -->
        <div class="hero-gallery">
          <transition name="fade" mode="out-in">
            <img :key="currentImageIndex" :src="currentImage" :alt="property.title" @error="onImgError"
              class="hero-image" />
          </transition>
          
          <!-- Controles de galería -->
          <div class="gallery-controls" v-if="propertyImages.length > 1">
            <button @click="previousImage" class="gallery-btn prev" :disabled="currentImageIndex === 0">
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <button @click="nextImage" class="gallery-btn next"
              :disabled="currentImageIndex === propertyImages.length - 1">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
          
          <!-- Contador de imágenes -->
          <div class="image-counter">
            <font-awesome-icon :icon="['fas', 'images']" />
            <span>{{ currentImageIndex + 1 }} / {{ propertyImages.length }}</span>
          </div>
          
          <!-- Badge de estado -->
          <div class="status-badge" :class="`status-${property.status}`">
            <font-awesome-icon :icon="getStatusIcon(property.status)" />
            <span>{{ t(`property.status.${property.status}`) }}</span>
          </div>
          
          <!-- Thumbnails -->
          <div class="thumbnails-bar" v-if="propertyImages.length > 1">
            <div v-for="(image, index) in propertyImages" :key="index" @click="currentImageIndex = index"
              class="thumbnail-item" :class="{ active: currentImageIndex === index }">
              <img :src="image" :alt="t('property.imageAlt', { index: index + 1 })" @error="onImgError" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="main-content">
        <div class="content-grid">
          <!-- Columna Principal -->
          <div class="main-column">
            <!-- Header de la propiedad -->
            <div class="property-header">
              <div class="header-tags">
                <span class="tag tag-type">
                  <font-awesome-icon :icon="['fas', getTypeIcon(property)]" />
                  <span class="type-text">{{ getTypeTranslated(property) }}</span>
                </span>
                <span v-if="property.featured" class="tag tag-featured">
                  <font-awesome-icon :icon="['fas', 'star']" />
                  {{ t('property.featured') }}
                </span>
                <span v-if="property.new_construction" class="tag tag-new">
                  <font-awesome-icon :icon="['fas', 'hard-hat']" />
                  {{ t('property.new') }}
                </span>
                <span v-if="property.pet_friendly" class="tag tag-pet">
                  <font-awesome-icon :icon="['fas', 'paw']" />
                  {{ t('property.petFriendly') }}
                </span>
              </div>
              
              <h1 class="property-title">{{ property.title }}</h1>
              
              <div class="property-location">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="location-icon" />
                <span>{{ property.address }}, {{ property.city }}</span>
              </div>
              
              <div class="property-price-banner">
                <div class="price-main">
                  <span class="price-label">{{ t('property.monthlyPrice') }}</span>
                  <span class="price-amount">{{ formatPrice(property.monthly_price) }}</span>
                </div>
                <div class="price-deposit" v-if="property.deposit_amount">
                  <span class="deposit-label">{{ t('property.deposit') }}</span>
                  <span class="deposit-amount">{{ formatPrice(property.deposit_amount) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Características principales -->
            <div class="features-showcase">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'list-check']" />
                {{ t('property.mainFeatures') }}
              </h2>
              
              <div class="features-grid-main">
                <div class="feature-card" v-if="property.area_m2">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.area_m2 }}</span>
                    <span class="feature-label">{{ t('property.areaM2') }}</span>
                  </div>
                </div>
                
                <div class="feature-card" v-if="property.num_bedrooms">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'bed']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.num_bedrooms }}</span>
                    <span class="feature-label">{{ t('property.bedrooms') }}</span>
                  </div>
                </div>
                
                <div class="feature-card" v-if="property.num_bathrooms">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'bath']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.num_bathrooms }}</span>
                    <span class="feature-label">{{ t('property.bathrooms') }}</span>
                  </div>
                </div>
                
                <div class="feature-card" v-if="property.parking_spaces">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'car']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.parking_spaces }}</span>
                    <span class="feature-label">{{ t('property.parkingSpaces') }}</span>
                  </div>
                </div>
                
                <div class="feature-card" v-if="property.floor_number">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'building']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ t('property.floor', { number: property.floor_number }) }}</span>
                    <span class="feature-label">{{ t('property.floorLabel') }}</span>
                  </div>
                </div>
                
                <div class="feature-card" v-if="property.year_built">
                  <div class="feature-icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'calendar']" />
                  </div>
                  <div class="feature-details">
                    <span class="feature-value">{{ property.year_built }}</span>
                    <span class="feature-label">{{ t('property.yearBuilt') }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Descripción -->
            <div class="description-section">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'file-alt']" />
                {{ t('property.description') }}
              </h2>
              <div class="description-content">
                <p>{{ property.description || t('property.noDescription') }}</p>
              </div>
            </div>
            
            <!-- Servicios incluidos -->
            <div class="services-section" v-if="getServicesArray(property.included_services).length > 0">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
                {{ t('property.includedServices') }}
              </h2>
              <div class="services-grid">
                <div v-for="service in getServicesArray(property.included_services)" :key="service"
                  class="service-item">
                  <font-awesome-icon :icon="['fas', 'check']" class="service-icon" />
                  <span>{{ service }}</span>
                </div>
              </div>
            </div>
            
            <!-- Mapa -->
            <div class="map-section" v-if="property.lat && property.lng">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'map']" />
                {{ t('property.mapLocation') }}
              </h2>
              <div class="map-container">
                <MapView :id="property.id" :lat="property.lat" :lng="property.lng" :owner-id="property.user_id" />
              </div>
              <div class="map-coordinates">
                <font-awesome-icon :icon="['fas', 'location-dot']" />
                <span>{{ Number(property.lat).toFixed(6) }}, {{ Number(property.lng).toFixed(6) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Sidebar -->
          <div class="sidebar-column">
            <!-- Card de contacto -->
            <div class="contact-card">
              <div class="contact-header">
                <h3>{{ t('property.contact.header') }}</h3>
                <p>{{ t('property.contact.subHeader') }}</p>
              </div>
              
              <div class="contact-actions">
                <!-- Si es el propietario -->
                <template v-if="authUser?.id && property?.user_id && authUser.id === property.user_id">
                  <div class="btn-action btn-owner">
                    <font-awesome-icon :icon="['fas', 'crown']" />
                    <span>{{ t('property.contact.ownerProperty') }}</span>
                  </div>
                  
                  <!-- Botones de gestión del propietario -->
                  <div class="owner-actions">
                    <button @click="editProperty" class="btn-action btn-edit">
                      <font-awesome-icon :icon="['fas', 'edit']" />
                      <span>{{ t('property.contact.editProperty') }}</span>
                    </button>
                    <button @click="deleteProperty" class="btn-action btn-delete">
                      <font-awesome-icon :icon="['fas', 'trash-alt']" />
                      <span>{{ t('property.contact.deleteProperty') }}</span>
                    </button>
                  </div>
                </template>
                
                <!-- Si NO es el propietario -->
                <template v-else>
                  <button v-if="property?.status === 'available' && isAuthenticated" @click="openRequestVisitModal"
                    class="btn-action btn-primary">
                    <font-awesome-icon :icon="['fas', 'calendar-check']" />
                    <span>{{ t('property.contact.requestVisit') }}</span>
                  </button>
                  
                  <button v-else-if="property?.status === 'available' && !isAuthenticated" @click="openRequestVisitModal"
                    class="btn-action btn-login">
                    <font-awesome-icon :icon="['fas', 'sign-in-alt']" />
                    <span>{{ t('property.contact.login') }}</span>
                  </button>
                  
                  <div v-else class="unavailable-alert">
                    <font-awesome-icon :icon="['fas', 'ban']" />
                    <div>
                      <strong>{{ t('property.contact.notAvailable') }}</strong>
                      <p>{{ t('property.contact.notAvailableDesc') }}</p>
                    </div>
                  </div>
                </template>
                
                <button @click="contactAgent" class="btn-action btn-secondary">
                  <font-awesome-icon :icon="['fas', 'phone']" />
                  <span>{{ t('property.contact.contactAgent') }}</span>
                </button>
                
                <div class="secondary-actions">
                  <button @click="toggleFavorite" class="btn-icon-action" :class="{ active: isFavorite }">
                    <font-awesome-icon :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']" />
                    <span>{{ isFavorite ? t('property.contact.saved') : t('property.contact.save') }}</span>
                  </button>
                  <button @click="shareProperty" class="btn-icon-action">
                    <font-awesome-icon :icon="['fas', 'share-alt']" />
                    <span>{{ t('property.contact.share') }}</span>
                  </button>
                </div>
              </div>
              
              <!-- Información adicional -->
              <div class="property-meta">
                <div class="meta-row">
                  <font-awesome-icon :icon="['fas', 'clock']" />
                  <span>{{ t('property.meta.published') }} {{ timeAgo(property.publication_date) }}</span>
                </div>
                <div class="meta-row">
                  <font-awesome-icon :icon="['fas', 'eye']" />
                  <span>{{ property.views || 0 }} {{ t('property.meta.views') }}</span>
                </div>
                <div class="meta-row">
                  <font-awesome-icon :icon="['fas', 'hashtag']" />
                  <span>{{ t('property.meta.id') }}: {{ property.id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de solicitud de visita -->
    <RequestVisitModal :open="showRequestModal" :property="property" @close="showRequestModal = false"
      @success="handleVisitRequestSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RequestVisitModal from '../../components/modals/ModalRequest/RequestVisitModal.vue'
import MapView from '../../components/modals/Maps/MapView.vue'
import api from '../../services/api'
import { useI18n } from 'vue-i18n'

const { t, tm, locale } = useI18n()
const router = useRouter()
const route = useRoute()

// State
const property = ref(null)
const loading = ref(true)
const error = ref(null)
const currentImageIndex = ref(0)
const isFavorite = ref(false)
const showRequestModal = ref(false)
const authUser = ref(null)

const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4="

// Computed
const isAuthenticated = computed(() => {
  return !!localStorage.getItem("auth_token") || !!sessionStorage.getItem("auth_token")
})

// 🔥 CORRECCIÓN: Construir array de imágenes desde property.images
const propertyImages = computed(() => {
  if (!property.value) return [DEFAULT_IMAGE]
  
  const images = []
  
  // 🔥 NUEVA LÓGICA: Priorizar property.images (relación hasMany)
  if (property.value.images && Array.isArray(property.value.images) && property.value.images.length > 0) {
    // Ordenar por 'order' y extraer image_url
    const sortedImages = [...property.value.images].sort((a, b) => a.order - b.order)
    images.push(...sortedImages.map(img => img.image_url))
  } 
  // Fallback: usar image_url principal si existe
  else if (property.value.image_url && property.value.image_url.trim() !== '') {
    images.push(property.value.image_url)
  }
  
  // Si no hay imágenes, retornar default
  return images.length > 0 ? images : [DEFAULT_IMAGE]
})

const currentImage = computed(() => {
  return propertyImages.value[currentImageIndex.value] || DEFAULT_IMAGE
})

// Methods
function checkAuthentication() {
  let userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
  if (userStr) {
    try {
      authUser.value = JSON.parse(userStr)
    } catch (e) {
      authUser.value = null
    }
  }
}

async function fetchProperty() {
  const propertyId = route.params.id
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get(`/properties/${propertyId}`)
    
    // Manejar estructura de respuesta del backend
    if (response.data.success && response.data.data) {
      property.value = response.data.data
    } else if (response.data.data) {
      property.value = response.data.data
    } else {
      property.value = response.data
    }
    
    console.log('✅ Propiedad cargada:', property.value)
    console.log('📸 Imágenes disponibles:', property.value.images)
    
    // Incrementar vistas
    await api.post(`/properties/${propertyId}/view`)
  } catch (err) {
    console.error('Error al cargar la propiedad:', err)
    error.value = err.response?.data?.message || 'No se pudo cargar la propiedad'
  } finally {
    loading.value = false
  }
}

function onImgError(event) {
  console.warn('❌ Error cargando imagen:', event.target.src)
  event.target.src = DEFAULT_IMAGE
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function nextImage() {
  if (currentImageIndex.value < propertyImages.value.length - 1) {
    currentImageIndex.value++
  }
}

function openRequestVisitModal() {
  if (!isAuthenticated.value) {
    const confirmLogin = confirm(t('property.contact.loginRequired'))
    if (confirmLogin) {
      localStorage.setItem('redirectAfterLogin', route.fullPath)
      router.push({ name: 'Login' })
    }
    return
  }
  showRequestModal.value = true
}

const detectType = (propertyData) => {
  if (!propertyData) return 'otro';
  if (propertyData.type) return propertyData.type;
  
  const title = propertyData.title || '';
  const tTitle = title.toLowerCase();
  
  if (tTitle.includes("casa")) return 'casa';
  if (tTitle.includes("apartamento") || tTitle.includes("apto")) return 'apartamento';
  if (tTitle.includes("local")) return 'local';
  if (tTitle.includes("finca")) return 'finca';
  return 'otro';
};

const getTypeTranslated = (propertyData) => {
  const type = detectType(propertyData);
  
  const typeMap = {
    casa: t('property.type.casa'),
    apartamento: t('property.type.apartamento'),
    local: t('property.type.local'),
    finca: t('property.type.finca'),
    otro: t('property.type.otro'),
  };
  
  return typeMap[type] || t('property.type.otro');
};

const getTypeIcon = (propertyData) => {
  if (!propertyData) return "home";
  
  const type = propertyData.type || '';
  
  if (type === 'casa') return "home";
  if (type === 'apartamento') return "building";
  if (type === 'local') return "store";
  if (type === 'finca') return "tree";
  
  const title = propertyData.title || '';
  const t = title.toLowerCase();
  if (t.includes("casa")) return "home";
  if (t.includes("apartamento") || t.includes("apto")) return "building";
  if (t.includes("local")) return "store";
  if (t.includes("finca")) return "tree";
  return "home";
};

function handleVisitRequestSuccess() {
  showRequestModal.value = false
  alert(t('visitRequest.success'))
}

function contactAgent() {
  alert(t('property.contact.agentContact'))
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
}

function shareProperty() {
  if (navigator.share && property.value) {
    navigator.share({
      title: property.value.title,
      text: t('property.contact.shareText', { title: property.value.title }),
      url: window.location.href,
    }).catch(err => console.log('Error al compartir:', err))
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert(t('property.contact.linkCopied'))
  }
}

function editProperty() {
  router.push({
    name: 'PropertyEdit',
    params: { id: property.value.id }
  })
}

async function deleteProperty() {
  const confirmDelete = confirm(t('property.contact.deleteConfirm'))
  if (!confirmDelete) return
  
  const confirmFinal = confirm(t('property.contact.deleteFinalConfirm'))
  if (!confirmFinal) return
  
  try {
    loading.value = true
    await api.delete(`/properties/${property.value.id}`)
    alert(t('property.contact.deleteSuccess'))
    router.push({ name: 'PropertyView' })
  } catch (err) {
    console.error('Error al eliminar la propiedad:', err)
    
    let errorMessage = t('property.contact.deleteError')
    if (err.response?.status === 403) {
      errorMessage = t('property.contact.deleteNoPermission')
    } else if (err.response?.status === 404) {
      errorMessage = t('property.contact.deleteNotFound')
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

function getServicesArray(services) {
  if (!services) return []
  if (Array.isArray(services)) return services
  if (typeof services === 'string') {
    return services.split(',').map(s => s.trim()).filter(s => s.length > 0)
  }
  return []
}

function formatPrice(price) {
  if (!price) return t('property.askPrice')
  const isEN = locale.value.startsWith('en')
  return new Intl.NumberFormat(
    isEN ? 'en-US' : 'es-CO',
    {
      style: 'currency',
      currency: isEN ? 'USD' : 'COP',
      minimumFractionDigits: 0
    }
  ).format(price)
}

function getStatusText(status) {
  const statusMap = {
    available: t('property.status.available'),
    rented: t('property.status.rented'),
    reserved: t('property.status.reserved'),
    sold: t('property.status.sold'),
    maintenance: t('property.status.maintenance'),
  }
  return statusMap[status] || t('property.status.available')
}

function getStatusIcon(status) {
  const iconMap = {
    available: ['fas', 'check-circle'],
    rented: ['fas', 'times-circle'],
    reserved: ['fas', 'clock'],
    sold: ['fas', 'lock'],
    maintenance: ['fas', 'tools'],
  }
  return iconMap[status] || ['fas', 'info-circle']
}

function getTypeText(type) {
  const typeMap = {
    casa: 'Casa',
    apartamento: 'Apartamento',
    local: 'Local Comercial',
    finca: 'Finca',
  }
  return typeMap[type] || 'Propiedad'
}

function timeAgo(dateString) {
  if (!dateString) return ''
  const diff = Math.floor((Date.now() - new Date(dateString)) / 86400000)
  if (diff === 0) return t('time.today')
  if (diff === 1) return t('time.yesterday')
  if (diff < 7) return t('time.daysAgo', diff)
  if (diff < 30) return t('time.weeksAgo', Math.floor(diff / 7))
  if (diff < 365) return t('time.monthsAgo', Math.floor(diff / 30))
  return t('time.yearsAgo', Math.floor(diff / 365))
}

// Lifecycle
onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  checkAuthentication()
  fetchProperty()
})
</script>

<style scoped>
@import "../../assets/css/Properties/PropertyDetail.css";
</style>
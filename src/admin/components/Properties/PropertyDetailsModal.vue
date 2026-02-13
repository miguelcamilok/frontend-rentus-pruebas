<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container" @click.stop>
          <!-- Header del Modal -->
          <div class="modal-header">
            <div class="header-left">
              <div class="icon-wrapper">
                <font-awesome-icon :icon="['fas', 'home']" />
              </div>
              <div>
                <h2 class="modal-title">Detalles de Propiedad</h2>
                <p class="modal-subtitle">Información completa de la propiedad</p>
              </div>
            </div>
            <button class="btn-close" @click="closeModal" aria-label="Cerrar">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>

          <!-- Cuerpo del Modal -->
          <div class="modal-body">
            <div v-if="loading" class="loading-state">
              <font-awesome-icon :icon="['fas', 'spinner']" spin class="spinner-icon" />
              <p>Cargando detalles...</p>
            </div>

            <div v-else-if="property" class="property-details">
              <!-- Imagen Principal -->
              <div class="property-image-section">
                <img
                  v-if="property.image_url"
                  :src="property.image_url"
                  :alt="property.title"
                  class="property-image"
                  @error="handleImageError"
                />
                <div v-else class="image-placeholder">
                  <font-awesome-icon :icon="['fas', 'home']" />
                </div>

                <!-- Badges superpuestos -->
                <div class="image-badges">
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
                </div>
              </div>

              <!-- Información General -->
              <div class="info-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'info-circle']" />
                  Información General
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Título</span>
                    <span class="info-value">{{ property.title }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">ID</span>
                    <span class="info-value">#{{ property.id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Ciudad</span>
                    <span class="info-value">
                      <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="icon-inline" />
                      {{ property.city }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Dirección</span>
                    <span class="info-value">{{ property.address }}</span>
                  </div>
                </div>
              </div>

              <!-- Descripción -->
              <div class="info-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'align-left']" />
                  Descripción
                </h3>
                <p class="description-text">{{ property.description }}</p>
              </div>

              <!-- Características -->
              <div class="info-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'th-list']" />
                  Características
                </h3>
                <div class="specs-grid">
                  <div class="spec-card">
                    <font-awesome-icon :icon="['fas', 'bed']" class="spec-icon" />
                    <div class="spec-info">
                      <span class="spec-label">Habitaciones</span>
                      <span class="spec-value">{{ property.num_bedrooms }}</span>
                    </div>
                  </div>
                  <div class="spec-card">
                    <font-awesome-icon :icon="['fas', 'bath']" class="spec-icon" />
                    <div class="spec-info">
                      <span class="spec-label">Baños</span>
                      <span class="spec-value">{{ property.num_bathrooms }}</span>
                    </div>
                  </div>
                  <div class="spec-card">
                    <font-awesome-icon :icon="['fas', 'ruler-combined']" class="spec-icon" />
                    <div class="spec-info">
                      <span class="spec-label">Área</span>
                      <span class="spec-value">{{ property.area_m2 }}m²</span>
                    </div>
                  </div>
                  <div class="spec-card">
                    <font-awesome-icon :icon="['fas', 'eye']" class="spec-icon" />
                    <div class="spec-info">
                      <span class="spec-label">Vistas</span>
                      <span class="spec-value">{{ property.views || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Precio -->
              <div class="info-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'dollar-sign']" />
                  Precio
                </h3>
                <div class="price-display">
                  <span class="price-amount">{{ formatPrice(property.monthly_price) }}</span>
                  <span class="price-period">/mes</span>
                </div>
              </div>

              <!-- Servicios Incluidos -->
              <div v-if="property.included_services && property.included_services.length > 0" class="info-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'list-check']" />
                  Servicios Incluidos
                </h3>
                <div class="services-list">
                  <span
                    v-for="(service, index) in property.included_services"
                    :key="index"
                    class="service-tag"
                  >
                    <font-awesome-icon :icon="['fas', 'check']" />
                    {{ service }}
                  </span>
                </div>
              </div>

              <!-- Propietario -->
              <div v-if="property.user" class="info-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'user']" />
                  Propietario
                </h3>
                <div class="owner-card">
                  <div class="owner-avatar">
                    <img
                      v-if="property.user.photo"
                      :src="property.user.photo"
                      :alt="property.user.name"
                      class="avatar-img"
                    />
                    <div v-else class="avatar-placeholder">
                      <font-awesome-icon :icon="['fas', 'user']" />
                    </div>
                  </div>
                  <div class="owner-info">
                    <div class="owner-name">{{ property.user.name }}</div>
                    <div class="owner-email">
                      <font-awesome-icon :icon="['fas', 'envelope']" class="icon-inline" />
                      {{ property.user.email }}
                    </div>
                    <div v-if="property.user.phone" class="owner-phone">
                      <font-awesome-icon :icon="['fas', 'phone']" class="icon-inline" />
                      {{ property.user.phone }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fechas -->
              <div class="info-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'calendar']" />
                  Fechas
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Publicación</span>
                    <span class="info-value">{{ formatDate(property.publication_date) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Creación</span>
                    <span class="info-value">{{ formatDate(property.created_at) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Última actualización</span>
                    <span class="info-value">{{ formatDate(property.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer del Modal -->
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal">
              <font-awesome-icon :icon="['fas', 'times']" />
              Cerrar
            </button>
            <button class="btn-primary" @click="editProperty">
              <font-awesome-icon :icon="['fas', 'pen']" />
              Editar Propiedad
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { propertyManagementService } from '../../../services/propertyManagementService';
import type { Property, PropertyApprovalStatus } from '../../../types/property';

interface Props {
  show: boolean;
  propertyId: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', property: Property): void;
}>();

const property = ref<Property | null>(null);
const loading = ref(false);

watch(() => props.show, async (newShow) => {
  if (newShow && props.propertyId) {
    await loadPropertyDetails();
  }
});

const loadPropertyDetails = async () => {
  if (!props.propertyId) return;

  loading.value = true;
  try {
    // Usar el servicio de property management
    const response = await propertyManagementService.getProperty(props.propertyId);
    property.value = response;
  } catch (error: any) {
    console.error('Error cargando detalles:', error);
    // Mostrar error al usuario si es necesario
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit('close');
};

const editProperty = () => {
  if (property.value) {
    emit('edit', property.value);
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

const formatPrice = (price: number) => {
  return propertyManagementService.formatPrice(price);
};

const formatDate = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusConfig = (status: string) => {
  const config = propertyManagementService.getStatusConfig(status as any);
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
</script>

<style scoped>
/* Modal Base */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.modal-container {
  background: #ffffff;
  border-radius: 24px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 2px solid #e5e7eb;
  background: #f8fafc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.modal-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.btn-close {
  width: 44px;
  height: 44px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #64748b;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
  transform: rotate(90deg);
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner-icon {
  font-size: 3rem;
  color: #3b251d;
  margin-bottom: 1rem;
}

/* Property Details */
.property-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.property-image-section {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
  color: white;
}

.image-badges {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
  align-items: flex-end;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Info Sections */
.info-section {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.icon-inline {
  margin-right: 0.375rem;
  color: #94a3b8;
}

.description-text {
  font-size: 1rem;
  line-height: 1.75;
  color: #475569;
  margin: 0;
  white-space: pre-wrap;
}

/* Specs Grid */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.spec-card {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.spec-card:hover {
  border-color: #3b251d;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.spec-icon {
  font-size: 2rem;
  color: #3b251d;
}

.spec-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spec-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.spec-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
}

/* Price Display */
.price-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  width: fit-content;
}

.price-amount {
  font-size: 3rem;
  font-weight: 900;
}

.price-period {
  font-size: 1.25rem;
  font-weight: 600;
  opacity: 0.9;
}

/* Services List */
.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.service-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

/* Owner Card */
.owner-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
}

.owner-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  border: 3px solid #e5e7eb;
}

.owner-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.owner-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.owner-email,
.owner-phone {
  font-size: 0.95rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #e5e7eb;
  background: #f8fafc;
}

.btn-secondary,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background: #ffffff;
  color: #64748b;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #1f2937;
}

.btn-primary {
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 10px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 5px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 5px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .property-image-section {
    height: 300px;
  }

  .specs-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .price-amount {
    font-size: 2rem;
  }
}
</style>
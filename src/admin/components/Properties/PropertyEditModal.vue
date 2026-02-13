<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container" @click.stop>
          <!-- Header del Modal -->
          <div class="modal-header">
            <div class="header-left">
              <div class="icon-wrapper">
                <font-awesome-icon :icon="['fas', 'pen']" />
              </div>
              <div>
                <h2 class="modal-title">
                  {{ isCreateMode ? 'Crear Nueva Propiedad' : 'Editar Propiedad' }}
                </h2>
                <p class="modal-subtitle">
                  {{ isCreateMode ? 'Completa los datos de la nueva propiedad' : 'Modifica los datos de la propiedad' }}
                </p>
              </div>
            </div>
            <button class="btn-close" @click="closeModal" aria-label="Cerrar">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>

          <!-- Cuerpo del Modal -->
          <div class="modal-body">
            <form @submit.prevent="submitForm" class="property-form">
              <!-- Información Básica -->
              <div class="form-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'info-circle']" />
                  Información Básica
                </h3>
                <div class="form-grid">
                  <!-- Asignar Usuario (solo en modo creación y admin) -->
                  <div v-if="isCreateMode" class="form-group full-width">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'user']" class="label-icon" />
                      Asignar a Usuario *
                    </label>
                    <select v-model="formData.user_id" class="form-select" required>
                      <option value="">Selecciona un usuario</option>
                      <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.name }} - {{ user.email }}
                      </option>
                    </select>
                    <p v-if="loadingUsers" class="helper-text">
                      <font-awesome-icon :icon="['fas', 'spinner']" spin />
                      Cargando usuarios...
                    </p>
                  </div>

                  <div class="form-group full-width">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'heading']" class="label-icon" />
                      Título *
                    </label>
                    <input v-model="formData.title" type="text" class="form-input"
                      placeholder="Ej: Casa moderna de 3 habitaciones" required />
                  </div>

                  <div class="form-group full-width">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'align-left']" class="label-icon" />
                      Descripción *
                    </label>
                    <textarea v-model="formData.description" class="form-textarea"
                      placeholder="Describe los detalles de la propiedad..." rows="4" required></textarea>
                  </div>
                </div>
              </div>

              <!-- Ubicación -->
              <div class="form-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                  Ubicación y Tipo
                </h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'home']" class="label-icon" />
                      Tipo de Propiedad *
                    </label>
                    <select v-model="formData.type" class="form-select" required>
                      <option value="">Selecciona un tipo</option>
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="local">Local Comercial</option>
                      <option value="finca">Finca</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'city']" class="label-icon" />
                      Ciudad *
                    </label>
                    <input v-model="formData.city" type="text" class="form-input" placeholder="Ej: Popayán" required />
                  </div>

                  <div class="form-group full-width">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'map']" class="label-icon" />
                      Dirección *
                    </label>
                    <input v-model="formData.address" type="text" class="form-input" placeholder="Ej: Calle 5 #10-20"
                      required />
                  </div>
                </div>
              </div>

              <!-- Características -->
              <div class="form-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'th-list']" />
                  Características
                </h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'bed']" class="label-icon" />
                      Habitaciones *
                    </label>
                    <input v-model.number="formData.num_bedrooms" type="number" class="form-input" placeholder="0"
                      min="0" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'bath']" class="label-icon" />
                      Baños *
                    </label>
                    <input v-model.number="formData.num_bathrooms" type="number" class="form-input" placeholder="0"
                      min="0" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'ruler-combined']" class="label-icon" />
                      Área (m²) *
                    </label>
                    <input v-model.number="formData.area_m2" type="number" class="form-input" placeholder="0" min="0"
                      step="0.01" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'dollar-sign']" class="label-icon" />
                      Precio Mensual *
                    </label>
                    <input v-model="displayPrice" type="text" class="form-input" placeholder="0"
                      @input="handlePriceInput" @blur="formatPriceOnBlur" required />
                    <p class="helper-text">
                      {{ formattedPrice }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Estado -->
              <div class="form-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'cog']" class="label-icon" />
                  Estado y Configuración
                </h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'toggle-on']" class="label-icon" />
                      Estado de Disponibilidad
                    </label>
                    <select v-model="formData.status" class="form-select">
                      <option value="available">Disponible</option>
                      <option value="rented">Rentada</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'eye']" class="label-icon" />
                      Visibilidad
                    </label>
                    <select v-model="formData.visibility" class="form-select">
                      <option value="published">Publicada</option>
                      <option value="hidden">Oculta</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Imagen -->
              <div class="form-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'image']" class="label-icon" />
                  Imagen de la Propiedad
                </h3>
                <div class="form-grid">
                  <!-- Subir archivo -->
                  <div class="form-group full-width">
                    <label class="form-label">
                      <font-awesome-icon :icon="['fas', 'upload']" class="label-icon" />
                      Subir Imagen desde PC (Opcional)
                    </label>
                    <div class="image-upload-wrapper">
                      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/jpg,image/webp"
                        class="file-input" @change="handleImageUpload" />
                      <button type="button" class="btn-upload" @click="triggerFileInput">
                        <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" />
                        Seleccionar Imagen
                      </button>
                      <p v-if="imageFileName" class="file-name">
                        <font-awesome-icon :icon="['fas', 'check-circle']" class="success-icon" />
                        {{ imageFileName }}
                        <button type="button" class="btn-remove-file" @click="removeImage">
                          <font-awesome-icon :icon="['fas', 'times']" />
                        </button>
                      </p>
                    </div>
                    <p class="helper-text">
                      Formatos aceptados: JPG, PNG, WEBP. Máximo 10MB
                    </p>
                  </div>

                  <!-- Preview de imagen -->
                  <div v-if="imagePreview || formData.image_url" class="form-group full-width">
                    <label class="form-label">Vista Previa</label>
                    <div class="image-preview">
                      <img :src="imagePreview || formData.image_url" alt="Preview" @error="handleImageError" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Servicios Incluidos -->
              <div class="form-section">
                <h3 class="section-title">
                  <font-awesome-icon :icon="['fas', 'list-check']" class="label-icon" />
                  Servicios Incluidos
                </h3>
                <div class="services-manager">
                  <div class="service-input-group">
                    <input v-model="newService" type="text" class="form-input"
                      placeholder="Agregar servicio (ej: Agua, Luz, Internet...)"
                      @keypress.enter.prevent="addService" />
                    <button type="button" class="btn-add-service" @click="addService" :disabled="!newService.trim()">
                      <font-awesome-icon :icon="['fas', 'plus']" />
                      Agregar
                    </button>
                  </div>
                  <div v-if="formData.included_services.length > 0" class="services-list">
                    <div v-for="(service, index) in formData.included_services" :key="index" class="service-tag">
                      <span>{{ service }}</span>
                      <button type="button" class="btn-remove-service" @click="removeService(index)">
                        <font-awesome-icon :icon="['fas', 'times']" />
                      </button>
                    </div>
                  </div>
                  <p v-else class="no-services">
                    No hay servicios agregados. Haz clic en "Agregar" para incluir servicios.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer del Modal -->
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal" :disabled="saving">
              <font-awesome-icon :icon="['fas', 'times']" />
              Cancelar
            </button>
            <button type="button" class="btn-primary" @click="submitForm" :disabled="saving">
              <font-awesome-icon :icon="['fas', saving ? 'spinner' : 'save']" :spin="saving" />
              {{ saving ? 'Guardando...' : (isCreateMode ? 'Continuar →' : 'Guardar Cambios') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal de Confirmación de Ubicación -->
  <PropertyLocationModal :show="showLocationModal" :property-data="{
    title: formData.title,
    city: formData.city,
    address: formData.address
  }" @confirm="handleLocationConfirm" @close="handleLocationCancel" />
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { propertyManagementService } from '../../../services/propertyManagementService';
import { userManagementService } from '../../../services/userManagementService';
import { useAlerts } from '../../../composables/useAlerts';
import PropertyLocationModal from './PropertyLocationModa.vue';
import type {
  Property,
  PropertyAvailabilityStatus,
  PropertyVisibility,
} from '../../../types/property';

interface Props {
  show: boolean;
  property: Property | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', property: Property): void;
}>();

const { success, error: showError } = useAlerts();

const isCreateMode = computed(() => !props.property);

// Precio formateado en texto
const formattedPrice = computed(() => {
  if (!formData.value.monthly_price || formData.value.monthly_price === 0) {
    return 'COP $0';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(formData.value.monthly_price);
});

const saving = ref(false);
const newService = ref('');
const imageBase64 = ref<string | null>(null); // 🔥 Guardamos la imagen en base64
const imageFileName = ref<string | null>(null); // 🔥 Nombre del archivo
const imagePreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Precio con formato
const displayPrice = ref('');

// Modal de ubicación
const showLocationModal = ref(false);
const tempPropertyData = ref<any>(null);

// Usuarios para asignar
const users = ref<Array<{ id: number; name: string; email: string }>>([]);
const loadingUsers = ref(false);

interface PropertyFormData {
  user_id: number | null;
  title: string;
  description: string;
  address: string;
  city: string;
  type: string; // 🔥 NUEVO
  status: PropertyAvailabilityStatus;
  visibility: PropertyVisibility;
  monthly_price: number;
  area_m2: number;
  num_bedrooms: number;
  num_bathrooms: number;
  included_services: string[];
  image_url: string;
}

const formData = ref<PropertyFormData>({
  user_id: null,
  title: '',
  description: '',
  address: '',
  city: '',
  type: 'otro', // 🔥 NUEVO
  status: 'available',
  visibility: 'published',
  monthly_price: 0,
  area_m2: 0,
  num_bedrooms: 0,
  num_bathrooms: 0,
  included_services: [],
  image_url: '',
});

// Cargar usuarios al montar el componente
onMounted(async () => {
  if (isCreateMode.value) {
    await loadUsers();
  }
});

const loadUsers = async () => {
  try {
    loadingUsers.value = true;
    const response = await userManagementService.getUsers({ perPage: 1000 });
    users.value = response.data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email
    }));
  } catch (err: any) {
    console.error('Error cargando usuarios:', err);
    showError('Error al cargar usuarios', 'Error');
  } finally {
    loadingUsers.value = false;
  }
};

watch(() => props.show, (newShow) => {
  if (newShow) {
    if (props.property) {
      // Modo edición - cargar datos existentes
      formData.value = {
        user_id: props.property.user_id || null,
        title: props.property.title || '',
        description: props.property.description || '',
        address: props.property.address || '',
        city: props.property.city || '',
        type: props.property.type || 'otro', // 🔥 NUEVO
        status: props.property.status || 'available',
        visibility: props.property.visibility || 'published',
        monthly_price: props.property.monthly_price || 0,
        area_m2: props.property.area_m2 || 0,
        num_bedrooms: props.property.num_bedrooms || 0,
        num_bathrooms: props.property.num_bathrooms || 0,
        included_services: Array.isArray(props.property.included_services)
          ? [...props.property.included_services]
          : [],
        image_url: props.property.image_url || '',
      };

      // Inicializar displayPrice con formato
      displayPrice.value = formatNumber(props.property.monthly_price || 0);
    } else {
      // Modo creación - limpiar formulario y cargar usuarios
      resetForm();
      loadUsers();
    }
    // Limpiar imagen seleccionada
    imageBase64.value = null;
    imageFileName.value = null;
    imagePreview.value = null;
  }
});

const resetForm = () => {
  formData.value = {
    user_id: null,
    title: '',
    description: '',
    address: '',
    city: '',
    type: 'otro', // 🔥 NUEVO
    status: 'available',
    visibility: 'published',
    monthly_price: 0,
    area_m2: 0,
    num_bedrooms: 0,
    num_bathrooms: 0,
    included_services: [],
    image_url: '',
  };
  newService.value = '';
  imageBase64.value = null;
  imageFileName.value = null;
  imagePreview.value = null;
  displayPrice.value = '';
};

const addService = () => {
  const service = newService.value.trim();
  if (service && !formData.value.included_services.includes(service)) {
    formData.value.included_services.push(service);
    newService.value = '';
  }
};

const removeService = (index: number) => {
  formData.value.included_services.splice(index, 1);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

// 🔥 MANEJO DE IMAGEN COMO EN PROFILEVIEW
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showError('Formato no válido. Usa JPG, PNG, GIF o WEBP', 'Formato inválido');
    return;
  }

  // Validar tamaño (10MB máximo)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    showError('La imagen es muy grande. Máximo 10MB', 'Error de tamaño');
    return;
  }

  imageFileName.value = file.name;

  // 🔥 CONVERTIR A BASE64 COMO EN PROFILEVIEW
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    imageBase64.value = result; // Guardar base64 completo (data:image/jpeg;base64,...)
    imagePreview.value = result; // Mostrar preview
  };
  reader.readAsDataURL(file);

  // Limpiar image_url si había una URL
  formData.value.image_url = '';
};

const removeImage = () => {
  imageBase64.value = null;
  imageFileName.value = null;
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

/**
 * Formatear número con puntos de miles
 */
const formatNumber = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Manejar input de precio en tiempo real
 */
const handlePriceInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // Remover todo excepto números
  value = value.replace(/[^\d]/g, '');

  // Convertir a número
  const numericValue = parseInt(value) || 0;

  // Actualizar valor real
  formData.value.monthly_price = numericValue;

  // Actualizar display con formato
  displayPrice.value = formatNumber(numericValue);

  // Mover cursor al final
  setTimeout(() => {
    input.setSelectionRange(displayPrice.value.length, displayPrice.value.length);
  }, 0);
};

/**
 * Formatear precio al perder el foco
 */
const formatPriceOnBlur = () => {
  if (formData.value.monthly_price > 0) {
    displayPrice.value = formatNumber(formData.value.monthly_price);
  } else {
    displayPrice.value = '';
  }
};

/**
 * Handler para confirmación de ubicación
 */
const handleLocationConfirm = async (locationData: { lat: number; lng: number; accuracy: number }) => {
  // Guardar propiedad con datos de ubicación
  await saveProperty(locationData);
};

/**
 * Handler para cancelar modal de ubicación
 */
const handleLocationCancel = () => {
  showLocationModal.value = false;
  tempPropertyData.value = null;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
};

const closeModal = () => {
  if (!saving.value) {
    emit('close');
  }
};

const submitForm = async () => {
  // Validación adicional para modo creación
  if (isCreateMode.value && !formData.value.user_id) {
    showError('Debes seleccionar un usuario para asignar la propiedad', 'Error');
    return;
  }

  // ⭐ NUEVO: En modo creación, primero mostrar modal de ubicación
  if (isCreateMode.value) {
    // Guardar datos del formulario temporalmente
    tempPropertyData.value = { ...formData.value };

    // Abrir modal de ubicación
    showLocationModal.value = true;
    return; // No guardar todavía
  }

  // Si es modo edición, guardar normalmente
  await saveProperty();
};

const saveProperty = async (locationData?: { lat: number; lng: number; accuracy: number }) => {
  saving.value = true;

  try {
    let savedProperty: Property;

    // 🔥 PREPARAR DATOS COMO EN PROFILEVIEW
    const dataToSend: any = {
      title: formData.value.title,
      description: formData.value.description,
      address: formData.value.address,
      city: formData.value.city,
      type: formData.value.type, // 🔥 NUEVO
      status: formData.value.status,
      visibility: formData.value.visibility,
      monthly_price: formData.value.monthly_price,
      area_m2: formData.value.area_m2,
      num_bedrooms: formData.value.num_bedrooms,
      num_bathrooms: formData.value.num_bathrooms,
      included_services: JSON.stringify(formData.value.included_services),
    };

    // Usuario (solo en modo creación)
    if (isCreateMode.value && formData.value.user_id) {
      dataToSend.user_id = formData.value.user_id;
    }

    // Ubicación (si viene del modal)
    if (locationData) {
      dataToSend.lat = locationData.lat;
      dataToSend.lng = locationData.lng;
      dataToSend.accuracy = locationData.accuracy;
    }

    // 🔥 IMAGEN EN BASE64 (como en ProfileView)
    if (imageBase64.value) {
      dataToSend.image_url = imageBase64.value; // Enviar base64 completo
    } else if (formData.value.image_url && !imageBase64.value) {
      // Si no hay nueva imagen pero sí URL existente, mantenerla
      dataToSend.image_url = formData.value.image_url;
    }

    if (isCreateMode.value) {
      savedProperty = await propertyManagementService.createProperty(dataToSend);
      success('Propiedad creada exitosamente', 'Éxito');
    } else {
      savedProperty = await propertyManagementService.updateProperty(
        props.property!.id,
        dataToSend
      );
      success('Propiedad actualizada exitosamente', 'Éxito');
    }

    emit('saved', savedProperty);
    emit('close');

    // Cerrar modal de ubicación si estaba abierto
    showLocationModal.value = false;
  } catch (err: any) {
    console.error('Error guardando propiedad:', err);
    const errorMsg = err.response?.data?.message || err.message || 'Error al guardar la propiedad';
    showError(errorMsg, 'Error');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
/* [Mantener todos los estilos existentes] */

/* Nuevos estilos para upload de imagen */
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-input {
  display: none;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
}

.btn-upload:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #3b251d;
  color: #3b251d;
}

.btn-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #166534;
  margin: 0;
}

.success-icon {
  color: #22c55e;
  font-size: 1.25rem;
}

.btn-remove-file {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.75rem;
}

.btn-remove-file:hover {
  background: #b91c1c;
  transform: scale(1.1);
}

.image-preview {
  width: 100%;
  max-width: 400px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.helper-text {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  font-style: italic;
}

/* [Copiar todos los demás estilos del archivo original] */

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

/* Form Sections */
.property-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
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
  margin: 0 0 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.label-icon {
  color: #64748b;
  font-size: 0.875rem;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  background: #ffffff;
  color: #1f2937;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b251d;
  box-shadow: 0 0 0 4px rgba(59, 37, 29, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-select {
  cursor: pointer;
}

/* Services Manager */
.services-manager {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.service-input-group {
  display: flex;
  gap: 0.75rem;
}

.service-input-group .form-input {
  flex: 1;
}

.btn-add-service {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #3b251d;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add-service:hover:not(:disabled) {
  background: #8b6f47;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-add-service:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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

.btn-remove-service {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.75rem;
}

.btn-remove-service:hover {
  background: #b91c1c;
  transform: scale(1.1);
}

.no-services {
  font-size: 0.875rem;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
  padding: 1rem;
  background: #ffffff;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  text-align: center;
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

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #1f2937;
}

.btn-primary {
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .service-input-group {
    flex-direction: column;
  }

  .btn-add-service {
    width: 100%;
    justify-content: center;
  }
}
</style>
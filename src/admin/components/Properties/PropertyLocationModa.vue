<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="location-modal-overlay" @click.self="handleCancel">
        <div class="location-modal-container" @click.stop>
          <!-- Header -->
          <div class="location-modal-header">
            <div class="header-content">
              <div class="icon-wrapper">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              </div>
              <div>
                <h2 class="modal-title">Confirmar Ubicación de la Propiedad</h2>
                <p class="modal-subtitle">
                  Ajusta el marcador para la ubicación exacta
                </p>
              </div>
            </div>
            <button class="btn-close" @click="handleCancel" :disabled="saving">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>

          <!-- Info de la propiedad -->
          <div class="property-info-bar">
            <div class="info-item">
              <font-awesome-icon :icon="['fas', 'home']" class="info-icon" />
              <span>{{ propertyData.title }}</span>
            </div>
            <div class="info-item">
              <font-awesome-icon :icon="['fas', 'city']" class="info-icon" />
              <span>{{ propertyData.city }}</span>
            </div>
            <div class="info-item">
              <font-awesome-icon :icon="['fas', 'map']" class="info-icon" />
              <span>{{ propertyData.address }}</span>
            </div>
          </div>

          <!-- Mapa -->
          <div class="map-section">
            <div id="location-confirm-map" class="location-map"></div>
            
            <!-- Controles de ayuda -->
            <div class="map-help">
              <div class="help-item">
                <font-awesome-icon :icon="['fas', 'mouse-pointer']" />
                <span>Arrastra el marcador para ajustar la ubicación</span>
              </div>
              <div class="help-item">
                <font-awesome-icon :icon="['fas', 'search-location']" />
                <span>Usa la búsqueda para encontrar la dirección exacta</span>
              </div>
            </div>

            <!-- Búsqueda de dirección -->
            <div class="address-search">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Buscar dirección específica..."
                @input="handleAddressSearch"
              />
              <div v-if="searchResults.length > 0" class="search-results">
                <div
                  v-for="result in searchResults"
                  :key="result.place_id"
                  class="search-result-item"
                  @click="selectSearchResult(result)"
                >
                  <font-awesome-icon :icon="['fas', 'map-pin']" />
                  {{ result.description }}
                </div>
              </div>
            </div>

            <!-- Coordenadas actuales -->
            <div class="coordinates-display">
              <div class="coord-item">
                <strong>Latitud:</strong>
                <span>{{ currentLat.toFixed(6) }}</span>
              </div>
              <div class="coord-item">
                <strong>Longitud:</strong>
                <span>{{ currentLng.toFixed(6) }}</span>
              </div>
              <div class="coord-item accuracy">
                <strong>Precisión:</strong>
                <span :style="{ color: getAccuracyColor() }">
                  ±{{ formatAccuracy(currentAccuracy) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="location-modal-footer">
            <button class="btn-secondary" @click="handleCancel" :disabled="saving">
              <font-awesome-icon :icon="['fas', 'times']" />
              Cancelar
            </button>
            <button class="btn-confirm" @click="handleConfirm" :disabled="saving">
              <font-awesome-icon :icon="['fas', saving ? 'spinner' : 'check']" :spin="saving" />
              {{ saving ? 'Guardando...' : 'Confirmar Ubicación' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Configurar iconos de Leaflet
L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Props {
  show: boolean;
  propertyData: {
    title: string;
    city: string;
    address: string;
  };
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', data: LocationData): void;
}>();


// Estado
const saving = ref(false);
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const currentLat = ref(2.4448); // Popayán por defecto
const currentLng = ref(-76.6147);
const currentAccuracy = ref(100);

let map: L.Map | null = null;
let marker: L.Marker | null = null;
let accuracyCircle: L.Circle | null = null;
let searchTimeout: ReturnType<typeof setTimeout>;

// Funciones de utilidad
const formatAccuracy = (accuracy: number): string => {
  return accuracy > 1000 
    ? `${(accuracy / 1000).toFixed(1)} km` 
    : `${Math.round(accuracy)} m`;
};

const getAccuracyColor = (): string => {
  if (currentAccuracy.value <= 100) return '#27ae60';
  if (currentAccuracy.value > 1000) return '#e74c3c';
  return '#f39c12';
};

// Geocoding usando Nominatim (OpenStreetMap - gratis)
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const query = `${address}, ${props.propertyData.city}, Colombia`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error en geocoding:', error);
    return null;
  }
};

// Búsqueda de direcciones
const handleAddressSearch = () => {
  clearTimeout(searchTimeout);
  
  if (searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const query = `${searchQuery.value}, ${props.propertyData.city}, Colombia`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      
      const data = await response.json();
      
      searchResults.value = data.map((item: any) => ({
        place_id: item.place_id,
        description: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      searchResults.value = [];
    }
  }, 500);
};

const selectSearchResult = (result: any) => {
  currentLat.value = result.lat;
  currentLng.value = result.lng;
  
  if (map && marker) {
    const newLatLng = L.latLng(result.lat, result.lng);
    marker.setLatLng(newLatLng);
    map.setView(newLatLng, 17);
    
    if (accuracyCircle) {
      accuracyCircle.setLatLng(newLatLng);
    }
  }
  
  searchQuery.value = '';
  searchResults.value = [];
};

// Inicializar mapa
const initMap = async () => {
  await nextTick();
  
  const mapElement = document.getElementById('location-confirm-map');
  if (!mapElement || map) return;

  // Geocodificar la dirección para centro inicial
  let initialLat = 2.4448; // Popayán por defecto
  let initialLng = -76.6147;
  
  const geocoded = await geocodeAddress(props.propertyData.address);
  if (geocoded) {
    initialLat = geocoded.lat;
    initialLng = geocoded.lng;
    currentLat.value = initialLat;
    currentLng.value = initialLng;
  }

  // Crear mapa
  map = L.map('location-confirm-map', {
    center: [initialLat, initialLng],
    zoom: 16,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Crear marcador draggable
  marker = L.marker([initialLat, initialLng], {
    draggable: true,
    autoPan: true
  }).addTo(map);

  // Crear círculo de precisión
  accuracyCircle = L.circle([initialLat, initialLng], {
    radius: currentAccuracy.value,
    color: getAccuracyColor(),
    fillColor: getAccuracyColor(),
    fillOpacity: 0.15,
    weight: 2
  }).addTo(map);

  // Popup informativo
  marker.bindPopup(`
    <div style="text-align: center; padding: 10px;">
      <strong>📍 Ubicación de la Propiedad</strong><br>
      <small>Arrastra el marcador para ajustar</small>
    </div>
  `).openPopup();

  // Evento de arrastre
  marker.on('dragend', (e) => {
    const newPos = (e.target as L.Marker).getLatLng();
    currentLat.value = newPos.lat;
    currentLng.value = newPos.lng;
    
    if (accuracyCircle) {
      accuracyCircle.setLatLng(newPos);
    }
    
    map?.setView(newPos, map.getZoom());
  });

  // Intentar obtener ubicación GPS real para mejorar precisión
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        currentAccuracy.value = accuracy;
        
        if (accuracyCircle) {
          accuracyCircle.setRadius(accuracy);
          accuracyCircle.setStyle({
            color: getAccuracyColor(),
            fillColor: getAccuracyColor()
          });
        }
      },
      (error) => {
        console.warn('No se pudo obtener ubicación GPS:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }
};

const destroyMap = () => {
  if (marker) {
    marker.off('dragend');
    marker = null;
  }
  
  if (map) {
    map.remove();
    map = null;
  }
  
  accuracyCircle = null;
};

// Handlers
const handleCancel = () => {
  if (!saving.value) {
    destroyMap();
    emit('close');
  }
};

const handleConfirm = () => {
  saving.value = true;
  
  emit('confirm', {
    lat: currentLat.value,
    lng: currentLng.value,
    accuracy: currentAccuracy.value
  });
  
  // El componente padre cerrará el modal después de guardar
};

// Watchers
watch(() => props.show, async (newShow) => {
  if (newShow) {
    saving.value = false;
    searchQuery.value = '';
    searchResults.value = [];
    
    // Inicializar mapa después de que el DOM se actualice
    await nextTick();
    setTimeout(() => {
      initMap();
    }, 100);
  } else {
    destroyMap();
  }
});

// Lifecycle
onUnmounted(() => {
  destroyMap();
});
</script>

<style scoped>
.location-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 1rem;
}

.location-modal-container {
  background: #ffffff;
  border-radius: 24px;
  max-width: 1000px;
  width: 100%;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Header */
.location-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e5e7eb;
  background: #f8fafc;
}

.header-content {
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
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.modal-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
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

.btn-close:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
  transform: rotate(90deg);
}

.btn-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Property info bar */
.property-info-bar {
  display: flex;
  gap: 2rem;
  padding: 1rem 2rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
}

.info-icon {
  color: #64748b;
}

/* Map section */
.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1rem;
  overflow-y: auto;
}

.location-map {
  width: 100%;
  height: 450px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.map-help {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: #eff6ff;
  border-radius: 12px;
  border: 1px solid #bfdbfe;
  flex-wrap: wrap;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1e40af;
}

.help-item svg {
  color: #3b82f6;
}

/* Address search */
.address-search {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b251d;
  box-shadow: 0 0 0 4px rgba(59, 37, 29, 0.1);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.search-result-item {
  padding: 1rem 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f8fafc;
}

.search-result-item svg {
  color: #3b251d;
}

/* Coordinates display */
.coordinates-display {
  display: flex;
  gap: 2rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  flex-wrap: wrap;
}

.coord-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.coord-item strong {
  color: #64748b;
  font-weight: 700;
}

.coord-item span {
  color: #1f2937;
  font-weight: 600;
}

.coord-item.accuracy strong {
  color: #64748b;
}

/* Footer */
.location-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #e5e7eb;
  background: #f8fafc;
}

.btn-secondary,
.btn-confirm {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
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

.btn-confirm {
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-secondary:disabled,
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .location-modal-container,
.modal-leave-active .location-modal-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .location-modal-container,
.modal-leave-to .location-modal-container {
  transform: scale(0.95) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .location-modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .location-map {
    height: 350px;
  }

  .property-info-bar,
  .map-help,
  .coordinates-display {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
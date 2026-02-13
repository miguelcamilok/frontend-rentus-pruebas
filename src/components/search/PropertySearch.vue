<template>
    <section class="modern-search-section" data-aos="fade-up">
        <div class="search-container">
            <!-- Header -->
            <div class="search-header">
                <font-awesome-icon :icon="['fas', 'home']" class="search-header-icon" />
                <h3>{{ t('home.search.title') }}</h3>
            </div>

            <!-- Grid -->
            <div class="search-grid">
                <!-- Search -->
                <div class="search-field">
                    <label class="search-label">
                        <font-awesome-icon :icon="['fas', 'search']" />
                        {{ t('home.search.fields.search.label') }}
                    </label>
                    <input type="text" :placeholder="t('home.search.fields.search.placeholder')"
                        v-model="localFilters.search" @input="emitFilters" />
                </div>

                <!-- Location -->
                <div class="search-field">
                    <label class="search-label">
                        <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                        {{ t('home.search.fields.location.label') }}
                    </label>

                    <div class="input-wrapper">
                        <input type="text" :placeholder="t('home.search.fields.location.placeholder')"
                            v-model="localFilters.city"
                            @focus="localFilters.city.length > 2 && (showSuggestions = true)" @blur="hideSuggestions"
                            @input="emitFilters" />

                        <!-- Suggestions -->
                        <div v-if="showSuggestions && locationSuggestions.length" class="suggestions-dropdown">
                            <div v-for="s in locationSuggestions" :key="s.place_id" class="suggestion-item"
                                @mousedown="selectSuggestion(s)">
                                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="suggestion-icon" />
                                <span class="suggestion-text">{{ s.description }}</span>
                            </div>
                        </div>

                        <div v-if="loadingSuggestions" class="suggestions-loading">
                            <div class="mini-loader"></div>
                            {{ t('home.search.suggestions.loading') }}
                        </div>
                    </div>
                </div>

                <!-- Type -->
                <div class="search-field">
                    <label class="search-label">
                        <font-awesome-icon :icon="['fas', 'home']" />
                        {{ t('home.search.fields.type.label') }}
                    </label>

                    <select v-model="localFilters.type" @change="emitFilters">
                        <option value="">{{ t('home.search.fields.type.all') }}</option>
                        <option value="casa">{{ t('home.search.fields.type.house') }}</option>
                        <option value="apartamento">{{ t('home.search.fields.type.apartment') }}</option>
                        <option value="local">{{ t('home.search.fields.type.commercial') }}</option>
                        <option value="finca">{{ t('home.search.fields.type.farm') }}</option>
                    </select>
                </div>

                <!-- Budget -->
                <div class="search-field">
                    <label class="search-label">
                        <font-awesome-icon icon="dollar-sign" />
                        {{ t('home.search.fields.budget.label') }}
                    </label>
                    <input type="number" :placeholder="t('home.search.fields.budget.placeholder')"
                        v-model.number="localFilters.maxPrice" @input="emitFilters" />
                </div>

                <!-- Button -->
                <div class="search-field">
                    <button class="search-btn-modern" @click="emitFilters">
                        <span>{{ t('home.search.button') }}</span>
                        <font-awesome-icon :icon="['fas', 'arrow-right']" class="btn-arrow" />
                    </button>
                </div>
            </div>

            <!-- Active Filters -->
            <transition name="slide-fade">
                <div v-if="hasActiveFilters" class="active-filters-bar">
                    <span class="filters-label">
                        {{ t('home.search.filters.active') }}
                    </span>

                    <div class="filters-chips">
                        <div v-if="localFilters.search" class="filter-chip">
                            <font-awesome-icon icon="search" class="chip-icon" />
                            <span class="chip-value">{{ localFilters.search }}</span>
                            <button @click="clearSearchFilter" class="chip-close">
                                <font-awesome-icon icon="times" />
                            </button>
                        </div>
                        
                        <div v-if="localFilters.city" class="filter-chip">
                            <font-awesome-icon icon="map-marker-alt" class="chip-icon" />
                            <span class="chip-value">{{ localFilters.city }}</span>
                            <button @click="clearCityFilter" class="chip-close">
                                <font-awesome-icon icon="times" />
                            </button>
                        </div>
                        
                        <div v-if="localFilters.type" class="filter-chip">
                            <font-awesome-icon icon="home" class="chip-icon" />
                            <span class="chip-value">{{ t(propertyTypeLabels[localFilters.type]) }}</span>
                            <button @click="clearTypeFilter" class="chip-close">
                                <font-awesome-icon icon="times" />
                            </button>
                        </div>

                        <div v-if="localFilters.maxPrice" class="filter-chip">
                            <font-awesome-icon icon="dollar-sign" class="chip-icon" />
                            <span class="chip-value">{{ formatPrice(localFilters.maxPrice) }}</span>
                            <button @click="clearPriceFilter" class="chip-close">
                                <font-awesome-icon icon="times" />
                            </button>
                        </div>
                    </div>

                    <button class="btn-clear-all-inline" @click="clearFilters">
                        <span class="icon">↻</span>
                        <span>{{ t('home.search.filters.clear') }}</span>
                    </button>
                </div>
            </transition>
        </div>
    </section>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { mapsService } from "../../services/mapsService";

const { t } = useI18n();

/* Props / Emits */
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

/* Local state */
const localFilters = ref({ ...props.modelValue });
const locationSuggestions = ref([]);
const showSuggestions = ref(false);
const loadingSuggestions = ref(false);

/* Sync with parent */
watch(
  () => props.modelValue,
  (val) => {
    localFilters.value = { ...val };
  }
);

/* ===========================
   i18n TYPE MAPS (KEY PART)
   =========================== */

/* Para mostrar labels traducidos en chips */
const propertyTypeLabels = {
  casa: "home.search.fields.type.house",
  apartamento: "home.search.fields.type.apartment",
  local: "home.search.fields.type.commercial",
  finca: "home.search.fields.type.farm",
};

/* ===========================
   NORMALIZADORES i18n
   =========================== */

/* Para normalizar términos de búsqueda en el campo de texto libre (EN -> ES) */
const searchTermNormalizer = {
  // Inglés -> Español
  "house": "casa",
  "apartment": "apartamento",
  "commercial": "local",
  "commercial space": "local",
  "farm": "finca",
  
  // Variaciones comunes
  "apt": "apartamento",
  "store": "local",
  "shop": "local",
  
  // Plurales en inglés
  "houses": "casa",
  "apartments": "apartamento",
  "farms": "finca",
};

/* Para detectar tipo de propiedad en títulos (normalizado) */
const detectPropertyType = (title) => {
  if (!title) return "";
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes("casa")) return "casa";
  if (titleLower.includes("apartamento") || titleLower.includes("apto")) return "apartamento";
  if (titleLower.includes("local")) return "local";
  if (titleLower.includes("finca")) return "finca";
  
  return "";
};

/* ===========================
   COMPUTED
   =========================== */

const hasActiveFilters = computed(() => {
  const f = localFilters.value;
  return f.search || f.city || f.type || f.maxPrice;
});

/* 🔥 NORMALIZA el texto del campo de búsqueda libre */
const normalizedSearch = computed(() => {
  const search = localFilters.value.search?.toLowerCase().trim();
  if (!search) return "";

  // Busca coincidencias completas primero
  if (searchTermNormalizer[search]) {
    return searchTermNormalizer[search];
  }

  // Busca si alguna palabra clave está contenida en el texto
  for (const [englishTerm, spanishTerm] of Object.entries(searchTermNormalizer)) {
    if (search.includes(englishTerm)) {
      // Reemplaza el término inglés por el español
      return search.replace(englishTerm, spanishTerm);
    }
  }

  return search; // Si no encuentra coincidencia, devuelve el original
});

/* ===========================
   METHODS
   =========================== */

const emitFilters = () => {
  // 🔥 Emite filtros normalizados para que las vistas los usen directamente
  emit("update:modelValue", {
    ...localFilters.value,
    search: normalizedSearch.value, // Normaliza términos de búsqueda
    // El type ya está normalizado porque el <select> usa values en español
  });
};

// 🔥 MÉTODO PÚBLICO: Para que las vistas detecten tipos sin traducir
const detectPropertyTypePublic = detectPropertyType;

// Exporta la función para que las vistas la usen
defineExpose({
  detectPropertyType: detectPropertyTypePublic
});

const clearFilters = () => {
  localFilters.value = {
    search: "",
    city: "",
    type: "",
    maxPrice: null,
  };
  emitFilters();
};

const clearSearchFilter = () => {
  localFilters.value.search = "";
  emitFilters();
};

const clearCityFilter = () => {
  localFilters.value.city = "";
  emitFilters();
};

const clearTypeFilter = () => {
  localFilters.value.type = "";
  emitFilters();
};

const clearPriceFilter = () => {
  localFilters.value.maxPrice = null;
  emitFilters();
};

const formatPrice = (price) => {
  if (!price) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(price);
};

const selectSuggestion = (s) => {
  localFilters.value.city = s.description;
  showSuggestions.value = false;
  locationSuggestions.value = [];
  emitFilters();
};

const hideSuggestions = () => {
  setTimeout(() => (showSuggestions.value = false), 200);
};

/* ===========================
   AUTOCOMPLETE LOCATION
   =========================== */

watch(
  () => localFilters.value.city,
  async (val) => {
    if (val && val.length > 2) {
      loadingSuggestions.value = true;
      try {
        locationSuggestions.value =
          await mapsService.autocompletePlace(val);
        showSuggestions.value = locationSuggestions.value.length > 0;
      } catch (e) {
        locationSuggestions.value = [];
      } finally {
        loadingSuggestions.value = false;
      }
    } else {
      locationSuggestions.value = [];
      showSuggestions.value = false;
    }
  }
);
</script>

<style scoped>
@import "../../assets/css/Properties/PropertyView.css";
</style>
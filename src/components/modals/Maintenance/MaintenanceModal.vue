<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Solicitud de Mantenimiento</h2>
      
      <form @submit.prevent="submitMaintenanceRequest" class="maintenance-form">
        <div class="form-group">
          <label for="category">Categoría:</label>
          <select 
            id="category" 
            v-model="formData.category" 
            required
          >
            <option value="">Seleccione una opción</option>
            <option value="electricidad">Electricidad</option>
            <option value="plomeria">Plomería</option>
            <option value="estructural">Estructural</option>
            <option value="pintura">Pintura</option>
            <option value="jardineria">Jardinería</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div class="form-group">
          <label for="priority">Prioridad:</label>
          <select 
            id="priority" 
            v-model="formData.priority" 
            required
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Descripción del problema:</label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            rows="4" 
            required
            placeholder="Describe detalladamente el problema, ubicación exacta y cualquier información relevante..."
          ></textarea>
          <div class="char-counter">{{ formData.description.length }}/500</div>
        </div>

        <div class="form-group">
          <label for="image" class="file-label">
            <span class="file-icon">📎</span>
            Adjuntar imagen del problema (opcional)
          </label>
          <input 
            type="file" 
            id="image" 
            accept="image/*"
            @change="handleImageUpload"
            class="file-input"
          />
          
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span class="progress-text">Subiendo: {{ uploadProgress }}%</span>
          </div>

          <div v-if="formData.image && !uploading" class="image-preview">
            <img :src="imagePreviewUrl" alt="Vista previa" />
            <div class="image-info">
              <span class="image-name">{{ formData.image.name }}</span>
              <span class="image-size">{{ formatFileSize(formData.image.size) }}</span>
            </div>
            <button type="button" @click="removeImage" class="remove-image-btn">
              ×
            </button>
          </div>

          <div v-if="uploadedImageUrl" class="upload-success">
            <span class="success-icon">✅</span>
            <span>Imagen subida correctamente</span>
            <a :href="uploadedImageUrl" target="_blank" class="view-link">Ver imagen</a>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading || uploading">
            <span v-if="loading || uploading" class="loading-spinner"></span>
            {{ getSubmitButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'MaintenanceModal',
  
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'submitted'],

  setup(props, { emit }) {
    // Estado del formulario 
    const formData = reactive({
      category: '',
      priority: 'media',
      description: '',
      image: null
    })

    // Estados de UI
    const loading = ref(false)
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const uploadedImageUrl = ref('')

    // Computed properties
    const imagePreviewUrl = computed(() => {
      if (formData.image) {
        return URL.createObjectURL(formData.image)
      }
      return ''
    })

    const getSubmitButtonText = computed(() => {
      if (uploading.value) return 'Subiendo imagen...'
      if (loading.value) return 'Enviando solicitud...'
      return 'Enviar Solicitud'
    })

    const IMGBB_API_KEY = '16768ff5cf17e35243555fd8b388abd7' 
    // Métodos
    const closeModal = () => {
      emit('close')
      resetForm()
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecciona solo imágenes (JPEG, PNG, GIF)')
          event.target.value = ''
          return
        }
        
        // Validar tamaño (max 10MB para ImgBB)
        if (file.size > 10 * 1024 * 1024) {
          alert('La imagen no debe superar los 10MB')
          event.target.value = ''
          return
        }
        
        formData.image = file
        uploadedImageUrl.value = '' // Resetear URL anterior
      }
    }

    const uploadImageToImgBB = async (file) => {
      uploading.value = true
      uploadProgress.value = 10

      try {
        const formData = new FormData()
        formData.append('image', file)

        // Simular progreso de subida
        uploadProgress.value = 30
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        })

        uploadProgress.value = 80

        if (!response.ok) {
          throw new Error('Error al subir la imagen')
        }

        const data = await response.json()
        uploadProgress.value = 100

        // ImgBB devuelve la URL en data.data.url
        return data.data.url

      } catch (error) {
        console.error('Error subiendo imagen:', error)
        throw new Error('No se pudo subir la imagen. Intenta nuevamente.')
      } finally {
        uploading.value = false
        setTimeout(() => {
          uploadProgress.value = 0
        }, 1000)
      }
    }

    const removeImage = () => {
      formData.image = null
      uploadedImageUrl.value = ''
      const fileInput = document.getElementById('image')
      if (fileInput) {
        fileInput.value = ''
      }
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const resetForm = () => {
      formData.category = ''
      formData.priority = 'media'
      formData.description = ''
      formData.image = null
      loading.value = false
      uploading.value = false
      uploadProgress.value = 0
      uploadedImageUrl.value = ''
    }

    const submitMaintenanceRequest = async () => {
      // Validaciones básicas
      if (!formData.category) {
        alert('Por favor selecciona una categoría')
        return
      }

      if (!formData.description.trim()) {
        alert('Por favor describe el problema')
        return
      }

      if (formData.description.length > 500) {
        alert('La descripción no puede exceder los 500 caracteres')
        return
      }

      loading.value = true
      let imageUrl = ''

      try {
        // Subir imagen si existe
        if (formData.image) {
          imageUrl = await uploadImageToImgBB(formData.image)
          uploadedImageUrl.value = imageUrl
        }

        // Simular envío a la API de mantenimiento
        console.log('Enviando solicitud de mantenimiento:', {
          ...formData,
          imageUrl: imageUrl
        })
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Éxito - Emitir evento con todos los datos
        emit('submitted', {
          category: formData.category,
          priority: formData.priority,
          description: formData.description,
          image: formData.image,
          imageUrl: imageUrl,
          timestamp: new Date().toISOString(),
          status: 'pendiente'
        })
        
        alert('¡Solicitud de mantenimiento enviada correctamente! Te contactaremos pronto.')
        closeModal()
        
      } catch (error) {
        console.error('Error enviando solicitud:', error)
        alert(error.message || 'Error al enviar la solicitud. Por favor intenta nuevamente.')
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      loading,
      uploading,
      uploadProgress,
      uploadedImageUrl,
      imagePreviewUrl,
      getSubmitButtonText,
      closeModal,
      handleImageUpload,
      removeImage,
      formatFileSize,
      submitMaintenanceRequest
    }
  }
}
</script>

<style scoped>
@import "../../../assets/css/components/MaintenanceModal.css";
</style>
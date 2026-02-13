<template>
  <transition name="alert-slide">
    <div
      v-if="show"
      :class="['modern-alert', `alert-${variant}`, { 'alert-dismissible': dismissible }]"
      role="alert"
    >
      <!-- Icon -->
      <div class="alert-icon">
        <svg
          v-if="variant === 'success'"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>

        <svg
          v-else-if="variant === 'error'"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>

        <svg
          v-else-if="variant === 'warning'"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>

      <!-- Content -->
      <div class="alert-content">
        <div v-if="title" class="alert-title">{{ title }}</div>
        <div class="alert-message">
          <slot>{{ message }}</slot>
        </div>
      </div>

      <!-- Close Button -->
      <button v-if="dismissible" @click="handleClose" class="alert-close" aria-label="Cerrar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <!-- Progress Bar (auto-dismiss) -->
      <div v-if="autoDismiss && autoDismissTime" class="alert-progress">
        <div class="alert-progress-bar" :style="{ animationDuration: `${autoDismissTime}ms` }"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// ==================== PROPS ====================
interface Props {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  message?: string;
  dismissible?: boolean;
  autoDismiss?: boolean;
  autoDismissTime?: number; // en milisegundos
  show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "info",
  dismissible: true,
  autoDismiss: false,
  autoDismissTime: 5000,
  show: true,
});

// ==================== EMITS ====================
const emit = defineEmits<{
  close: [];
}>();

// ==================== STATE ====================
const show = ref(props.show);
let autoDismissTimer: number | null = null;

// ==================== METHODS ====================
const handleClose = () => {
  show.value = false;
  emit("close");
};

// ==================== LIFECYCLE ====================
onMounted(() => {
  if (props.autoDismiss && props.autoDismissTime) {
    autoDismissTimer = window.setTimeout(() => {
      handleClose();
    }, props.autoDismissTime);
  }
});

onUnmounted(() => {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer);
  }
});
</script>

<style scoped>
.modern-alert {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 2px solid;
  animation: alert-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes alert-appear {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ==================== VARIANTS ==================== */

/* Success */
.alert-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #6ee7b7;
  color: #065f46;
}

.alert-success .alert-icon {
  color: #059669;
}

/* Error */
.alert-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #fca5a5;
  color: #991b1b;
}

.alert-error .alert-icon {
  color: #dc2626;
}

/* Warning */
.alert-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fcd34d;
  color: #92400e;
}

.alert-warning .alert-icon {
  color: #f59e0b;
}

/* Info */
.alert-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  color: #1e40af;
}

.alert-info .alert-icon {
  color: #3b82f6;
}

/* ==================== CONTENT ==================== */

.alert-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.alert-message {
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.95;
}

/* ==================== CLOSE BUTTON ==================== */

.alert-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: currentColor;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

/* ==================== PROGRESS BAR ==================== */

.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.alert-progress-bar {
  height: 100%;
  background: currentColor;
  animation: progress-shrink linear forwards;
  opacity: 0.5;
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* ==================== TRANSITIONS ==================== */

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* ==================== RESPONSIVE ==================== */

@media (max-width: 576px) {
  .modern-alert {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }

  .alert-icon {
    width: 2rem;
    height: 2rem;
  }

  .alert-icon svg {
    width: 16px;
    height: 16px;
  }

  .alert-title {
    font-size: 0.875rem;
  }

  .alert-message {
    font-size: 0.85rem;
  }
}
</style>
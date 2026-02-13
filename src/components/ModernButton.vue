<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'modern-btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-loading': loading },
      { 'btn-disabled': disabled },
      { 'btn-full-width': fullWidth }
    ]"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="btn-loader">
      <div class="spinner"></div>
      <span v-if="loadingText">{{ loadingText }}</span>
      <span v-else><slot /></span>
    </span>

    <!-- Normal Content -->
    <span v-else class="btn-content">
      <!-- Icon Left -->
      <component v-if="iconLeft" :is="iconLeft" class="btn-icon icon-left" />

      <!-- Text -->
      <span class="btn-text">
        <slot />
      </span>

      <!-- Icon Right -->
      <component v-if="iconRight" :is="iconRight" class="btn-icon icon-right" />
    </span>

    <!-- Hover Effect -->
    <span class="btn-hover-effect"></span>
  </button>
</template>

<script setup lang="ts">
// ==================== PROPS ====================
interface Props {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  loadingText?: string;
  iconLeft?: any;
  iconRight?: any;
}

withDefaults(defineProps<Props>(), {
  type: "button",
  variant: "primary",
  size: "md",
  loading: false,
  disabled: false,
  fullWidth: false,
});

// ==================== EMITS ====================
const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

// ==================== METHODS ====================
const handleClick = (event: MouseEvent) => {
  emit("click", event);
};
</script>

<style scoped>
.modern-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-family: inherit;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
}

/* ==================== SIZES ==================== */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-md {
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.05rem;
}

/* ==================== VARIANTS ==================== */

/* Primary */
.btn-primary {
  background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 37, 29, 0.25);
}

.btn-primary:hover:not(.btn-disabled):not(.btn-loading) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 37, 29, 0.35);
}

.btn-primary:active:not(.btn-disabled):not(.btn-loading) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(59, 37, 29, 0.25);
}

/* Secondary */
.btn-secondary {
  background: linear-gradient(135deg, #c19a6b 0%, #8b6f47 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(193, 154, 107, 0.25);
}

.btn-secondary:hover:not(.btn-disabled):not(.btn-loading) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(193, 154, 107, 0.35);
}

/* Outline */
.btn-outline {
  background: transparent;
  color: #3b251d;
  border: 2px solid #3b251d;
  box-shadow: none;
}

.btn-outline:hover:not(.btn-disabled):not(.btn-loading) {
  background: #3b251d;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 37, 29, 0.15);
}

/* Ghost */
.btn-ghost {
  background: rgba(59, 37, 29, 0.05);
  color: #3b251d;
  box-shadow: none;
}

.btn-ghost:hover:not(.btn-disabled):not(.btn-loading) {
  background: rgba(59, 37, 29, 0.1);
  transform: translateY(-1px);
}

/* Danger */
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.btn-danger:hover:not(.btn-disabled):not(.btn-loading) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}

/* ==================== STATES ==================== */

/* Disabled */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Loading */
.btn-loading {
  cursor: wait;
  pointer-events: none;
}

/* Full Width */
.btn-full-width {
  width: 100%;
}

/* ==================== CONTENT ==================== */

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-loader {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  flex-shrink: 0;
  width: 1.25em;
  height: 1.25em;
}

.icon-left {
  margin-right: -0.25rem;
}

.icon-right {
  margin-left: -0.25rem;
  transition: transform 0.3s ease;
}

.modern-btn:hover:not(.btn-disabled):not(.btn-loading) .icon-right {
  transform: translateX(4px);
}

/* ==================== SPINNER ==================== */

.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn-outline .spinner,
.btn-ghost .spinner {
  border-color: rgba(59, 37, 29, 0.2);
  border-top-color: currentColor;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== HOVER EFFECT ==================== */

.btn-hover-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  pointer-events: none;
}

.modern-btn:hover:not(.btn-disabled):not(.btn-loading) .btn-hover-effect {
  transform: translateX(100%);
}

/* ==================== RESPONSIVE ==================== */

@media (max-width: 576px) {
  .btn-sm {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
  }

  .btn-md {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }

  .btn-lg {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
  }
}

/* ==================== ACCESSIBILITY ==================== */

.modern-btn:focus-visible {
  outline: 2px solid #3b251d;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .modern-btn,
  .btn-hover-effect,
  .icon-right {
    transition: none;
  }

  .spinner {
    animation: none;
  }
}
</style>
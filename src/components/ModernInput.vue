<template>
  <div class="modern-input-wrapper" :class="{ 'has-error': error, 'is-disabled': disabled }">
    <label v-if="label" :for="inputId" class="modern-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <div class="input-container">
      <!-- Icon Left -->
      <div v-if="iconLeft" class="input-icon icon-left">
        <component :is="iconLeft" />
      </div>

      <!-- Input Field -->
      <input
        :id="inputId"
        :type="computedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :class="[
          'modern-input',
          { 'with-icon-left': iconLeft },
          { 'with-icon-right': iconRight || type === 'password' }
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Password Toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="input-icon icon-right toggle-password-btn"
        @click="togglePasswordVisibility"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      >
        <svg
          v-if="!showPassword"
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
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
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
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </button>

      <!-- Icon Right -->
      <div v-else-if="iconRight" class="input-icon icon-right">
        <component :is="iconRight" />
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="input-icon icon-right">
        <div class="input-spinner"></div>
      </div>
    </div>

    <!-- Error Message -->
    <transition name="fade-slide">
      <div v-if="error" class="error-message">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
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
        <span>{{ error }}</span>
      </div>
    </transition>

    <!-- Helper Text -->
    <div v-if="helperText && !error" class="helper-text">
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// ==================== PROPS ====================
interface Props {
  modelValue: string | number;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  iconLeft?: any;
  iconRight?: any;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  maxlength?: number;
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  readonly: false,
  required: false,
  loading: false,
});

// ==================== EMITS ====================
const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

// ==================== STATE ====================
const showPassword = ref(false);
const inputId = computed(() => `input-${Math.random().toString(36).substring(7)}`);

// ==================== COMPUTED ====================
const computedType = computed(() => {
  if (props.type === "password") {
    return showPassword.value ? "text" : "password";
  }
  return props.type;
});

// ==================== METHODS ====================
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>
.modern-input-wrapper {
  width: 100%;
  margin-bottom: 1.5rem;
}

.modern-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.required-mark {
  color: #ef4444;
  margin-left: 2px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.modern-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1f2937;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-input.with-icon-left {
  padding-left: 3rem;
}

.modern-input.with-icon-right {
  padding-right: 3rem;
}

.modern-input:focus {
  background: white;
  border-color: #3b251d;
  box-shadow: 0 0 0 4px rgba(59, 37, 29, 0.1);
}

.modern-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f3f4f6;
}

.modern-input::placeholder {
  color: #9ca3af;
}

.has-error .modern-input {
  border-color: #ef4444;
  background: #fef2f2;
}

.has-error .modern-label {
  color: #ef4444;
}

.input-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: color 0.3s ease;
}

.icon-left {
  left: 1rem;
  pointer-events: none;
}

.icon-right {
  right: 1rem;
}

.toggle-password-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
  transition: color 0.3s ease;
}

.toggle-password-btn:hover {
  color: #3b251d;
}

.modern-input:focus ~ .input-icon {
  color: #3b251d;
}

.input-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(59, 37, 29, 0.2);
  border-top-color: #3b251d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #ef4444;
  font-weight: 500;
}

.error-message svg {
  flex-shrink: 0;
}

.helper-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Responsive */
@media (max-width: 576px) {
  .modern-input {
    font-size: 0.9rem;
    padding: 0.75rem 0.875rem;
  }

  .modern-input.with-icon-left {
    padding-left: 2.75rem;
  }

  .modern-input.with-icon-right {
    padding-right: 2.75rem;
  }
}
</style>
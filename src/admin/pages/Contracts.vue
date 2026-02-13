<template>
  <div class="page-placeholder">
    <div class="placeholder-content">
      <div class="placeholder-icon">📄</div>
      <h1 class="placeholder-title">Gestión de Contratos</h1>
      <p class="placeholder-description">
        Esta sección estará disponible próximamente. Aquí podrás gestionar todos los contratos activos.
      </p>
      <button class="back-btn" @click="$router.push('/admin/dashboard')">
        ← Volver al Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
.page-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.placeholder-content {
  text-align: center;
  max-width: 600px;
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.placeholder-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #1f2937;
  margin: 0 0 1rem;
}

.placeholder-description {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0 0 2rem;
}

.back-btn {
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 37, 29, 0.3);
}
</style>

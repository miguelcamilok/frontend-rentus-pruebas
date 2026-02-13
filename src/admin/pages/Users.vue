<template>
  <div class="users-page">
    <!-- Header Section -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-wrapper">
            <span class="page-icon">👥</span>
          </div>
          <div class="header-text">
            <h1 class="page-title">Gestión de Usuarios</h1>
            <p class="page-subtitle">
              {{ pagination.total }} usuarios registrados en la plataforma
            </p>
          </div>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <span class="btn-icon">+</span>
          Nuevo Usuario
        </button>
      </div>
    </header>

    <!-- Stats Cards -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card" style="--accent-color: #059669">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.active }}</div>
            <div class="stat-label">Activos</div>
          </div>
          <div class="stat-chart">
            <div 
              class="stat-bar" 
              :style="{ width: calculatePercentage(stats.active) + '%' }"
            ></div>
          </div>
        </div>

        <div class="stat-card" style="--accent-color: #f59e0b">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
          <div class="stat-chart">
            <div 
              class="stat-bar" 
              :style="{ width: calculatePercentage(stats.pending) + '%' }"
            ></div>
          </div>
        </div>

        <div class="stat-card" style="--accent-color: #6b7280">
          <div class="stat-icon">○</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.inactive }}</div>
            <div class="stat-label">Inactivos</div>
          </div>
          <div class="stat-chart">
            <div 
              class="stat-bar" 
              :style="{ width: calculatePercentage(stats.inactive) + '%' }"
            ></div>
          </div>
        </div>

        <div class="stat-card" style="--accent-color: #dc2626">
          <div class="stat-icon">✕</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.suspended }}</div>
            <div class="stat-label">Suspendidos</div>
          </div>
          <div class="stat-chart">
            <div 
              class="stat-bar" 
              :style="{ width: calculatePercentage(stats.suspended) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters and Search -->
    <section class="filters-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          class="search-input"
          @input="debouncedSearch"
        />
        <button 
          v-if="filters.search"
          class="clear-btn"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>

      <div class="filter-controls">
        <select v-model="filters.role" class="filter-select" @change="applyFilters">
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="support">Soporte</option>
          <option value="user">Usuario</option>
        </select>

        <select v-model="filters.status" class="filter-select" @change="applyFilters">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="pending">Pendiente</option>
          <option value="inactive">Inactivo</option>
          <option value="suspended">Suspendido</option>
        </select>

        <select v-model="filters.verification_status" class="filter-select" @change="applyFilters">
          <option value="">Todos los estados de verificación</option>
          <option value="verified">Verificado</option>
          <option value="pending">No verificado</option>
        </select>

        <button 
          v-if="hasActiveFilters"
          class="btn-clear-filters"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>
    </section>

    <!-- Users Table -->
    <section class="table-section">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="loadUsers">Reintentar</button>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-title">No se encontraron usuarios</p>
        <p class="empty-description">
          {{ hasActiveFilters 
            ? 'Intenta ajustar los filtros de búsqueda' 
            : 'Comienza creando el primer usuario' 
          }}
        </p>
      </div>

      <div v-else class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  class="checkbox"
                  @change="toggleSelectAll"
                  :checked="allSelected"
                />
              </th>
              <th @click="sortBy('name')" class="sortable">
                Usuario
                <span class="sort-icon">{{ getSortIcon('name') }}</span>
              </th>
              <th @click="sortBy('role')" class="sortable">
                Rol
                <span class="sort-icon">{{ getSortIcon('role') }}</span>
              </th>
              <th @click="sortBy('status')" class="sortable">
                Estado
                <span class="sort-icon">{{ getSortIcon('status') }}</span>
              </th>
              <th @click="sortBy('verification_status')" class="sortable">
                Email Verificado
                <span class="sort-icon">{{ getSortIcon('verification_status') }}</span>
              </th>
              <th @click="sortBy('created_at')" class="sortable">
                Registrado
                <span class="sort-icon">{{ getSortIcon('created_at') }}</span>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in users" 
              :key="user.id"
              class="user-row"
              :class="{ 'selected': selectedUsers.includes(user.id) }"
            >
              <td>
                <input 
                  type="checkbox" 
                  class="checkbox"
                  :checked="selectedUsers.includes(user.id)"
                  @change="toggleSelectUser(user.id)"
                />
              </td>
              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    <img 
                      v-if="user.photo" 
                      :src="user.photo" 
                      :alt="user.name"
                      class="avatar-img"
                    />
                    <div v-else class="avatar-placeholder">
                      {{ getInitials(user.name) }}
                    </div>
                  </div>
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span 
                  class="badge role-badge"
                  :style="{
                    color: getRoleConfig(user.role).color,
                    background: getRoleConfig(user.role).bg
                  }"
                >
                  {{ getRoleConfig(user.role).label }}
                </span>
              </td>
              <td>
                <span 
                  class="badge status-badge"
                  :style="{
                    color: getStatusConfig(user.status).color,
                    background: getStatusConfig(user.status).bg
                  }"
                >
                  <span class="badge-icon">{{ getStatusConfig(user.status).icon }}</span>
                  {{ getStatusConfig(user.status).label }}
                </span>
              </td>
              <td>
                <span 
                  class="badge verification-badge"
                  :class="{
                    'verified': user.verification_status === 'verified',
                    'pending': user.verification_status === 'pending'
                  }"
                >
                  <span class="badge-icon">
                    {{ user.verification_status === 'verified' ? '✓' : '⏳' }}
                  </span>
                  {{ user.verification_status === 'verified' ? 'Verificado' : 'Pendiente' }}
                </span>
              </td>
              <td class="date-cell">
                {{ formatTimeAgo(user.created_at) }}
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn-action btn-edit"
                    @click="openEditModal(user)"
                    title="Editar usuario"
                  >
                    ✏️
                  </button>
                  <button 
                    class="btn-action btn-toggle"
                    @click="toggleUserStatus(user)"
                    :title="user.status === 'active' ? 'Desactivar' : 'Activar'"
                    :disabled="statusUpdateLoading[user.id]"
                  >
                    <span v-if="statusUpdateLoading[user.id]" class="loading-dots"></span>
                    <span v-else>{{ user.status === 'active' ? '🔒' : '🔓' }}</span>
                  </button>
                  <button 
                    class="btn-action btn-delete"
                    @click="confirmDelete(user)"
                    title="Eliminar usuario"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="pagination.lastPage > 1" class="pagination">
          <button 
            class="pagination-btn"
            :disabled="pagination.currentPage === 1 || paginationLoading"
            @click="changePage(pagination.currentPage - 1)"
          >
            ← Anterior
          </button>
          
          <div class="pagination-pages">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="pagination-page"
              :class="{ active: page === pagination.currentPage }"
              @click="changePage(page)"
              :disabled="page === '...' || paginationLoading"
            >
              {{ page }}
            </button>
          </div>
          
          <div class="pagination-info">
            Página {{ pagination.currentPage }} de {{ pagination.lastPage }}
            ({{ pagination.total }} usuarios)
          </div>
          
          <button 
            class="pagination-btn"
            :disabled="pagination.currentPage === pagination.lastPage || paginationLoading"
            @click="changePage(pagination.currentPage + 1)"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </section>

    <!-- User Modal (Create/Edit) -->
    <Teleport to="body">
      <div v-if="showUserModal" class="modal-overlay" @click.self="closeUserModal">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h2>
            <button class="modal-close" @click="closeUserModal">✕</button>
          </div>

          <form @submit.prevent="saveUser" class="modal-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label">Nombre completo</label>
                <input 
                  v-model="userForm.name"
                  type="text"
                  class="form-input"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Email</label>
                <input 
                  v-model="userForm.email"
                  type="email"
                  class="form-input"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input 
                  v-model="userForm.phone"
                  type="tel"
                  class="form-input"
                  placeholder="+57 300 123 4567"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Rol</label>
                <select v-model="userForm.role" class="form-select" required>
                  <option value="user">Usuario</option>
                  <option value="support">Soporte</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Estado</label>
                <select v-model="userForm.status" class="form-select" required>
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Departamento</label>
                <input 
                  v-model="userForm.department"
                  type="text"
                  class="form-input"
                  placeholder="Ej: Cauca"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Ciudad</label>
                <input 
                  v-model="userForm.city"
                  type="text"
                  class="form-input"
                  placeholder="Ej: Popayán"
                />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Dirección</label>
                <input 
                  v-model="userForm.address"
                  type="text"
                  class="form-input"
                  placeholder="Calle 5 # 10-20"
                  :required="!editingUser"
                />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Documento de identidad</label>
                <input 
                  v-model="userForm.id_documento"
                  type="text"
                  class="form-input"
                  placeholder="CC 1234567890"
                  :required="!editingUser"
                />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Foto de perfil (opcional)</label>
                <input 
                  type="file"
                  class="form-input"
                  accept="image/*"
                  @change="handlePhotoUpload"
                />
                <small class="form-help">Formatos: JPEG, PNG, GIF. Máx: 10MB</small>
              </div>

              <div v-if="!editingUser" class="form-group full-width">
                <label class="form-label">Contraseña</label>
                <input 
                  v-model="userForm.password"
                  type="password"
                  class="form-input"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeUserModal">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-container delete-modal">
          <div class="delete-icon">⚠️</div>
          <h2 class="modal-title">¿Eliminar usuario?</h2>
          <p class="delete-message">
            Esta acción eliminará permanentemente a 
            <strong>{{ userToDelete?.name }}</strong>. 
            Esta acción no se puede deshacer.
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="closeDeleteModal">
              Cancelar
            </button>
            <button class="btn-danger" @click="deleteUser" :disabled="deleting">
              {{ deleting ? 'Eliminando...' : 'Eliminar usuario' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { userManagementService, type User, type UserStats } from '../../services/userManagementService';
import { eventBus } from '../../events/eventBus';
import { useAlerts } from '../../composables/useAlerts';

const { success, error: showError } = useAlerts();

// Estado
const users = ref<User[]>([]);
const stats = ref<UserStats>({
  total: 0,
  active: 0,
  inactive: 0,
  pending: 0,
  suspended: 0,
  byRole: { user: 0, admin: 0, support: 0 },
});
const loading = ref(true);
const error = ref('');
const statusUpdateLoading = ref<Record<number, boolean>>({});
const paginationLoading = ref(false);

// Filtros
const filters = ref({
  search: '',
  role: '',
  status: '',
  verification_status: '',
  page: 1,
  perPage: 10,
  sortBy: 'created_at',
  sortOrder: 'desc' as 'asc' | 'desc',
});

// Paginación
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  perPage: 10,
  total: 0,
});

// Selección
const selectedUsers = ref<number[]>([]);

// Modales
const showUserModal = ref(false);
const showDeleteModal = ref(false);
const editingUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);
const saving = ref(false);
const deleting = ref(false);

// Formulario
const userForm = ref({
  name: '',
  email: '',
  phone: '',
  role: 'user' as 'user' | 'admin' | 'support',
  status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended',
  address: '',
  id_documento: '',
  department: '',
  city: '',
  password: '',
  photo: null as File | null,
});

// Computed
const hasActiveFilters = computed(() => 
  filters.value.search !== '' || 
  filters.value.role !== '' || 
  filters.value.status !== '' || 
  filters.value.verification_status !== ''
);

const allSelected = computed(() => 
  users.value.length > 0 && selectedUsers.value.length === users.value.length
);

const visiblePages = computed(() => {
  const current = pagination.value.currentPage;
  const last = pagination.value.lastPage;
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  
  let prev = 0;
  for (const i of range) {
    if (prev) {
      if (i - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (i - prev !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    prev = i;
  }
  
  return rangeWithDots;
});

// Métodos
const loadUsers = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await userManagementService.getUsers(filters.value);
    
    users.value = response.data;
    pagination.value = {
      currentPage: response.meta.current_page,
      lastPage: response.meta.last_page,
      perPage: response.meta.per_page,
      total: response.meta.total,
    };
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar usuarios';
    showError('Error al cargar usuarios', 'Error');
    console.error('Error cargando usuarios:', err);
  } finally {
    loading.value = false;
    paginationLoading.value = false;
  }
};

const loadStats = async () => {
  try {
    stats.value = await userManagementService.getUserStats();
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
  }
};

let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.page = 1;
    pagination.value.currentPage = 1;
    loadUsers();
  }, 500);
};

const clearSearch = () => {
  filters.value.search = '';
  filters.value.page = 1;
  pagination.value.currentPage = 1;
  loadUsers();
};

const applyFilters = () => {
  filters.value.page = 1;
  pagination.value.currentPage = 1;
  loadUsers();
};

const clearFilters = () => {
  filters.value.search = '';
  filters.value.role = '';
  filters.value.status = '';
  filters.value.verification_status = '';
  filters.value.page = 1;
  pagination.value.currentPage = 1;
  loadUsers();
};

const sortBy = (field: string) => {
  if (filters.value.sortBy === field) {
    filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    filters.value.sortBy = field;
    filters.value.sortOrder = 'asc';
  }
  filters.value.page = 1;
  pagination.value.currentPage = 1;
  loadUsers();
};

const getSortIcon = (field: string) => {
  if (filters.value.sortBy !== field) return '⇅';
  return filters.value.sortOrder === 'asc' ? '↑' : '↓';
};

const changePage = (page: number | string) => {
  if (typeof page === 'string') return;
  if (page < 1 || page > pagination.value.lastPage || page === pagination.value.currentPage) {
    return;
  }
  paginationLoading.value = true;
  filters.value.page = page;
  loadUsers();
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedUsers.value = [];
  } else {
    selectedUsers.value = users.value.map(u => u.id);
  }
};

const toggleSelectUser = (userId: number) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index > -1) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(userId);
  }
};

const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    userForm.value.photo = input.files[0];
  }
};

const openCreateModal = () => {
  editingUser.value = null;
  userForm.value = {
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    address: '',
    id_documento: '',
    department: '',
    city: '',
    password: '',
    photo: null,
  };
  showUserModal.value = true;
};

const openEditModal = (user: User) => {
  editingUser.value = user;
  userForm.value = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    address: user.address,
    id_documento: user.id_documento,
    department: user.department || '',
    city: user.city || '',
    password: '',
    photo: null,
  };
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
  editingUser.value = null;
};

const saveUser = async () => {
  try {
    saving.value = true;
    
    const formData = new FormData();
    
    // Agregar todos los campos al FormData
    Object.keys(userForm.value).forEach(key => {
      const value = userForm.value[key as keyof typeof userForm.value];
      
      // Saltar el campo photo (se maneja aparte) y campos vacíos en edición
      if (key === 'photo') return;
      
      // En edición, solo incluir campos con valor
      if (editingUser.value && (value === '' || value === null)) {
        return;
      }
      
      // No enviar password vacío en edición
      if (key === 'password' && editingUser.value && !value) {
        return;
      }
      
      if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });
    
    // Agregar foto si existe
    if (userForm.value.photo) {
      formData.append('photo', userForm.value.photo);
    }
    
    // Log para debug
    console.log('Form data a enviar:', {
      isEditing: !!editingUser.value,
      userId: editingUser.value?.id,
      hasPhoto: !!userForm.value.photo,
    });
    
    if (editingUser.value) {
      const updatedUser = await userManagementService.updateUser(
        editingUser.value.id, 
        formData
      );
      console.log('Usuario actualizado:', updatedUser);
      success('Usuario actualizado correctamente', 'Éxito');
    } else {
      await userManagementService.createUser(formData);
      success('Usuario creado correctamente', 'Éxito');
    }
    
    closeUserModal();
    await loadUsers();
    await loadStats();
  } catch (err: any) {
    console.error('Error completo:', err);
    console.error('Response:', err.response?.data);
    
    let errorMsg = 'Error al guardar usuario';
    
    // Manejar errores de validación
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      errorMsg = Object.values(errors).flat().join(', ');
    } else if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    } else if (err.message) {
      errorMsg = err.message;
    }
    
    showError(errorMsg, 'Error');
  } finally {
    saving.value = false;
  }
};

const toggleUserStatus = async (user: User) => {
  try {
    statusUpdateLoading.value[user.id] = true;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await userManagementService.updateUserStatus(user.id, newStatus);
    
    success(
      `Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`,
      'Estado actualizado'
    );
    
    const userIndex = users.value.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users.value[userIndex].status = newStatus;
    }
    
    await loadStats();
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Error al cambiar estado';
    showError(errorMsg, 'Error');
    console.error('Error cambiando estado:', err);
  } finally {
    statusUpdateLoading.value[user.id] = false;
  }
};

const confirmDelete = (user: User) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  userToDelete.value = null;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;
  
  try {
    deleting.value = true;
    await userManagementService.deleteUser(userToDelete.value.id);
    success('Usuario eliminado correctamente', 'Éxito');
    closeDeleteModal();
    await loadUsers();
    await loadStats();
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Error al eliminar usuario';
    showError(errorMsg, 'Error');
    console.error('Error eliminando usuario:', err);
  } finally {
    deleting.value = false;
  }
};

const calculatePercentage = (value: number) => {
  if (stats.value.total === 0) return 0;
  return (value / stats.value.total) * 100;
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatTimeAgo = (date: string) => {
  return userManagementService.formatTimeAgo(date);
};

const getRoleConfig = (role: string) => {
  return userManagementService.getRoleConfig(role);
};

const getStatusConfig = (status: string) => {
  return userManagementService.getStatusConfig(status);
};

const handleUserCreated = () => {
  loadUsers();
  loadStats();
};

const handleUserUpdated = () => {
  loadUsers();
  loadStats();
};

const handleUserDeleted = () => {
  loadUsers();
  loadStats();
};

onMounted(() => {
  loadUsers();
  loadStats();
  
  eventBus.on('user:created', handleUserCreated);
  eventBus.on('user:updated', handleUserUpdated);
  eventBus.on('user:deleted', handleUserDeleted);
  eventBus.on('user:role:updated', handleUserUpdated);
  eventBus.on('user:status:updated', handleUserUpdated);
});

onUnmounted(() => {
  eventBus.off('user:created', handleUserCreated);
  eventBus.off('user:updated', handleUserUpdated);
  eventBus.off('user:deleted', handleUserDeleted);
  eventBus.off('user:role:updated', handleUserUpdated);
  eventBus.off('user:status:updated', handleUserUpdated);
});
</script>

<style scoped>
/* Variables con mejores contrastes y sombras */
:root {
  --primary: #1f2937;
  --primary-light: #374151;
  --accent: #3b251d;
  --accent-light: #8b6f47;
  --success: #059669;
  --warning: #f59e0b;
  --danger: #dc2626;
  --info: #2563eb;
  --bg-primary: #f5f7fa;
  --bg-card: #ffffff;
  --bg-secondary: #e8ecf1;
  --bg-tertiary: #dce1e8;
  --border: #e5e7eb;
  --border-dark: #9ca3af;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04);
}

.users-page {
  animation: fadeIn 0.3s ease;
  background: var(--bg-primary);
  min-height: 100vh;
  padding-bottom: 2rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header con sombra y bordes mejorados */
.page-header {
  background: var(--bg-card);
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-md);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  border: 2px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  letter-spacing: -0.5px;
  font-family: 'Inter', -apple-system, sans-serif;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

/* Buttons con sombras profundas */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Stats Section con sombras */
.stats-section {
  margin-bottom: 2rem;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-color);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  display: block;
}

.stat-content {
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
  font-family: 'Inter', -apple-system, sans-serif;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-chart {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.stat-bar {
  height: 100%;
  background: var(--accent-color);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Filters con mejor contraste */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  pointer-events: none;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, sans-serif;
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 37, 29, 0.1), var(--shadow-md);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--bg-tertiary);
  border: 1px solid #e5e7eb;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
}

.clear-btn:hover {
  background: var(--border-dark);
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.875rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, sans-serif;
  box-shadow: var(--shadow-sm);
}

.filter-select:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 37, 29, 0.1), var(--shadow-md);
}

.btn-clear-filters {
  padding: 0.875rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-clear-filters:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-dark);
  box-shadow: var(--shadow-md);
}

/* Table Section con sombras fuertes */
.table-section {
  background: var(--bg-card);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s backwards;
  box-shadow: var(--shadow-lg);
}

/* Loading, Error, Empty States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--bg-tertiary);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

.btn-retry {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
}

.btn-retry:hover {
  background: var(--accent-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Table mejorada */
.table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.users-table thead {
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--border-dark);
}

.users-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.users-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.users-table th.sortable:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.sort-icon {
  margin-left: 0.5rem;
  opacity: 0.5;
}

.users-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.95rem;
  color: var(--text-primary);
  background: var(--bg-card);
}

.user-row {
  transition: all 0.2s ease;
  animation: fadeInRow 0.3s ease backwards;
}

.user-row:nth-child(1) { animation-delay: 0.05s; }
.user-row:nth-child(2) { animation-delay: 0.1s; }
.user-row:nth-child(3) { animation-delay: 0.15s; }
.user-row:nth-child(4) { animation-delay: 0.2s; }
.user-row:nth-child(5) { animation-delay: 0.25s; }

@keyframes fadeInRow {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.user-row:hover td {
  background: var(--bg-secondary);
}

.user-row.selected td {
  background: rgba(59, 37, 29, 0.08);
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.user-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  border: 1px solid #e5e7eb;
  border-radius: 20px;
}

.avatar-img {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.avatar-placeholder {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  border: 2px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: var(--shadow-sm);
}

.badge-icon {
  font-size: 0.9rem;
}

.date-cell {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: var(--bg-card);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-edit:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.btn-toggle:hover {
  background: #fef3c7;
  border-color: #f59e0b;
}

.btn-delete:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

/* Pagination con sombras */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
}

.pagination-btn {
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Modal con backdrop blur y sombras profundas */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: fadeInOverlay 0.2s ease;
  backdrop-filter: blur(10px);
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: var(--bg-card);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideUpModal 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e7eb;
}

@keyframes slideUpModal {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(to bottom, var(--bg-card), var(--bg-secondary));
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: var(--bg-card);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.modal-close:hover {
  background: var(--border);
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}

.modal-form {
  padding: 2rem;
  background: var(--bg-card);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
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
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input,
.form-select {
  padding: 0.875rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, sans-serif;
  box-shadow: var(--shadow-sm);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 37, 29, 0.1), var(--shadow-md);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 0.875rem 1.75rem;
  border: 1px solid #e5e7eb;
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-dark);
  box-shadow: var(--shadow-md);
}

.btn-danger {
  padding: 0.875rem 1.75rem;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
}

.btn-danger:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.delete-modal {
  max-width: 440px;
  text-align: center;
}

.delete-icon {
  font-size: 4rem;
  margin: 2rem 0 1rem;
}

.delete-message {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 1rem 0 2rem;
  padding: 0 1rem;
}

.delete-message strong {
  color: var(--text-primary);
  font-weight: 700;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-controls {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: 1;
  }

  .users-table th,
  .users-table td {
    padding: 0.875rem;
    font-size: 0.85rem;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-container {
    margin: 1rem;
  }
}

/* Estilos para el badge de verificación */
.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.verification-badge.verified {
  background: #f0fdf4;
  color: #059669;
}

.verification-badge.pending {
  background: #fffbeb;
  color: #f59e0b;
}

.verification-badge.pending:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.badge-icon {
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Indicador de carga para botones de estado */
.loading-dots {
  display: inline-block;
  width: 12px;
  height: 12px;
  position: relative;
}

.loading-dots::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  animation: dots 1.4s infinite;
}

@keyframes dots {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

/* Para el caso de querer agregar fecha de verificación (opcional) */
.verification-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  font-weight: 500;
  text-align: center;
}

/* Ajustes responsive para la columna de verificación */
@media (max-width: 1024px) {
  .verification-badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .users-table th:nth-child(5),
  .users-table td:nth-child(5) {
    display: none;
  }
  
  .verification-badge {
    min-width: 90px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .verification-badge {
    min-width: 80px;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .badge-icon {
    font-size: 0.8rem;
  }
}

/* Estilos del paginador */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-page {
  min-width: 40px;
  height: 40px;
  padding: 0.5rem;
  background: var(--bg-card);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.pagination-page:hover:not(:disabled):not(.active) {
  background: var(--bg-tertiary);
  border-color: var(--border-dark);
  transform: translateY(-1px);
}

.pagination-page.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
}

.pagination-page:disabled {
  cursor: default;
  opacity: 0.6;
}

.pagination-info {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-btn,
  .pagination-pages,
  .pagination-info {
    width: 100%;
  }

  .pagination-pages {
    justify-content: center;
  }

  .pagination-info {
    text-align: center;
  }
} 
</style>
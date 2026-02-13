// services/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// ==================== CONFIGURACIÓN BASE ====================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://api.rentus/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 segundos
});

// ==================== HELPERS ====================

/**
 * Obtener token del storage
 */
const getToken = (): string | null => {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
};

/**
 * Guardar token en storage
 */
const saveToken = (token: string, remember: boolean = false) => {
  if (remember) {
    localStorage.setItem("auth_token", token);
    sessionStorage.removeItem("auth_token");
  } else {
    sessionStorage.setItem("auth_token", token);
    localStorage.removeItem("auth_token");
  }
};

/**
 * Limpiar storage
 */
const clearStorage = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("user");
};

// ==================== INTERCEPTOR DE REQUEST ====================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    // Agregar token a los headers si existe
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Error en request:", error);
    return Promise.reject(error);
  }
);

// ==================== INTERCEPTOR DE RESPONSE ====================

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Procesar cola de peticiones fallidas después del refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Response exitoso, retornarlo directamente
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Si no hay config, rechazar directamente
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ==================== MANEJO DE 401 (TOKEN EXPIRADO) ====================
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Evitar loop infinito
      if (originalRequest.url?.includes("/auth/refresh")) {
        console.log("❌ Refresh token expirado, limpiando sesión");
        clearStorage();
        
        // IMPORTANTE: NO redirigir aquí, dejar que el router maneje esto
        // Solo eliminar el token inválido
        return Promise.reject(error);
      }

      // Si estamos en el home y no hay token, simplemente rechazar sin redirigir
      const token = getToken();
      if (!token) {
        console.log("🔓 No hay token, rechazando petición (ruta pública)");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Ya hay un refresh en proceso, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Token expirado, intentando refresh...");

        // Intentar refrescar el token
        const response = await api.post("/auth/refresh");

        if (response.data.success && response.data.token) {
          const newToken = response.data.token;
          const isRemembered = !!localStorage.getItem("auth_token");

          // Guardar nuevo token
          saveToken(newToken, isRemembered);

          // Actualizar header de la petición original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Procesar cola de peticiones fallidas
          processQueue(null, newToken);

          console.log("✅ Token refrescado exitosamente");

          // Reintentar petición original
          return api(originalRequest);
        } else {
          throw new Error("No se pudo refrescar el token");
        }
      } catch (refreshError) {
        console.error("❌ Error al refrescar token:", refreshError);

        // Procesar cola con error
        processQueue(refreshError as Error, null);

        // Limpiar storage pero NO redirigir automáticamente
        clearStorage();
        console.log("🧹 Sesión limpiada, el router manejará la redirección si es necesario");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ==================== OTROS ERRORES ====================

    // 403: Forbidden (cuenta inactiva, no verificada, etc.)
    if (error.response?.status === 403) {
      console.warn("⚠️ Acceso denegado (403)");
    }

    // 422: Validation Error
    if (error.response?.status === 422) {
      console.warn("⚠️ Error de validación (422)");
    }

    // 429: Too Many Requests
    if (error.response?.status === 429) {
      console.warn("⚠️ Demasiadas peticiones (429)");
    }

    // 500: Server Error
    if (error.response?.status === 500) {
      console.error("❌ Error del servidor (500)");
    }

    // Timeout
    if (error.code === "ECONNABORTED") {
      console.error("❌ Timeout: La petición tardó demasiado");
    }

    // Network Error
    if (!error.response) {
      console.error("❌ Error de red: No se pudo conectar al servidor");
    }

    return Promise.reject(error);
  }
);

// API de Google Maps (sin cambios)
const googleApi = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
  timeout: 10000,
});

export { api, googleApi };
export default api;
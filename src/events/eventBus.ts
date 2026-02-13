// eventBus.ts - Sistema de eventos para la aplicación

type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  // Eventos de perfil
  PROFILE_PHOTO_UPDATED: 'profile:photo:updated',
  
  // Eventos de idioma
  LANGUAGE_CHANGED: 'language:changed',
  
  // Eventos de autenticación
  USER_LOGGED_IN: 'user:logged:in',
  USER_LOGGED_OUT: 'user:logged:out',
  
  // Eventos de notificaciones
  NOTIFICATION_RECEIVED: 'notification:received',
  NOTIFICATION_READ: 'notification:read',
  
  // Eventos de gestión de usuarios (nuevos)
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_ROLE_UPDATED: 'user:role:updated',
  USER_STATUS_UPDATED: 'user:status:updated',
  USER_PHOTO_UPDATED: 'user:photo:updated',
} as const;
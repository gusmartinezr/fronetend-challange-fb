export const APP_CONSTANTS = {
  APP_NAME: 'Task Manager',
  VERSION: '1.0.0',

  STORAGE_KEYS: {
    CURRENT_USER: 'currentUser',
    AUTH_TOKEN: 'authToken'
  },

  VALIDATION: {
    EMAIL: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 100,
      PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    TASK: {
      TITLE: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 100
      },
      DESCRIPTION: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 500
      }
    }
  },

  NOTIFICATION: {
    DURATION: {
      SHORT: 2000,
      MEDIUM: 3000,
      LONG: 5000
    }
  },

  DIALOG: {
    WIDTH: {
      SMALL: '400px',
      MEDIUM: '600px',
      LARGE: '800px'
    }
  },

  HTTP: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
  }
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta nuevamente más tarde.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.'
};

export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Tarea creada exitosamente',
  TASK_UPDATED: 'Tarea actualizada exitosamente',
  TASK_DELETED: 'Tarea eliminada exitosamente',
  USER_CREATED: 'Usuario creado exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente'
};

/*
 * Proyecto: PORTAL SIPPASE - ROBITCMS
 * Autor: Christian Mollo
 * Contacto: gnuchrismo@gmail.com | LinkedIn: https://www.linkedin.com/in/gnuchrismo/?locale=es_ES
 * Patrocinado por: UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025
 *
 * Licencia: PROPIETARIA - Uso exclusivo autorizado para la entidad beneficiaria.
 * Queda prohibida la copia, distribución, modificación o uso no autorizado.
 *
 * Advertencia: Algunas partes de este proyecto utilizan librerías o frameworks
 * de terceros bajo licencias propias (por ejemplo Quasar Framework - MIT License).
 * Se debe cumplir con todas las licencias externas involucradas.
 *
 * © 2025 Desarrollado por Christian Mollo - UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025, Todos los derechos reservados.
 */
/**
 * Custom Error Classes for HTTP/HTTPS Error Handling
 * Provides structured error responses with appropriate status codes
 */

/**
 * Base Application Error Class
 * All custom errors extend from this class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.details && { details: this.details })
      }
    };
  }
}

/**
 * 400 Bad Request
 * Used for validation errors and malformed requests
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, true, details);
  }
}

/**
 * 401 Unauthorized
 * Used when authentication is required but not provided or invalid
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, true);
  }
}

/**
 * 403 Forbidden
 * Used when user is authenticated but lacks permission
 */
class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, true);
  }
}

/**
 * 404 Not Found
 * Used when requested resource doesn't exist
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true);
  }
}

/**
 * 409 Conflict
 * Used for conflicts like duplicate entries
 */
class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, true, details);
  }
}

/**
 * 422 Unprocessable Entity
 * Used when request is valid but cannot be processed
 */
class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity', details = null) {
    super(message, 422, true, details);
  }
}

/**
 * 429 Too Many Requests
 * Used for rate limiting
 */
class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, true);
  }
}

/**
 * 500 Internal Server Error
 * Used for unexpected server errors
 */
class InternalError extends AppError {
  constructor(message = 'Internal server error', isOperational = false) {
    super(message, 500, isOperational);
  }
}

/**
 * 503 Service Unavailable
 * Used when service is temporarily unavailable
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, true);
  }
}

/**
 * Database Error
 * Wraps database-specific errors
 */
class DatabaseError extends AppError {
  constructor(message = 'Database error', originalError = null) {
    super(message, 500, false, originalError?.message);
    this.originalError = originalError;
  }
}

/**
 * File Upload Error
 * For file upload related errors
 */
class FileUploadError extends AppError {
  constructor(message = 'File upload error', details = null) {
    super(message, 400, true, details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  InternalError,
  ServiceUnavailableError,
  DatabaseError,
  FileUploadError
};

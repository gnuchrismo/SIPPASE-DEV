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
 * Error Handling Middleware
 * Centralized error handling for HTTP/HTTPS requests
 */

const logger = require('../utils/logger');
const { AppError, NotFoundError } = require('../utils/errors');

/**
 * 404 Not Found Handler
 * Catches all requests that don't match any routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Error Logger Middleware
 * Logs all errors before sending response
 */
const errorLogger = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    statusCode: err.statusCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    stack: err.stack,
    ...(err.details && { details: err.details })
  });
  
  next(err);
};

/**
 * Development Error Response
 * Includes stack trace and detailed information
 */
const sendErrorDev = (err, req, res) => {
  logger.debug('Sending detailed error response (development mode)');
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    error: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      timestamp: err.timestamp || new Date().toISOString(),
      ...(err.details && { details: err.details }),
      path: req.originalUrl,
      method: req.method
    }
  });
};

/**
 * Production Error Response
 * Sanitized error response without sensitive information
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
      timestamp: err.timestamp || new Date().toISOString(),
      ...(err.details && { details: err.details })
    });
  } 
  // Programming or unknown error: don't leak error details
  else {
    logger.error('NON-OPERATIONAL ERROR (Programming error):', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Handle specific error types
 */
const handleSpecificErrors = (err) => {
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const { FileUploadError } = require('../utils/errors');
    return new FileUploadError('File size exceeds maximum limit (5MB)');
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    const { FileUploadError } = require('../utils/errors');
    return new FileUploadError('Too many files uploaded');
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const { FileUploadError } = require('../utils/errors');
    return new FileUploadError('Unexpected file field');
  }
  
  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    const { ConflictError } = require('../utils/errors');
    return new ConflictError('Resource already exists', { code: err.code });
  }
  
  if (err.code === '23503') { // Foreign key violation
    const { ValidationError } = require('../utils/errors');
    return new ValidationError('Referenced resource does not exist', { code: err.code });
  }
  
  if (err.code === '22P02') { // Invalid text representation
    const { ValidationError } = require('../utils/errors');
    return new ValidationError('Invalid data format', { code: err.code });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const { UnauthorizedError } = require('../utils/errors');
    return new UnauthorizedError('Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    const { UnauthorizedError } = require('../utils/errors');
    return new UnauthorizedError('Token has expired');
  }
  
  // Validation errors from express-validator
  if (err.errors && Array.isArray(err.errors)) {
    const { ValidationError } = require('../utils/errors');
    return new ValidationError('Validation failed', err.errors);
  }
  
  return err;
};

/**
 * Global Error Handler
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  // Set default status code if not set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Handle specific error types
  let error = handleSpecificErrors(err);
  
  // If error is not an AppError instance, wrap it
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Internal server error',
      error.statusCode || 500,
      false
    );
  }
  
  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request Logger Middleware
 * Logs all incoming requests
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.http(req, res, duration);
  });
  
  next();
};

module.exports = {
  notFoundHandler,
  errorLogger,
  errorHandler,
  asyncHandler,
  requestLogger
};

/**
 * Centralized error handling service
 */

import { ApiError, ApiClientError, getErrorMessage } from '../utils/apiUtils';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface ErrorHandler {
  handle(error: Error, context?: ErrorContext): void;
}

export interface ErrorLogEntry {
  id: string;
  error: Error;
  context: ErrorContext;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorService {
  private handlers: ErrorHandler[] = [];
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100;

  addHandler(handler: ErrorHandler) {
    this.handlers.push(handler);
  }

  removeHandler(handler: ErrorHandler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  handle(error: Error, context: ErrorContext = {}) {
    const logEntry: ErrorLogEntry = {
      id: this.generateId(),
      error,
      context: {
        ...context,
        timestamp: new Date()
      },
      timestamp: new Date(),
      severity: this.determineSeverity(error)
    };

    // Add to logs
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Call all handlers
    this.handlers.forEach(handler => {
      try {
        handler.handle(error, context);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private determineSeverity(error: Error): ErrorLogEntry['severity'] {
    if (error instanceof ApiClientError) {
      if (error.status >= 500) return 'critical';
      if (error.status >= 400) return 'medium';
      return 'low';
    }

    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }

    return 'medium';
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  getLogsByComponent(component: string): ErrorLogEntry[] {
    return this.logs.filter(log => log.context.component === component);
  }

  getLogsBySeverity(severity: ErrorLogEntry['severity']): ErrorLogEntry[] {
    return this.logs.filter(log => log.severity === severity);
  }
}

// Console error handler
export class ConsoleErrorHandler implements ErrorHandler {
  handle(error: Error, context?: ErrorContext) {
    const message = getErrorMessage(error);
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    
    console.error(`Error: ${message}${contextStr}`, error);
  }
}

// API error handler for sending errors to a service
export class ApiErrorHandler implements ErrorHandler {
  constructor(private apiEndpoint: string) {}

  async handle(error: Error, context?: ErrorContext) {
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          name: error.name,
          context,
          timestamp: new Date().toISOString()
        })
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }
}

// Toast notification error handler
export class ToastErrorHandler implements ErrorHandler {
  constructor(private showToast: (message: string, type: 'error' | 'warning' | 'info') => void) {}

  handle(error: Error, context?: ErrorContext) {
    const message = getErrorMessage(error);
    
    // Only show user-friendly messages for certain error types
    if (error instanceof ApiClientError) {
      if (error.status >= 400 && error.status < 500) {
        this.showToast(message, 'warning');
      } else if (error.status >= 500) {
        this.showToast('Sunucu hatası oluştu. Lütfen tekrar deneyin.', 'error');
      }
    } else {
      this.showToast('Beklenmedik bir hata oluştu.', 'error');
    }
  }
}

// User feedback error handler
export class UserFeedbackErrorHandler implements ErrorHandler {
  constructor(
    private showError: (message: string, details?: string) => void,
    private getUserFriendlyMessage: (error: Error) => string
  ) {}

  handle(error: Error, context?: ErrorContext) {
    const userMessage = this.getUserFriendlyMessage(error);
    const details = error.stack || error.message;
    
    this.showError(userMessage, details);
  }
}

// Retry error handler
export class RetryErrorHandler implements ErrorHandler {
  private retryAttempts: Map<string, number> = new Map();
  
  constructor(
    private maxRetries: number = 3,
    private retryDelay: number = 1000,
    private shouldRetry: (error: Error) => boolean = () => true
  ) {}

  handle(error: Error, context?: ErrorContext) {
    if (!this.shouldRetry(error) || !context?.action) {
      return;
    }

    const key = `${context.component || 'unknown'}-${context.action}`;
    const attempts = this.retryAttempts.get(key) || 0;

    if (attempts < this.maxRetries) {
      this.retryAttempts.set(key, attempts + 1);
      
      setTimeout(() => {
        console.log(`Retrying action: ${context.action} (attempt ${attempts + 1})`);
        // In a real implementation, you'd need a way to retry the action
      }, this.retryDelay * Math.pow(2, attempts)); // Exponential backoff
    } else {
      this.retryAttempts.delete(key);
    }
  }
}

// Default error service instance
export const errorService = new ErrorService();

// Add default handlers
errorService.addHandler(new ConsoleErrorHandler());

// Utility functions for common error scenarios
export function handleApiError(error: unknown, context?: ErrorContext) {
  if (error instanceof Error) {
    errorService.handle(error, { ...context, action: 'api_request' });
  } else {
    errorService.handle(new Error(String(error)), { ...context, action: 'api_request' });
  }
}

export function handleComponentError(error: Error, componentName: string, additionalContext?: Record<string, any>) {
  errorService.handle(error, {
    component: componentName,
    action: 'render',
    ...additionalContext
  });
}

export function handleAsyncError(error: Error, action: string, context?: ErrorContext) {
  errorService.handle(error, {
    ...context,
    action
  });
}

// React error boundary helper
export function createErrorBoundary(componentName: string) {
  return class extends Error {
    constructor(message: string, public componentStack?: string) {
      super(message);
      this.name = 'ComponentError';
      
      handleComponentError(this, componentName, {
        componentStack: this.componentStack
      });
    }
  };
}

// Global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorService.handle(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      { action: 'unhandled_promise_rejection' }
    );
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorService.handle(event.error || new Error(event.message), {
      action: 'uncaught_error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });
}

export { errorService as default };
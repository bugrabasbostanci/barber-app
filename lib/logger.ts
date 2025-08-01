/**
 * Structured logging system
 * Replaces console.log calls with secure, structured logging
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogContext {
  userId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLogEntry(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty format for development
      const contextStr = entry.context ? 
        ` [${entry.context.component || 'App'}${entry.context.action ? `::${entry.context.action}` : ''}]` : '';
      
      return `${entry.timestamp} ${entry.level.toUpperCase()}${contextStr}: ${entry.message}`;
    } else {
      // JSON format for production
      return JSON.stringify(entry);
    }
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;
    
    const sanitized = { ...context };
    
    // Remove sensitive data from metadata
    if (sanitized.metadata) {
      const cleanMetadata = { ...sanitized.metadata };
      
      // Remove common sensitive fields
      delete cleanMetadata.password;
      delete cleanMetadata.token;
      delete cleanMetadata.apiKey;
      delete cleanMetadata.secret;
      
      // Sanitize email and phone
      if (cleanMetadata.email && typeof cleanMetadata.email === 'string') {
        cleanMetadata.email = cleanMetadata.email.replace(/(.{2}).*@/, '$1***@');
      }
      if (cleanMetadata.phone && typeof cleanMetadata.phone === 'string') {
        cleanMetadata.phone = cleanMetadata.phone.replace(/(.{3}).*(.{2})/, '$1***$2');
      }
      
      sanitized.metadata = cleanMetadata;
    }
    
    return sanitized;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context),
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    const formattedLog = this.formatLogEntry(entry);

    // Output to appropriate stream
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        if (!this.isProduction) console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) console.debug(formattedLog);
        break;
    }

    // Send to external logging service in production
    if (this.isProduction && level === LogLevel.ERROR) {
      this.sendToExternalLogger(entry);
    }
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    // Placeholder for external logging service integration
    // e.g., Sentry, LogRocket, Datadog, etc.
    try {
      if (process.env.LOG_WEBHOOK_URL) {
        await fetch(process.env.LOG_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      }
    } catch (error) {
      // Fallback to console if external logging fails
      console.error('Failed to send log to external service:', error);
    }
  }

  /**
   * Log error messages
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log info messages (development only by default)
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Create a logger with predefined context
   */
  withContext(context: LogContext): ContextLogger {
    return new ContextLogger(this, context);
  }

  /**
   * Log API request/response
   */
  api(message: string, context: {
    method: string;
    path: string;
    userId?: string;
    statusCode?: number;
    responseTime?: number;
    error?: Error;
  }): void {
    const level = context.error ? LogLevel.ERROR : 
                 context.statusCode && context.statusCode >= 400 ? LogLevel.WARN : 
                 LogLevel.INFO;
    
    this.log(level, message, {
      component: 'API',
      action: `${context.method} ${context.path}`,
      userId: context.userId,
      metadata: {
        statusCode: context.statusCode,
        responseTime: context.responseTime,
      }
    }, context.error);
  }

  /**
   * Log database operations
   */
  database(message: string, context: {
    operation: string;
    table?: string;
    userId?: string;
    duration?: number;
    error?: Error;
  }): void {
    const level = context.error ? LogLevel.ERROR : LogLevel.DEBUG;
    
    this.log(level, message, {
      component: 'Database',
      action: context.operation,
      userId: context.userId,
      metadata: {
        table: context.table,
        duration: context.duration,
      }
    }, context.error);
  }
}

/**
 * Context logger for component-specific logging
 */
class ContextLogger {
  constructor(private logger: Logger, private defaultContext: LogContext) {}

  error(message: string, additionalContext?: Partial<LogContext>, error?: Error): void {
    this.logger.error(message, { ...this.defaultContext, ...additionalContext }, error);
  }

  warn(message: string, additionalContext?: Partial<LogContext>): void {
    this.logger.warn(message, { ...this.defaultContext, ...additionalContext });
  }

  info(message: string, additionalContext?: Partial<LogContext>): void {
    this.logger.info(message, { ...this.defaultContext, ...additionalContext });
  }

  debug(message: string, additionalContext?: Partial<LogContext>): void {
    this.logger.debug(message, { ...this.defaultContext, ...additionalContext });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory functions for common use cases
export const createApiLogger = (path: string) => 
  logger.withContext({ component: 'API', metadata: { path } });

export const createComponentLogger = (component: string) => 
  logger.withContext({ component });

export const createUserLogger = (userId: string, component?: string) => 
  logger.withContext({ userId, component });

// Export types for TypeScript
export type { LogContext, LogEntry };
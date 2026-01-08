/**
 * 今日头条 MCP 服务器领域错误类
 *
 * 按业务领域划分的错误类：
 * - AuthenticationError: 认证相关错误
 * - PublishError: 发布相关错误
 * - AnalyticsError: 数据分析相关错误
 * - ConfigError: 配置相关错误
 * - SystemError: 系统级错误
 */

import { TouTiaoError } from './base-error';
import { ErrorCode } from './error-codes';

// ==================== 认证错误 ====================

export class AuthenticationError extends TouTiaoError {
  constructor(
    code: ErrorCode = ErrorCode.AUTH_LOGIN_FAILED,
    message?: string,
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
      retryable?: boolean;
    }
  ) {
    super(code, message, options);
    this.name = 'AuthenticationError';
  }
}

/**
 * 会话过期错误
 */
export class SessionExpiredError extends AuthenticationError {
  constructor(message?: string, context?: Record<string, any>) {
    super(
      ErrorCode.AUTH_SESSION_EXPIRED,
      message || '会话已过期，请重新登录',
      { context, retryable: false }
    );
    this.name = 'SessionExpiredError';
  }
}

/**
 * Cookie 错误
 */
export class CookieError extends AuthenticationError {
  constructor(
    code: ErrorCode,
    message?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(code, message, { originalError, context, retryable: false });
    this.name = 'CookieError';
  }
}

// ==================== 发布错误 ====================

export class PublishError extends TouTiaoError {
  constructor(
    code: ErrorCode,
    message?: string,
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
      retryable?: boolean;
    }
  ) {
    super(code, message, options);
    this.name = 'PublishError';
  }
}

/**
 * 网络错误（可重试）
 */
export class NetworkError extends PublishError {
  constructor(
    message?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(
      ErrorCode.PUBLISH_NETWORK_ERROR,
      message || '网络请求失败',
      { originalError, context, retryable: true }
    );
    this.name = 'NetworkError';
  }
}

/**
 * 元素未找到错误（可重试）
 */
export class ElementNotFoundError extends PublishError {
  constructor(
    selector: string,
    context?: Record<string, any>
  ) {
    super(
      ErrorCode.PUBLISH_ELEMENT_NOT_FOUND,
      `页面元素未找到: ${selector}`,
      { context: { selector, ...context }, retryable: true }
    );
    this.name = 'ElementNotFoundError';
  }
}

/**
 * 浏览器错误
 */
export class BrowserError extends PublishError {
  constructor(
    code: ErrorCode,
    message?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(code, message, { originalError, context, retryable: false });
    this.name = 'BrowserError';
  }
}

/**
 * 参数验证错误
 */
export class ValidationError extends PublishError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(
      ErrorCode.PUBLISH_VALIDATION_FAILED,
      message,
      { context, retryable: false }
    );
    this.name = 'ValidationError';
  }
}

// ==================== 数据分析错误 ====================

export class AnalyticsError extends TouTiaoError {
  constructor(
    code: ErrorCode,
    message?: string,
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
      retryable?: boolean;
    }
  ) {
    super(code, message, options);
    this.name = 'AnalyticsError';
  }
}

// ==================== 配置错误 ====================

export class ConfigError extends TouTiaoError {
  constructor(
    code: ErrorCode = ErrorCode.CONFIG_LOAD_FAILED,
    message?: string,
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(code, message, { ...options, retryable: false });
    this.name = 'ConfigError';
  }
}

// ==================== 系统错误 ====================

export class SystemError extends TouTiaoError {
  constructor(
    code: ErrorCode = ErrorCode.SYSTEM_UNKNOWN_ERROR,
    message?: string,
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
      retryable?: boolean;
    }
  ) {
    super(code, message, options);
    this.name = 'SystemError';
  }
}

/**
 * 文件系统错误
 */
export class FileSystemError extends SystemError {
  constructor(
    operation: string,
    filePath: string,
    originalError?: Error
  ) {
    super(
      ErrorCode.SYSTEM_FILE_ERROR,
      `文件系统操作失败: ${operation}`,
      {
        originalError,
        context: { operation, filePath },
        retryable: false
      }
    );
    this.name = 'FileSystemError';
  }
}

/**
 * 加密/解密错误
 */
export class CryptoError extends SystemError {
  constructor(
    operation: string,
    originalError?: Error
  ) {
    super(
      ErrorCode.SYSTEM_CRYPTO_ERROR,
      `加密/解密操作失败: ${operation}`,
      {
        originalError,
        context: { operation },
        retryable: false
      }
    );
    this.name = 'CryptoError';
  }
}

/**
 * 今日头条 MCP 服务器基础错误类
 */

import { ErrorCode, getErrorMessage } from './error-codes';

/**
 * 基础错误类
 * 所有自定义错误都应继承此类
 */
export class TouTiaoError extends Error {
  /** 错误码 */
  public readonly code: ErrorCode;

  /** 原始错误对象 */
  public readonly originalError?: Error;

  /** 错误上下文信息 */
  public readonly context?: Record<string, any>;

  /** 时间戳 */
  public readonly timestamp: number;

  /** 是否可重试 */
  public readonly retryable: boolean;

  constructor(
    code: ErrorCode,
    message?: string,
    options?: {
      originalError?: Error;
      context?: Record<string, any>;
      retryable?: boolean;
    }
  ) {
    // 使用提供的消息或默认消息
    const errorMessage = message || getErrorMessage(code);
    super(errorMessage);

    this.name = 'TouTiaoError';
    this.code = code;
    this.originalError = options?.originalError;
    this.context = options?.context;
    this.retryable = options?.retryable ?? false;
    this.timestamp = Date.now();

    // 保持正确的堆栈跟踪 (仅在 V8 引擎中有效)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // 如果有原始错误，将其堆栈附加到当前堆栈
    if (options?.originalError && options.originalError.stack) {
      this.stack = `${this.stack}\nCaused by: ${options.originalError.stack}`;
    }
  }

  /**
   * 转换为 JSON 格式（用于日志记录）
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      retryable: this.retryable,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack,
      } : undefined,
    };
  }

  /**
   * 转换为用户友好的消息
   */
  toUserMessage(): string {
    return `[错误 ${this.code}] ${this.message}`;
  }
}

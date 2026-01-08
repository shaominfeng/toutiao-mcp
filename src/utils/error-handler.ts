/**
 * 今日头条 MCP 服务器错误处理工具
 *
 * 提供统一的错误处理、重试、恢复策略
 */

import { TouTiaoError } from '../errors';
import { logger } from './logger';

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number;
  /** 初始延迟（毫秒） */
  initialDelay: number;
  /** 最大延迟（毫秒） */
  maxDelay: number;
  /** 延迟倍增因子 */
  multiplier: number;
  /** 是否使用指数退避 */
  exponentialBackoff: boolean;
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  multiplier: 2,
  exponentialBackoff: true,
};

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 处理错误（记录日志）
   */
  static handle(error: Error | TouTiaoError, context?: string): void {
    if (error instanceof TouTiaoError) {
      logger.error(
        `[${context || 'Unknown'}] ${error.name}`,
        error,
        error.context
      );
    } else {
      logger.error(
        `[${context || 'Unknown'}] ${error.name}: ${error.message}`,
        error
      );
    }
  }

  /**
   * 重试函数执行
   *
   * @param fn 要执行的异步函数
   * @param config 重试配置
   * @param context 上下文名称（用于日志）
   * @returns 函数执行结果
   */
  static async retry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context: string = 'Operation'
  ): Promise<T> {
    const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error;
    let delay = retryConfig.initialDelay;

    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        logger.debug(`${context} - Attempt ${attempt}/${retryConfig.maxRetries}`);
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // 检查是否可重试
        if (error instanceof TouTiaoError && !error.retryable) {
          logger.warn(`${context} - Error is not retryable`, { code: error.code });
          throw error;
        }

        // 最后一次尝试
        if (attempt >= retryConfig.maxRetries) {
          logger.error(`${context} - All ${retryConfig.maxRetries} attempts failed`, lastError);
          throw lastError;
        }

        // 记录重试
        logger.warn(`${context} - Attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: (error as Error).message,
          attempt,
          nextDelay: delay,
        });

        // 等待后重试
        await this.sleep(delay);

        // 计算下次延迟（指数退避）
        if (retryConfig.exponentialBackoff) {
          delay = Math.min(delay * retryConfig.multiplier, retryConfig.maxDelay);
        }
      }
    }

    // 不应该到达这里，但为了类型安全
    throw lastError!;
  }

  /**
   * 带超时的执行
   *
   * @param fn 要执行的异步函数
   * @param timeoutMs 超时时间（毫秒）
   * @param context 上下文名称
   * @returns 函数执行结果
   */
  static async withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    context: string = 'Operation'
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => {
          logger.error(`${context} - Timeout after ${timeoutMs}ms`);
          reject(new Error(`${context} timeout after ${timeoutMs}ms`));
        }, timeoutMs)
      ),
    ]);
  }

  /**
   * 安全执行（捕获错误并返回默认值）
   *
   * @param fn 要执行的异步函数
   * @param defaultValue 出错时返回的默认值
   * @param context 上下文名称
   * @returns 函数执行结果或默认值
   */
  static async safe<T>(
    fn: () => Promise<T>,
    defaultValue: T,
    context: string = 'Operation'
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      logger.warn(`${context} - Returning default value due to error`, {
        error: (error as Error).message,
      });
      return defaultValue;
    }
  }

  /**
   * 包装错误（将普通错误转换为自定义错误）
   *
   * @param error 原始错误
   * @param TouTiaoErrorClass 目标错误类
   * @param message 错误消息
   * @param context 上下文信息
   * @returns 包装后的错误
   */
  static wrap<T extends TouTiaoError>(
    error: Error,
    TouTiaoErrorClass: new (...args: any[]) => T,
    message?: string,
    context?: Record<string, any>
  ): T {
    if (error instanceof TouTiaoErrorClass) {
      return error;
    }

    // 创建新错误实例（需要根据具体错误类调整参数）
    // 这里是简化版本，实际使用时可能需要更复杂的逻辑
    return new TouTiaoErrorClass(
      message || error.message,
      { originalError: error, context }
    ) as T;
  }

  /**
   * 休眠函数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 便捷方法：重试装饰器工厂
 *
 * 使用示例:
 * @retry({ maxRetries: 5 })
 * async myMethod() { ... }
 */
export function retry(config: Partial<RetryConfig> = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return ErrorHandler.retry(
        () => originalMethod.apply(this, args),
        config,
        `${target.constructor.name}.${propertyKey}`
      );
    };

    return descriptor;
  };
}

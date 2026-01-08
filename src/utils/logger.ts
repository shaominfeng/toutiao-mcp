/**
 * 今日头条 MCP 服务器日志系统
 *
 * 基于 Winston 实现的结构化日志系统，支持：
 * - 多个日志级别 (error, warn, info, debug)
 * - 文件输出（按日期轮转）
 * - 控制台彩色输出
 * - 结构化 JSON 日志
 * - 自动错误堆栈记录
 */

import * as winston from 'winston';
import * as path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { TouTiaoError } from '../errors';

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * 日志配置
 */
interface LoggerConfig {
  level: LogLevel;
  logDir: string;
  enableConsole: boolean;
  enableFile: boolean;
  maxFiles: string;
  maxSize: string;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
  logDir: process.env.LOG_DIR || path.join(process.cwd(), 'logs'),
  enableConsole: process.env.ENABLE_CONSOLE_LOG !== 'false',
  enableFile: process.env.ENABLE_FILE_LOG !== 'false',
  maxFiles: '14d', // 保留 14 天
  maxSize: '20m',  // 单文件最大 20MB
};

/**
 * 自定义日志格式
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.json()
);

/**
 * 控制台格式（彩色、易读）
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // 添加上下文
    if (context) {
      log += ` ${JSON.stringify(context)}`;
    }

    // 添加其他元数据
    const metaKeys = Object.keys(meta).filter(k => k !== 'timestamp' && k !== 'level');
    if (metaKeys.length > 0) {
      const metaObj: Record<string, any> = {};
      metaKeys.forEach(k => metaObj[k] = meta[k]);
      log += ` ${JSON.stringify(metaObj)}`;
    }

    return log;
  })
);

/**
 * Logger 类
 */
class Logger {
  private winstonLogger: winston.Logger;
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.winstonLogger = this.createLogger();
  }

  /**
   * 创建 Winston Logger 实例
   */
  private createLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // 控制台输出
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
        })
      );
    }

    // 文件输出（所有日志）
    if (this.config.enableFile) {
      transports.push(
        new DailyRotateFile({
          filename: path.join(this.config.logDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: this.config.maxFiles,
          maxSize: this.config.maxSize,
          format: customFormat,
        })
      );

      // 错误日志单独文件
      transports.push(
        new DailyRotateFile({
          filename: path.join(this.config.logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: this.config.maxFiles,
          maxSize: this.config.maxSize,
          format: customFormat,
        })
      );
    }

    return winston.createLogger({
      level: this.config.level,
      format: customFormat,
      transports,
      // 处理未捕获的异常和 Promise 拒绝
      exceptionHandlers: this.config.enableFile ? [
        new DailyRotateFile({
          filename: path.join(this.config.logDir, 'exceptions-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: this.config.maxFiles,
          maxSize: this.config.maxSize,
        })
      ] : [],
      rejectionHandlers: this.config.enableFile ? [
        new DailyRotateFile({
          filename: path.join(this.config.logDir, 'rejections-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: this.config.maxFiles,
          maxSize: this.config.maxSize,
        })
      ] : [],
    });
  }

  /**
   * 错误日志
   */
  error(message: string, error?: Error | TouTiaoError, context?: Record<string, any>): void {
    if (error instanceof TouTiaoError) {
      this.winstonLogger.error(message, {
        error: error.toJSON(),
        context,
      });
    } else if (error) {
      this.winstonLogger.error(message, {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
      });
    } else {
      this.winstonLogger.error(message, { context });
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, context?: Record<string, any>): void {
    this.winstonLogger.warn(message, { context });
  }

  /**
   * 信息日志
   */
  info(message: string, context?: Record<string, any>): void {
    this.winstonLogger.info(message, { context });
  }

  /**
   * 调试日志
   */
  debug(message: string, context?: Record<string, any>): void {
    this.winstonLogger.debug(message, { context });
  }

  /**
   * 记录 HTTP 请求
   */
  http(method: string, url: string, statusCode?: number, duration?: number): void {
    this.info('HTTP Request', {
      method,
      url,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * 记录操作开始
   */
  operation(operationName: string, context?: Record<string, any>): void {
    this.info(`Operation started: ${operationName}`, context);
  }

  /**
   * 记录操作成功
   */
  success(operationName: string, context?: Record<string, any>): void {
    this.info(`Operation succeeded: ${operationName}`, context);
  }

  /**
   * 记录操作失败
   */
  failure(operationName: string, error: Error | TouTiaoError, context?: Record<string, any>): void {
    this.error(`Operation failed: ${operationName}`, error, context);
  }

  /**
   * 更改日志级别
   */
  setLevel(level: LogLevel): void {
    this.winstonLogger.level = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): string {
    return this.winstonLogger.level;
  }
}

/**
 * 全局 Logger 实例
 */
let globalLogger: Logger | null = null;

/**
 * 获取全局 Logger 实例
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

/**
 * 初始化 Logger（支持自定义配置）
 */
export function initLogger(config?: Partial<LoggerConfig>): Logger {
  globalLogger = new Logger(config);
  return globalLogger;
}

/**
 * 导出默认实例
 */
export const logger = getLogger();

/**
 * 导出类型
 */
export type { LoggerConfig };
export { Logger };

/**
 * 今日头条 MCP 服务器错误处理模块统一导出
 */

// 错误码
export { ErrorCode, getErrorMessage } from './error-codes';

// 基础错误类
export { TouTiaoError } from './base-error';

// 领域错误类
export {
  // 认证错误
  AuthenticationError,
  SessionExpiredError,
  CookieError,

  // 发布错误
  PublishError,
  NetworkError,
  ElementNotFoundError,
  BrowserError,
  ValidationError,

  // 数据分析错误
  AnalyticsError,

  // 配置错误
  ConfigError,

  // 系统错误
  SystemError,
  FileSystemError,
  CryptoError,
} from './domain-errors';

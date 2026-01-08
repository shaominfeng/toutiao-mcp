/**
 * 今日头条 MCP 服务器错误码定义
 *
 * 错误码规则:
 * - 1xxx: 认证相关错误
 * - 2xxx: 发布相关错误
 * - 3xxx: 数据分析相关错误
 * - 4xxx: 配置相关错误
 * - 9xxx: 系统级错误
 */

export enum ErrorCode {
  // ==================== 认证错误 (1xxx) ====================

  /** 登录失败 */
  AUTH_LOGIN_FAILED = 1001,

  /** 会话已过期 */
  AUTH_SESSION_EXPIRED = 1002,

  /** Cookie 无效或损坏 */
  AUTH_COOKIE_INVALID = 1003,

  /** Cookie 加载失败 */
  AUTH_COOKIE_LOAD_FAILED = 1004,

  /** Cookie 保存失败 */
  AUTH_COOKIE_SAVE_FAILED = 1005,

  /** 用户信息获取失败 */
  AUTH_USER_INFO_FAILED = 1006,

  /** 未登录 */
  AUTH_NOT_LOGGED_IN = 1007,

  /** 登录超时 */
  AUTH_LOGIN_TIMEOUT = 1008,

  // ==================== 发布错误 (2xxx) ====================

  /** 网络请求失败 */
  PUBLISH_NETWORK_ERROR = 2001,

  /** 元素未找到 */
  PUBLISH_ELEMENT_NOT_FOUND = 2002,

  /** 图片上传失败 */
  PUBLISH_UPLOAD_FAILED = 2003,

  /** 文章发布失败 */
  PUBLISH_ARTICLE_FAILED = 2004,

  /** 微头条发布失败 */
  PUBLISH_MICROPOST_FAILED = 2005,

  /** 图片压缩失败 */
  PUBLISH_IMAGE_COMPRESS_FAILED = 2006,

  /** 浏览器初始化失败 */
  PUBLISH_BROWSER_INIT_FAILED = 2007,

  /** 页面加载超时 */
  PUBLISH_PAGE_TIMEOUT = 2008,

  /** Cookie 传递失败 */
  PUBLISH_COOKIE_TRANSFER_FAILED = 2009,

  /** 文章列表获取失败 */
  PUBLISH_LIST_FAILED = 2010,

  /** 文章删除失败 */
  PUBLISH_DELETE_FAILED = 2011,

  /** 参数验证失败 */
  PUBLISH_VALIDATION_FAILED = 2012,

  // ==================== 数据分析错误 (3xxx) ====================

  /** 账户概览获取失败 */
  ANALYTICS_OVERVIEW_FAILED = 3001,

  /** 文章统计获取失败 */
  ANALYTICS_STATS_FAILED = 3002,

  /** 趋势分析失败 */
  ANALYTICS_TREND_FAILED = 3003,

  /** 报告生成失败 */
  ANALYTICS_REPORT_FAILED = 3004,

  // ==================== 配置错误 (4xxx) ====================

  /** 配置文件加载失败 */
  CONFIG_LOAD_FAILED = 4001,

  /** 配置验证失败 */
  CONFIG_VALIDATION_FAILED = 4002,

  /** 环境变量缺失 */
  CONFIG_ENV_MISSING = 4003,

  // ==================== 系统错误 (9xxx) ====================

  /** 文件系统错误 */
  SYSTEM_FILE_ERROR = 9001,

  /** 加密/解密失败 */
  SYSTEM_CRYPTO_ERROR = 9002,

  /** 未知错误 */
  SYSTEM_UNKNOWN_ERROR = 9999,
}

/**
 * 获取错误码对应的描述信息
 */
export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    // 认证错误
    [ErrorCode.AUTH_LOGIN_FAILED]: '登录失败，请检查用户名密码或网络连接',
    [ErrorCode.AUTH_SESSION_EXPIRED]: '会话已过期，请重新登录',
    [ErrorCode.AUTH_COOKIE_INVALID]: 'Cookie 无效或已损坏',
    [ErrorCode.AUTH_COOKIE_LOAD_FAILED]: 'Cookie 加载失败',
    [ErrorCode.AUTH_COOKIE_SAVE_FAILED]: 'Cookie 保存失败',
    [ErrorCode.AUTH_USER_INFO_FAILED]: '用户信息获取失败',
    [ErrorCode.AUTH_NOT_LOGGED_IN]: '用户未登录，请先登录',
    [ErrorCode.AUTH_LOGIN_TIMEOUT]: '登录超时，请重试',

    // 发布错误
    [ErrorCode.PUBLISH_NETWORK_ERROR]: '网络请求失败，请检查网络连接',
    [ErrorCode.PUBLISH_ELEMENT_NOT_FOUND]: '页面元素未找到，可能页面结构已变化',
    [ErrorCode.PUBLISH_UPLOAD_FAILED]: '图片上传失败',
    [ErrorCode.PUBLISH_ARTICLE_FAILED]: '文章发布失败',
    [ErrorCode.PUBLISH_MICROPOST_FAILED]: '微头条发布失败',
    [ErrorCode.PUBLISH_IMAGE_COMPRESS_FAILED]: '图片压缩失败',
    [ErrorCode.PUBLISH_BROWSER_INIT_FAILED]: '浏览器初始化失败',
    [ErrorCode.PUBLISH_PAGE_TIMEOUT]: '页面加载超时',
    [ErrorCode.PUBLISH_COOKIE_TRANSFER_FAILED]: 'Cookie 传递到浏览器失败',
    [ErrorCode.PUBLISH_LIST_FAILED]: '文章列表获取失败',
    [ErrorCode.PUBLISH_DELETE_FAILED]: '文章删除失败',
    [ErrorCode.PUBLISH_VALIDATION_FAILED]: '参数验证失败',

    // 数据分析错误
    [ErrorCode.ANALYTICS_OVERVIEW_FAILED]: '账户概览数据获取失败',
    [ErrorCode.ANALYTICS_STATS_FAILED]: '文章统计数据获取失败',
    [ErrorCode.ANALYTICS_TREND_FAILED]: '趋势分析数据获取失败',
    [ErrorCode.ANALYTICS_REPORT_FAILED]: '报告生成失败',

    // 配置错误
    [ErrorCode.CONFIG_LOAD_FAILED]: '配置文件加载失败',
    [ErrorCode.CONFIG_VALIDATION_FAILED]: '配置验证失败',
    [ErrorCode.CONFIG_ENV_MISSING]: '环境变量缺失',

    // 系统错误
    [ErrorCode.SYSTEM_FILE_ERROR]: '文件系统操作失败',
    [ErrorCode.SYSTEM_CRYPTO_ERROR]: '加密/解密操作失败',
    [ErrorCode.SYSTEM_UNKNOWN_ERROR]: '未知错误',
  };

  return messages[code] || '未知错误';
}

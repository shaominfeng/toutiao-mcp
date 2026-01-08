/**
 * 今日头条 MCP 服务器 Cookie 存储系统
 *
 * 提供 Cookie 的加密存储和管理，支持：
 * - AES-256-GCM 加密算法
 * - 文件系统持久化
 * - 内存缓存（测试用）
 * - 自动迁移明文 Cookie
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Cookie, CookiesData } from '../types';
import { CookieError, FileSystemError, CryptoError, ConfigError, ErrorCode } from '../errors';
import { logger } from './logger';

/**
 * Cookie 存储接口
 */
export interface CookieStorage {
  /**
   * 加载 Cookies
   */
  load(): Promise<Cookie[]>;

  /**
   * 保存 Cookies
   */
  save(cookies: Cookie[]): Promise<void>;

  /**
   * 清空 Cookies
   */
  clear(): Promise<void>;

  /**
   * 检查是否存在
   */
  exists(): Promise<boolean>;
}

/**
 * 加密配置
 */
interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  tagLength: number;
}

const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 64,
  tagLength: 16,
};

/**
 * 文件 Cookie 存储（加密）
 */
export class EncryptedFileCookieStorage implements CookieStorage {
  private key: Buffer;
  private encryptionConfig: EncryptionConfig;

  constructor(
    private filePath: string,
    password?: string,
    encryptionConfig: Partial<EncryptionConfig> = {}
  ) {
    this.encryptionConfig = { ...DEFAULT_ENCRYPTION_CONFIG, ...encryptionConfig };

    // 获取加密密钥
    const encryptionKey = password || process.env.COOKIE_ENCRYPTION_KEY;

    // 验证加密密钥是否已设置
    if (!encryptionKey) {
      throw new ConfigError(
        ErrorCode.CONFIG_ENV_MISSING,
        'Cookie encryption key is required. Please set COOKIE_ENCRYPTION_KEY environment variable.',
        {
          context: {
            field: 'COOKIE_ENCRYPTION_KEY',
            hint: 'Set a strong password (at least 32 characters) in your .env file',
          }
        }
      );
    }

    // 验证密钥强度
    if (encryptionKey.length < 32) {
      logger.warn('Weak encryption key detected', {
        currentLength: encryptionKey.length,
        recommendedLength: 32,
      });
      throw new ConfigError(
        ErrorCode.CONFIG_VALIDATION_FAILED,
        `Cookie encryption key must be at least 32 characters long (current: ${encryptionKey.length})`,
        {
          context: {
            field: 'COOKIE_ENCRYPTION_KEY',
            minLength: 32,
            currentLength: encryptionKey.length,
          }
        }
      );
    }

    // 从密码派生密钥（使用固定 salt 以保持密钥一致）
    const salt = 'toutiao-mcp-cookie-storage-salt';
    this.key = crypto.scryptSync(encryptionKey, salt, this.encryptionConfig.keyLength);

    logger.debug('EncryptedFileCookieStorage initialized', { filePath });
  }

  /**
   * 加载 Cookies
   */
  async load(): Promise<Cookie[]> {
    try {
      if (!fs.existsSync(this.filePath)) {
        logger.debug('Cookie file does not exist', { filePath: this.filePath });
        return [];
      }

      const encrypted = fs.readFileSync(this.filePath, 'utf-8');

      // 检查是否为明文 JSON（旧格式）
      if (encrypted.trim().startsWith('{')) {
        logger.warn('Detected unencrypted cookie file, migrating to encrypted format');
        return await this.migrateFromPlaintext(encrypted);
      }

      // 解密
      const decrypted = this.decrypt(encrypted);
      const data: CookiesData = JSON.parse(decrypted);

      logger.info('Cookies loaded successfully', {
        count: data.cookies?.length || 0,
        timestamp: data.timestamp
      });

      return data.cookies || [];
    } catch (error) {
      logger.error('Failed to load cookies', error as Error, { filePath: this.filePath });

      if (error instanceof CryptoError) {
        throw error;
      }

      throw new CookieError(
        ErrorCode.AUTH_COOKIE_LOAD_FAILED,
        'Cookie 加载失败',
        error as Error,
        { filePath: this.filePath }
      );
    }
  }

  /**
   * 保存 Cookies
   */
  async save(cookies: Cookie[]): Promise<void> {
    try {
      // 确保目录存在
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data: CookiesData = {
        cookies,
        timestamp: Date.now(),
      };

      // 加密
      const encrypted = this.encrypt(JSON.stringify(data));

      // 写入文件
      fs.writeFileSync(this.filePath, encrypted, 'utf-8');

      logger.info('Cookies saved successfully', {
        count: cookies.length,
        filePath: this.filePath
      });
    } catch (error) {
      logger.error('Failed to save cookies', error as Error, { filePath: this.filePath });

      if (error instanceof CryptoError) {
        throw error;
      }

      throw new CookieError(
        ErrorCode.AUTH_COOKIE_SAVE_FAILED,
        'Cookie 保存失败',
        error as Error,
        { filePath: this.filePath }
      );
    }
  }

  /**
   * 清空 Cookies
   */
  async clear(): Promise<void> {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
        logger.info('Cookies cleared successfully', { filePath: this.filePath });
      }
    } catch (error) {
      logger.error('Failed to clear cookies', error as Error, { filePath: this.filePath });
      throw new FileSystemError('unlink', this.filePath, error as Error);
    }
  }

  /**
   * 检查文件是否存在
   */
  async exists(): Promise<boolean> {
    return fs.existsSync(this.filePath);
  }

  /**
   * 加密数据
   */
  private encrypt(plaintext: string): string {
    try {
      // 生成随机 IV
      const iv = crypto.randomBytes(this.encryptionConfig.ivLength);

      // 创建加密器
      const cipher = crypto.createCipheriv(
        this.encryptionConfig.algorithm,
        this.key,
        iv
      ) as crypto.CipherGCM;

      // 加密
      let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
      encrypted += cipher.final('hex');

      // 获取认证标签
      const tag = cipher.getAuthTag();

      // 格式: iv:tag:encrypted
      return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new CryptoError('encrypt', error as Error);
    }
  }

  /**
   * 解密数据
   */
  private decrypt(ciphertext: string): string {
    try {
      // 解析格式
      const parts = ciphertext.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      // 创建解密器
      const decipher = crypto.createDecipheriv(
        this.encryptionConfig.algorithm,
        this.key,
        iv
      ) as crypto.DecipherGCM;

      // 设置认证标签
      decipher.setAuthTag(tag);

      // 解密
      let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');

      return decrypted;
    } catch (error) {
      throw new CryptoError('decrypt', error as Error);
    }
  }

  /**
   * 从明文迁移（自动加密旧格式）
   */
  private async migrateFromPlaintext(plaintext: string): Promise<Cookie[]> {
    try {
      const data: CookiesData = JSON.parse(plaintext);
      const cookies = data.cookies || [];

      // 备份原文件
      const backupPath = `${this.filePath}.backup.${Date.now()}`;
      fs.copyFileSync(this.filePath, backupPath);
      logger.info('Created backup of plaintext cookie file', { backupPath });

      // 保存为加密格式
      await this.save(cookies);

      logger.info('Successfully migrated cookies to encrypted format', {
        count: cookies.length
      });

      return cookies;
    } catch (error) {
      logger.error('Failed to migrate cookies', error as Error);
      throw new CookieError(
        ErrorCode.AUTH_COOKIE_LOAD_FAILED,
        'Cookie 迁移失败',
        error as Error
      );
    }
  }
}

/**
 * 文件 Cookie 存储（明文，仅用于测试）
 */
export class PlainFileCookieStorage implements CookieStorage {
  constructor(private filePath: string) {
    logger.warn('Using PlainFileCookieStorage - cookies are NOT encrypted!');
  }

  async load(): Promise<Cookie[]> {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }

      const data = fs.readFileSync(this.filePath, 'utf-8');
      const cookiesData: CookiesData = JSON.parse(data);
      return cookiesData.cookies || [];
    } catch (error) {
      throw new CookieError(
        ErrorCode.AUTH_COOKIE_LOAD_FAILED,
        'Cookie 加载失败',
        error as Error,
        { filePath: this.filePath }
      );
    }
  }

  async save(cookies: Cookie[]): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data: CookiesData = {
        cookies,
        timestamp: Date.now(),
      };

      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      throw new CookieError(
        ErrorCode.AUTH_COOKIE_SAVE_FAILED,
        'Cookie 保存失败',
        error as Error,
        { filePath: this.filePath }
      );
    }
  }

  async clear(): Promise<void> {
    if (fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }
  }

  async exists(): Promise<boolean> {
    return fs.existsSync(this.filePath);
  }
}

/**
 * 内存 Cookie 存储（用于测试）
 */
export class InMemoryCookieStorage implements CookieStorage {
  private cookies: Cookie[] = [];

  async load(): Promise<Cookie[]> {
    return [...this.cookies];
  }

  async save(cookies: Cookie[]): Promise<void> {
    this.cookies = [...cookies];
  }

  async clear(): Promise<void> {
    this.cookies = [];
  }

  async exists(): Promise<boolean> {
    return this.cookies.length > 0;
  }
}

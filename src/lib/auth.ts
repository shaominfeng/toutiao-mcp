/**
 * 今日头条认证管理模块
 */

import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosInstance } from 'axios';
import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { Cookie, CookiesData, UserInfo } from '../types';
import { TOUTIAO_URLS, DEFAULT_HEADERS, SELENIUM_CONFIG, getCookiesFilePath } from './config';

export class TouTiaoAuth {
  private cookiesFile: string;
  private axiosInstance: AxiosInstance;
  private cookies: Cookie[] = [];

  constructor(cookiesFile?: string) {
    this.cookiesFile = cookiesFile || getCookiesFilePath();
    this.axiosInstance = axios.create({
      headers: { ...DEFAULT_HEADERS },
      timeout: 30000,
    });
    this.loadCookies();
  }

  /**
   * 从文件加载 Cookie
   */
  private loadCookies(): void {
    try {
      if (fs.existsSync(this.cookiesFile)) {
        const data = fs.readFileSync(this.cookiesFile, 'utf-8');
        const cookiesData: CookiesData = JSON.parse(data);
        this.cookies = cookiesData.cookies || [];

        // 更新 axios 实例的 Cookie
        this.updateAxiosCookies();

        console.log(`已加载 ${this.cookies.length} 个 Cookie`);
      }
    } catch (error) {
      console.warn(`加载 Cookie 失败: ${error}`);
    }
  }

  /**
   * 保存 Cookie 到文件
   */
  private saveCookies(cookies: Cookie[]): void {
    try {
      const dir = path.dirname(this.cookiesFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const cookiesData: CookiesData = {
        cookies,
        timestamp: Date.now(),
      };

      fs.writeFileSync(this.cookiesFile, JSON.stringify(cookiesData, null, 2), 'utf-8');
      console.log(`已保存 ${cookies.length} 个 Cookie`);
    } catch (error) {
      console.error(`保存 Cookie 失败: ${error}`);
    }
  }

  /**
   * 更新 axios 实例的 Cookie
   */
  private updateAxiosCookies(): void {
    const cookieString = this.cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    if (cookieString) {
      this.axiosInstance.defaults.headers.common['Cookie'] = cookieString;
    }
  }

  /**
   * 设置 Chrome 浏览器驱动
   */
  private async setupDriver(): Promise<WebDriver> {
    const options = new chrome.Options();

    // 添加浏览器选项
    SELENIUM_CONFIG.chromeOptions.forEach(option => {
      options.addArguments(option);
    });

    // 设置用户代理
    options.addArguments(`--user-agent=${DEFAULT_HEADERS['User-Agent']}`);

    // 无头模式
    if (SELENIUM_CONFIG.headless) {
      options.addArguments('--headless');
    }

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // 设置超时
    await driver.manage().setTimeouts({
      implicit: SELENIUM_CONFIG.implicitWait,
    });

    console.log('ChromeDriver 初始化成功');
    return driver;
  }

  /**
   * 使用 Selenium 自动登录
   */
  async loginWithSelenium(username?: string, password?: string): Promise<boolean> {
    let driver: WebDriver | null = null;
    try {
      driver = await this.setupDriver();
      console.log('正在打开今日头条登录页面...');

      // 访问登录页面
      await driver.get(TOUTIAO_URLS.login);

      // 等待页面加载
      await driver.sleep(3000);

      console.log('页面加载完成，请手动进行登录操作');
      console.log('注意事项：');
      console.log('1. 今日头条通常使用手机号+验证码登录');
      console.log('2. 请手动输入手机号');
      console.log('3. 点击获取验证码');
      console.log('4. 输入收到的验证码');
      console.log('5. 点击登录按钮');
      console.log('6. 等待登录成功跳转');

      // 等待登录成功
      const waitTime = 300; // 5分钟
      console.log(`等待登录完成，最多等待${waitTime}秒...`);

      let success = false;
      for (let i = 0; i < waitTime; i++) {
        const currentUrl = await driver.getCurrentUrl();

        // 检查是否跳转到创作者中心
        if (
          currentUrl.includes('mp.toutiao.com/profile') ||
          currentUrl.includes('creator.toutiao.com') ||
          currentUrl.includes('mp.toutiao.com/dashboard')
        ) {
          success = true;
          console.log(`检测到登录成功，跳转到: ${currentUrl}`);
          break;
        }

        // 每30秒提示一次
        if (i % 30 === 0 && i > 0) {
          console.log(`等待中... 已等待${i}秒，剩余${waitTime - i}秒`);
        }

        await driver.sleep(1000);
      }

      if (success) {
        // 获取所有 Cookie
        const seleniumCookies = await driver.manage().getCookies();

        // 转换 Cookie 格式
        const cookies: Cookie[] = seleniumCookies.map(cookie => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain || '.toutiao.com',
          path: cookie.path,
          expires: typeof cookie.expiry === 'number' ? cookie.expiry : undefined,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
        }));

        this.saveCookies(cookies);
        this.cookies = cookies;
        this.updateAxiosCookies();

        console.log('登录成功，已保存 Cookie');
        return true;
      } else {
        console.error('登录超时或失败');
        return false;
      }
    } catch (error) {
      console.error(`登录过程出错: ${error}`);
      return false;
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
  }

  /**
   * 检查当前登录状态
   */
  async checkLoginStatus(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get(TOUTIAO_URLS.homepage, {
        timeout: 10000,
      });

      if (response.status === 200) {
        const responseText = response.data.toString().toLowerCase();

        // 检查多个可能的登录标识
        const loginIndicators = [
          'profile',
          'creator',
          'dashboard',
          'publish',
          'content',
          '创作者',
          '发布',
          '我的',
        ];

        for (const indicator of loginIndicators) {
          if (responseText.includes(indicator)) {
            console.log(`登录状态验证成功 (检测到: ${indicator})`);
            return true;
          }
        }

        // 如果没有重定向到登录页面，也认为登录成功
        if (!responseText.includes('login') && !responseText.includes('auth')) {
          console.log('登录状态验证成功 (未检测到登录页面)');
          return true;
        }
      }

      console.warn(`登录状态验证失败 - 状态码: ${response.status}`);
      return false;
    } catch (error) {
      console.error(`检查登录状态失败: ${error}`);
      return false;
    }
  }

  /**
   * 获取当前登录用户信息
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const response = await this.axiosInstance.get(TOUTIAO_URLS.userInfo, {
        timeout: 10000,
      });

      if (response.status === 200) {
        // 根据实际API返回格式解析
        const userInfo: UserInfo = {
          login_status: true,
          user_id: undefined,
          username: undefined,
          nickname: undefined,
          avatar: undefined,
          followers_count: 0,
          following_count: 0,
        };

        console.log('获取用户信息成功');
        return userInfo;
      } else {
        console.error(`获取用户信息失败，状态码: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`获取用户信息异常: ${error}`);
      return null;
    }
  }

  /**
   * 登出当前账户
   */
  logout(): boolean {
    try {
      // 清除内存中的 Cookie
      this.cookies = [];
      this.axiosInstance.defaults.headers.common['Cookie'] = '';

      // 删除本地 Cookie 文件
      if (fs.existsSync(this.cookiesFile)) {
        fs.unlinkSync(this.cookiesFile);
      }

      console.log('已清除登录信息');
      return true;
    } catch (error) {
      console.error(`登出失败: ${error}`);
      return false;
    }
  }

  /**
   * 获取 axios 实例（供其他模块使用）
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * 获取 cookies（供 Selenium 使用）
   */
  getCookies(): Cookie[] {
    return this.cookies;
  }
}

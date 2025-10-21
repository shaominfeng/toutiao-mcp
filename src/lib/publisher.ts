/**
 * 今日头条内容发布模块
 */

import * as fs from 'fs';
import * as path from 'path';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import sharp from 'sharp';
import { TouTiaoAuth } from './auth';
import {
  PublishArticleParams,
  PublishMicroPostParams,
  PublishResult,
  ArticleListResult,
} from '../types';
import { TOUTIAO_URLS, SELENIUM_CONFIG, CONTENT_CONFIG, DEFAULT_HEADERS } from './config';

export class TouTiaoPublisher {
  private auth: TouTiaoAuth;

  constructor(auth: TouTiaoAuth) {
    this.auth = auth;
  }

  /**
   * 压缩图片
   */
  private async compressImage(imagePath: string, maxSize: number = CONTENT_CONFIG.maxImageSize): Promise<string> {
    try {
      const stats = fs.statSync(imagePath);
      if (stats.size <= maxSize) {
        return imagePath;
      }

      const quality = Math.max(20, Math.min(95, Math.floor((maxSize / stats.size) * 100)));
      const compressedPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '.compressed.jpg');

      await sharp(imagePath)
        .jpeg({ quality, mozjpeg: true })
        .toFile(compressedPath);

      console.log(`图片已压缩: ${stats.size} -> ${fs.statSync(compressedPath).size}`);
      return compressedPath;
    } catch (error) {
      console.warn(`图片压缩失败: ${error}，使用原图片`);
      return imagePath;
    }
  }

  /**
   * 设置 Chrome 浏览器驱动
   */
  private async setupDriver(): Promise<WebDriver> {
    const options = new chrome.Options();

    SELENIUM_CONFIG.chromeOptions.forEach(option => {
      options.addArguments(option);
    });

    options.addArguments(`--user-agent=${DEFAULT_HEADERS['User-Agent']}`);

    if (SELENIUM_CONFIG.headless) {
      options.addArguments('--headless');
    }

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({
      implicit: SELENIUM_CONFIG.implicitWait,
    });

    console.log('ChromeDriver 初始化成功');
    return driver;
  }

  /**
   * 将 Cookie 传递给浏览器
   */
  private async transferCookiesToDriver(driver: WebDriver): Promise<void> {
    await driver.get('https://mp.toutiao.com');
    await driver.sleep(2000);

    const cookies = this.auth.getCookies();
    for (const cookie of cookies) {
      if (cookie.domain && cookie.domain.includes('.toutiao.com')) {
        try {
          await driver.manage().addCookie({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
          });
        } catch (error) {
          console.warn(`添加 Cookie 失败: ${error}`);
        }
      }
    }

    console.log('已将登录 Cookie 传递给浏览器');
  }

  /**
   * 发布文章到今日头条
   */
  async publishArticle(params: PublishArticleParams): Promise<PublishResult> {
    let driver: WebDriver | null = null;
    try {
      console.log(`开始发布文章: ${params.title}`);

      driver = await this.setupDriver();
      await this.transferCookiesToDriver(driver);

      console.log('正在打开文章发布页面...');
      await driver.get('https://mp.toutiao.com/profile_v4/graphic/publish');
      await driver.sleep(1000);

      // 检查是否需要重新登录
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('login') || currentUrl.includes('auth')) {
        return {
          success: false,
          message: '需要重新登录，请先运行登录脚本',
        };
      }

      // 等待页面加载
      await driver.wait(until.elementLocated(By.tagName('textarea')), 20000);
      await driver.sleep(2000);

      // 输入标题
      console.log('正在输入标题...');
      const titleTextarea = await driver.findElement(By.css("textarea[placeholder*='请输入文章标题']"));
      await driver.executeScript("arguments[0].scrollIntoView(true);", titleTextarea);
      await driver.sleep(1000);
      await driver.executeScript("arguments[0].click();", titleTextarea);
      await driver.sleep(1000);
      await titleTextarea.sendKeys(params.title);
      await driver.sleep(1500);

      // 输入正文
      console.log('正在输入正文内容...');
      const contentEditor = await driver.findElement(By.css('.ProseMirror'));
      await contentEditor.click();
      await driver.sleep(2000);

      // 处理内容格式
      const paragraphs = params.content.split('\n');
      const formattedContent = paragraphs
        .map(para => (para.trim() ? `<p>${para.trim()}</p>` : '<p><br></p>'))
        .join('');

      await driver.executeScript("arguments[0].innerHTML = '';", contentEditor);
      await driver.sleep(1000);
      await driver.executeScript("arguments[0].innerHTML = arguments[1];", contentEditor, formattedContent);
      await driver.sleep(2000);

      // 触发内容变更事件
      await driver.executeScript(`
        var event = new Event('input', { bubbles: true });
        arguments[0].dispatchEvent(event);
      `, contentEditor);
      await driver.sleep(1500);

      // 上传封面图片（如果有）
      if (params.images && params.images.length > 0) {
        try {
          console.log('正在上传封面图片...');
          const imgPath = path.resolve(params.images[0]);

          if (!fs.existsSync(imgPath)) {
            console.error(`图片文件不存在: ${imgPath}`);
          } else {
            await driver.sleep(2000);
            const uploadButton = await driver.wait(
              until.elementLocated(By.css('div.article-cover-add')),
              10000
            );
            await driver.executeScript("arguments[0].scrollIntoView(true);", uploadButton);
            await driver.sleep(1000);
            await driver.executeScript("arguments[0].click();", uploadButton);

            const uploadLocalButton = await driver.wait(
              until.elementLocated(By.css('div.btn-upload-handle.upload-handler')),
              10000
            );
            await driver.executeScript("arguments[0].scrollIntoView(true);", uploadLocalButton);
            await driver.sleep(1000);
            await driver.executeScript("arguments[0].click();", uploadLocalButton);

            const fileInput = await driver.wait(
              until.elementLocated(By.css(".btn-upload-handle.upload-handler input[type='file']")),
              10000
            );
            await fileInput.sendKeys(imgPath);

            await driver.wait(
              until.elementLocated(By.css("button[data-e2e='imageUploadConfirm-btn']")),
              30000
            );

            const confirmButton = await driver.findElement(By.css("button[data-e2e='imageUploadConfirm-btn']"));
            await driver.executeScript("arguments[0].scrollIntoView(true);", confirmButton);
            await driver.sleep(1000);
            await driver.executeScript("arguments[0].click();", confirmButton);
            await driver.sleep(1500);

            console.log('封面图片上传完成');
          }
        } catch (error) {
          console.warn(`封面图片上传失败: ${error}`);
        }
      }

      // 点击预览并发布
      console.log('正在点击预览并发布按钮...');
      await driver.sleep(30000); // 等待30秒让用户确认
      const previewBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., '预览并发布')]")),
        10000
      );
      await previewBtn.click();
      await driver.sleep(5000);

      console.log('文章已提交，请在浏览器中完成最后的发布确认');

      return {
        success: true,
        title: params.title,
        message: '文章已提交发布，请在浏览器中确认',
      };
    } catch (error) {
      console.error(`文章发布异常: ${error}`);
      return {
        success: false,
        title: params.title,
        message: `发布异常: ${error}`,
      };
    } finally {
      if (driver) {
        setTimeout(async () => {
          try {
            await driver?.quit();
            console.log('浏览器已关闭');
          } catch (e) {
            console.error(`关闭浏览器失败: ${e}`);
          }
        }, 60000); // 60秒后关闭浏览器
      }
    }
  }

  /**
   * 发布微头条
   */
  async publishMicroPost(params: PublishMicroPostParams): Promise<PublishResult> {
    let driver: WebDriver | null = null;
    try {
      console.log(`开始发布微头条: ${params.content.substring(0, 50)}...`);

      // 限制图片数量
      if (params.images && params.images.length > CONTENT_CONFIG.maxImagesPerMicroPost) {
        console.warn('微头条最多支持9张图片，将只使用前9张');
        params.images = params.images.slice(0, CONTENT_CONFIG.maxImagesPerMicroPost);
      }

      // 处理话题标签
      let microContent = params.content;
      if (params.topic && !params.topic.startsWith('#')) {
        microContent = `#${params.topic}# ${microContent}`;
      }

      driver = await this.setupDriver();
      await this.transferCookiesToDriver(driver);

      console.log('正在打开微头条发布页面...');
      await driver.get('https://mp.toutiao.com/profile_v4/weitoutiao/publish?from=toutiao_pc');
      await driver.sleep(15000);

      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes('login') || currentUrl.includes('auth')) {
        return {
          success: false,
          message: '需要重新登录，Cookie可能已过期',
        };
      }

      // 查找编辑器
      console.log('开始查找编辑器元素...');
      let editor = null;
      const editorSelectors = [
        '.ProseMirror',
        'div.ProseMirror',
        'textarea',
        "[contenteditable='true']",
        "div[role='textbox']",
      ];

      for (const selector of editorSelectors) {
        try {
          editor = await driver.wait(until.elementLocated(By.css(selector)), 30000);
          if (await editor.isDisplayed()) {
            console.log(`✅ 找到编辑器元素: ${selector}`);
            break;
          }
          editor = null;
        } catch (e) {
          continue;
        }
      }

      if (!editor) {
        return {
          success: false,
          message: '编辑器加载超时',
        };
      }

      // 输入内容
      console.log('正在输入微头条内容...');
      const tagName = await editor.getTagName();
      if (tagName.toLowerCase() === 'textarea') {
        await editor.clear();
        await editor.sendKeys(microContent);
      } else {
        await editor.click();
        await driver.sleep(1000);
        const safeContent = microContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\n/g, '<br>');
        await driver.executeScript(`arguments[0].innerHTML = \`<p>${safeContent}</p>\``, editor);
        await driver.sleep(1000);
        await driver.executeScript(`
          var event = new Event('input', { bubbles: true });
          arguments[0].dispatchEvent(event);
        `, editor);
      }

      console.log('微头条内容输入完成');
      await driver.sleep(2000);

      // 点击发布按钮
      console.log('正在点击发布按钮...');
      const publishButton = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(text(), '发布')]")),
        10000
      );
      await publishButton.click();
      await driver.sleep(2000);

      console.log('微头条发布成功');
      return {
        success: true,
        message: '微头条发布成功',
      };
    } catch (error) {
      console.error(`微头条发布异常: ${error}`);
      return {
        success: false,
        message: `发布异常: ${error}`,
      };
    } finally {
      if (driver) {
        setTimeout(async () => {
          try {
            await driver?.quit();
          } catch (e) {
            console.error(`关闭浏览器失败: ${e}`);
          }
        }, 5000);
      }
    }
  }

  /**
   * 获取文章列表
   */
  async getArticleList(page: number = 1, pageSize: number = 20, status: string = 'all'): Promise<ArticleListResult> {
    try {
      const response = await this.auth.getAxiosInstance().get(TOUTIAO_URLS.articleList, {
        params: { page, page_size: pageSize, status, from: 'pc' },
        timeout: 15000,
      });

      if (response.status === 200 && response.data.message === 'success') {
        const articles = response.data.data?.list || [];
        const total = response.data.data?.total || 0;

        console.log(`获取文章列表成功，共 ${total} 篇文章`);
        return {
          success: true,
          articles,
          total,
          page,
          pageSize,
        };
      }

      return {
        success: false,
        message: response.data.message || '获取失败',
      };
    } catch (error) {
      console.error(`获取文章列表异常: ${error}`);
      return {
        success: false,
        message: `获取异常: ${error}`,
      };
    }
  }

  /**
   * 删除文章
   */
  async deleteArticle(articleId: string): Promise<PublishResult> {
    try {
      const response = await this.auth.getAxiosInstance().post(
        TOUTIAO_URLS.deleteArticle,
        { id: articleId, from: 'pc' },
        { timeout: 15000 }
      );

      if (response.status === 200 && response.data.message === 'success') {
        console.log(`文章删除成功: ${articleId}`);
        return {
          success: true,
          message: '文章删除成功',
        };
      }

      return {
        success: false,
        message: response.data.message || '删除失败',
      };
    } catch (error) {
      console.error(`文章删除异常: ${error}`);
      return {
        success: false,
        message: `删除异常: ${error}`,
      };
    }
  }
}

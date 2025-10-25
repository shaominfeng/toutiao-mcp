/**
 * 文颜（Wenyan）Markdown 转换器
 * 使用 @wenyan-md/core 将 Markdown 转换为精美的 HTML 排版
 *
 * 文颜是一款多平台排版美化工具，支持多种主题和代码高亮风格
 */

// 使用动态导入来解决 ESM 模块问题
type GetGzhContentFunction = (
  inputContent: string,
  theme?: string,
  highlightTheme?: string,
  isMacStyle?: boolean
) => Promise<{
  title: string;
  cover: string;
  content: string;
  description: string;
}>;

/**
 * 文颜主题选项
 */
export type WenyanTheme =
  | 'default'
  | 'orangeheart'
  | 'rainbow'
  | 'lapis'
  | 'pie'
  | 'maize'
  | 'purple'
  | 'phycat';

/**
 * 代码高亮主题选项
 */
export type WenyanHighlightTheme =
  | 'atom-one-dark'
  | 'atom-one-light'
  | 'dracula'
  | 'github-dark'
  | 'github'
  | 'monokai'
  | 'solarized-dark'
  | 'solarized-light'
  | 'xcode';

/**
 * 文颜转换结果
 */
export interface WenyanResult {
  title: string;        // 文章标题
  cover: string;        // 封面图片
  content: string;      // 转换后的 HTML 内容
  description: string;  // 文章描述
}

/**
 * 将 Markdown 内容转换为文颜风格的 HTML
 * @param content Markdown 内容
 * @param theme 主题名称，默认 'lapis'
 * @param highlightTheme 代码高亮主题，默认 'github'
 * @param isMacStyle 代码块是否使用 Mac 风格，默认 true
 * @returns 转换后的结果对象
 */
export async function convertToWenyanHtml(
  content: string,
  theme: WenyanTheme = 'lapis',
  highlightTheme: WenyanHighlightTheme = 'github',
  isMacStyle: boolean = true
): Promise<WenyanResult> {
  try {
    // 动态导入 ESM 模块
    const { getGzhContent } = await import('@wenyan-md/core/wrapper') as { getGzhContent: GetGzhContentFunction };

    const result = await getGzhContent(content, theme, highlightTheme, isMacStyle);
    return result;
  } catch (error) {
    console.error('❌ Markdown 转文颜 HTML 失败:', error);
    throw error;
  }
}

/**
 * 文颜转换器类（支持自定义配置）
 */
export class WenyanConverter {
  private theme: WenyanTheme;
  private highlightTheme: WenyanHighlightTheme;
  private isMacStyle: boolean;

  constructor(
    theme: WenyanTheme = 'lapis',
    highlightTheme: WenyanHighlightTheme = 'github',
    isMacStyle: boolean = true
  ) {
    this.theme = theme;
    this.highlightTheme = highlightTheme;
    this.isMacStyle = isMacStyle;
  }

  /**
   * 渲染 Markdown 为 HTML
   */
  async render(content: string): Promise<WenyanResult> {
    return await convertToWenyanHtml(content, this.theme, this.highlightTheme, this.isMacStyle);
  }

  /**
   * 设置主题
   */
  setTheme(theme: WenyanTheme): void {
    this.theme = theme;
  }

  /**
   * 设置代码高亮主题
   */
  setHighlightTheme(highlightTheme: WenyanHighlightTheme): void {
    this.highlightTheme = highlightTheme;
  }

  /**
   * 设置是否使用 Mac 风格代码块
   */
  setMacStyle(isMacStyle: boolean): void {
    this.isMacStyle = isMacStyle;
  }
}


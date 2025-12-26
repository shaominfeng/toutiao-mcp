# 自定义内容发布指南

这个指南将帮助你使用 `publish-custom` 命令发布自己的内容到今日头条微头条。

## 快速开始

### 1. 准备内容文件

创建一个文本文件（支持 `.txt` 或 `.md` 格式），写入你的新闻内容。

**示例：news.txt**
```
这是一条重要新闻！

今天发生了一件大事，让我来告诉你详细情况。

主要内容包括：
1. 第一点
2. 第二点
3. 第三点

你怎么看？欢迎评论！
```

### 2. 确保已登录

```bash
npm run login
```

### 3. 发布内容

**基础用法：**
```bash
npm run publish-custom -- ./news.txt
```

**带话题标签：**
```bash
npm run publish-custom -- ./news.txt --topic "热点资讯"
```

**添加配图：**
```bash
npm run publish-custom -- ./news.txt --images ./cover.jpg
```

**完整示例（带话题、配图、自动确认）：**
```bash
npm run publish-custom -- ./news.md --topic "科技" --images ./img1.jpg,./img2.jpg --yes
```

## 命令参数详解

### 必需参数

- `<内容文件>`：内容文件的路径（支持相对路径和绝对路径）

### 可选参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--topic <话题>` | 添加话题标签（会自动添加 # 符号） | `--topic "热点"` |
| `--images <路径>` | 添加配图，多张图片用逗号分隔（最多9张） | `--images ./a.jpg,./b.jpg` |
| `--yes` 或 `-y` | 跳过确认，直接发布 | `--yes` |
| `--help` 或 `-h` | 显示帮助信息 | `--help` |

## 内容格式说明

### 支持的文件格式

- **.txt**：纯文本文件
- **.md**：Markdown 文件

### 格式保留

脚本会保留你文件中的：
- ✅ 换行
- ✅ 段落分隔
- ✅ 空行
- ✅ 特殊字符（emoji 等）

### Markdown 支持

虽然支持 `.md` 文件，但发布到微头条时会保持原始文本格式（不会转换 Markdown 语法）。建议：

- **标题**：使用 emoji 或符号代替 `#` 标记
- **列表**：直接使用数字或符号
- **强调**：使用 emoji 或特殊符号

**推荐写法：**
```markdown
🔥 重要消息

这是正文内容...

📌 要点：
• 第一点
• 第二点
• 第三点

💬 欢迎讨论！
```

## 图片使用指南

### 支持的图片格式

- JPG / JPEG
- PNG
- GIF
- WebP

### 图片要求

- **数量限制**：最多 9 张
- **大小建议**：单张不超过 5MB
- **路径格式**：支持相对路径和绝对路径

### 多图片示例

**方式 1：逗号分隔**
```bash
npm run publish-custom -- ./news.txt --images ./img1.jpg,./img2.jpg,./img3.jpg
```

**方式 2：使用引号（路径中有空格时）**
```bash
npm run publish-custom -- ./news.txt --images "./my images/photo 1.jpg,./my images/photo 2.jpg"
```

## 最佳实践

### 1. 内容长度

- **推荐**：200-800 字
- **最长**：2000 字以内
- 过长的内容可能影响用户阅读体验

### 2. 使用话题标签

话题标签可以提高内容曝光率：
```bash
--topic "热点"        # 添加 #热点# 标签
--topic "科技资讯"    # 添加 #科技资讯# 标签
```

### 3. 配图建议

- 使用高质量、相关性强的图片
- 第一张图片作为封面，建议使用横版图片
- 多张图片时注意顺序和排版效果

### 4. 预览确认

第一次使用时，**不要**使用 `--yes` 参数，先预览内容确认无误后再发布。

### 5. 内容编写技巧

- 开头吸引人：用疑问句、数据或热点话题引入
- 使用 emoji：增强视觉效果和可读性
- 段落分明：避免大段文字，多用换行
- 互动结尾：以问题结尾，鼓励用户评论

## 示例场景

### 场景 1：发布新闻快讯

```bash
# 1. 创建文件 breaking-news.txt
echo "🚨 突发：某某事件最新进展

根据最新消息，该事件已经...

📍 关键信息：
• 时间：今天下午
• 地点：XX地区
• 影响：XXX

持续关注中..." > breaking-news.txt

# 2. 发布
npm run publish-custom -- ./breaking-news.txt --topic "突发新闻"
```

### 场景 2：分享技术文章

```bash
# 1. 准备内容和配图
vim tech-article.md
# （编写内容...）

# 2. 带图发布
npm run publish-custom -- ./tech-article.md \
  --topic "技术分享" \
  --images ./diagram.png,./code-screenshot.jpg
```

### 场景 3：批量准备，稍后发布

```bash
# 准备多个内容文件
echo "内容1..." > news1.txt
echo "内容2..." > news2.txt
echo "内容3..." > news3.txt

# 逐个发布（注意间隔，避免频繁操作）
npm run publish-custom -- ./news1.txt --topic "热点" --yes
# （等待几分钟）
npm run publish-custom -- ./news2.txt --topic "科技" --yes
# （等待几分钟）
npm run publish-custom -- ./news3.txt --topic "财经" --yes
```

## 常见问题

### Q: 提示"未登录"怎么办？

**A:** 运行登录命令：
```bash
npm run login
```

### Q: 图片上传失败？

**A:** 检查：
1. 图片文件是否存在
2. 图片格式是否支持
3. 图片大小是否过大（建议 < 5MB）

### Q: 内容显示不完整？

**A:**
1. 检查文件编码是否为 UTF-8
2. 确认内容长度不超过限制
3. 特殊字符可能需要转义

### Q: 可以定时发布吗？

**A:** 目前不支持定时发布，但你可以结合 cron 或其他定时工具：
```bash
# Linux/Mac cron 示例（每天上午10点发布）
0 10 * * * cd /path/to/toutiao-mcp && npm run publish-custom -- ./daily-news.txt --yes
```

### Q: 如何查看发布历史？

**A:** 使用 MCP 的其他工具：
```bash
# 通过 MCP 客户端调用
get_article_list
```

## 高级用法

### 与其他工具集成

你可以将此脚本与其他工具结合，实现自动化工作流：

**示例：从 RSS 源生成内容并发布**
```bash
#!/bin/bash

# 1. 获取 RSS 内容（使用第三方工具）
curl "https://example.com/rss" | parse-rss > news-content.txt

# 2. 发布到今日头条
npm run publish-custom -- ./news-content.txt --topic "新闻资讯" --yes
```

## 注意事项

1. **遵守平台规则**：确保发布内容符合今日头条的内容规范
2. **避免频繁操作**：建议发布间隔至少 5 分钟
3. **内容原创性**：尽量发布原创或授权内容
4. **图片版权**：确保使用的图片有合法使用权

## 获取帮助

如遇到问题，可以：
1. 查看命令帮助：`npm run publish-custom -- --help`
2. 查看项目文档：`docs/` 目录
3. 提交 Issue 到项目仓库

---

**祝你发布顺利！** 🎉

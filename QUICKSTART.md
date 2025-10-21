# 快速入门指南

本指南将帮助您快速开始使用今日头条 MCP 服务器（Node.js 版本）。

## 前置要求

- Node.js 18 或更高版本
- Chrome 浏览器
- npm 或 yarn

## 5分钟快速开始

### 1. 安装依赖

```bash
cd /Users/allen_shao/IdeaProjects/toutiao-mcp
npm install
```

### 2. 登录今日头条

```bash
npm run login
```

按照屏幕提示：
1. 浏览器会自动打开
2. 手动输入手机号
3. 获取并输入验证码
4. 等待登录成功

### 3. 测试发布功能

```bash
npm run test
```

选择：
- 选项 1：发布微头条（快速测试）
- 选项 2：发布图文文章

### 4. 启动 MCP 服务器

```bash
npm run dev
```

服务器启动后，可以通过 MCP 协议调用各种工具。

## 主要命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run build` | 构建项目 |
| `npm run dev` | 开发模式运行 |
| `npm start` | 生产模式运行（需先构建） |
| `npm run login` | 登录今日头条 |
| `npm run test` | 测试发布功能 |

## 项目结构

```
toutiao-mcp/
├── src/              # TypeScript 源代码
│   ├── lib/          # 核心库
│   ├── types/        # 类型定义
│   ├── scripts/      # 实用脚本
│   └── index.ts      # MCP 服务器入口
├── dist/             # 编译输出（构建后生成）
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript 配置
└── README.md         # 完整文档
```

## 下一步

- 查看 [README.md](./README.md) 了解详细功能
- 查看 `src/types/index.ts` 了解类型定义
- 自定义配置见 `src/lib/config.ts`

## 常见问题

**Q: 登录失败怎么办？**

A: 确保 Chrome 浏览器已安装，并检查网络连接。

**Q: 如何重新登录？**

A: 直接运行 `npm run login`，会覆盖旧的登录信息。

**Q: 可以同时运行多个实例吗？**

A: 可以，但建议使用相同的 Cookie 文件以避免重复登录。

## 技术支持

遇到问题？请查看：
- [完整文档](./README.md)
- [示例代码](./src/scripts/)
- [类型定义](./src/types/)

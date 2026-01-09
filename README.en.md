# Toutiao MCP Server

English | [中文](README.md)

A Model Context Protocol (MCP) server for automating content publishing to Toutiao (今日头条), enabling AI assistants to publish and manage content directly.

## Features

- **MCP Integration** - Standardized Toutiao API interface for AI assistants like Claude
- **Automated Authentication** - Login and session management using Selenium WebDriver
- **Content Publishing** - Publish articles and micro-posts with images, tags, and categories
- **Secure Storage** - AES-256-GCM encrypted cookie storage
- **CLI Tools** - Standalone publishing scripts that work without MCP

## Quick Start

### Prerequisites

- Node.js 18+
- Chrome or Chromium browser
- Toutiao creator account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/toutiao-mcp.git
cd toutiao-mcp

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `.env` file with required configuration:

```env
# Cookie encryption key (minimum 32 characters)
COOKIE_ENCRYPTION_KEY=your-secure-password-at-least-32-characters-long

# Selenium configuration
SELENIUM_HEADLESS=false

# Optional: OpenAI API (for AI-generated content)
# OPENAI_API_KEY=your-api-key
# OPENAI_BASE_URL=https://api.openai.com/v1
```

> [!IMPORTANT]
> `COOKIE_ENCRYPTION_KEY` must be at least 32 characters. Changing this key will invalidate saved cookies.

### Initial Login

```bash
npm run login
```

A browser window will open automatically. Complete the login in the browser, and cookies will be securely saved for future sessions.

## Usage

### Option 1: As MCP Server

Start the MCP server for AI assistant integration:

```bash
npm start
```

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "toutiao": {
      "command": "node",
      "args": ["/path/to/toutiao-mcp/dist/index.js"]
    }
  }
}
```

Then use it in Claude:

```
"Help me publish an article about TypeScript best practices"
"Publish a micro-post about today's tech news"
```

### Option 2: Standalone CLI Tools

#### Auto-Publish Trending News

Fetch and publish content from trending news sources:

```bash
# Interactive configuration
npm run auto-publish

# Quick mode (default settings)
npm run auto-publish -- --quick

# Custom parameters
npm run auto-publish -- --source weibo --count 3 --interval 60
```

#### Publish Custom Content

Publish content from text files:

```bash
# Basic usage
npm run publish-custom -- content.txt

# Add topic hashtag
npm run publish-custom -- content.txt --topic "Technology"

# Add images
npm run publish-custom -- content.txt --images img1.jpg,img2.jpg

# Auto-confirm (skip preview)
npm run publish-custom -- content.txt --topic "Technology" --yes
```

## MCP Tools

### publish_article

Publish a complete article with rich content.

**Parameters:**
```typescript
{
  title: string;        // Article title (2-30 characters)
  content: string;      // Article content (HTML or Markdown)
  images?: string[];    // Image file paths
  tags?: string[];      // Article tags
  category?: string;    // Article category
}
```

### publish_micro_post

Publish a micro-post (tweet-like short content).

**Parameters:**
```typescript
{
  content: string;      // Micro-post content
  images?: string[];    // Image paths (max 9)
  topic?: string;       // Topic hashtag
}
```

## Project Structure

```
toutiao-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── lib/
│   │   ├── auth.ts           # Authentication management
│   │   ├── publisher.ts      # Publishing functionality
│   │   ├── analytics.ts      # Analytics and reporting
│   │   └── wenyan-converter.ts # Markdown conversion
│   ├── scripts/              # Standalone scripts
│   │   ├── login.ts          # Login script
│   │   ├── auto-publish-news.ts    # Auto-publish
│   │   └── publish-custom-news.ts  # Custom publish
│   ├── utils/                # Utility functions
│   │   ├── logger.ts         # Logging system
│   │   └── cookie-storage.ts # Encrypted cookie storage
│   └── types/                # TypeScript type definitions
└── examples/                  # Example files
```

## Configuration

### Selenium Settings

Control browser automation behavior:

```env
SELENIUM_HEADLESS=false           # Headless mode
SELENIUM_IMPLICIT_WAIT=10000      # Implicit wait timeout (ms)
SELENIUM_EXPLICIT_WAIT=30000      # Explicit wait timeout (ms)
```

### Logging Settings

```env
LOG_LEVEL=info                    # Log level: error | warn | info | debug
ENABLE_CONSOLE_LOG=true           # Console output
ENABLE_FILE_LOG=true              # File output
```

## Troubleshooting

### Login Issues

If automatic login fails:

```bash
# Remove old cookie file
rm toutiao_cookies.json

# Login again
npm run login
```

> [!TIP]
> For first-time login or when encountering CAPTCHA, complete verification manually in the browser window. Cookies will be saved automatically.

### Publishing Failures

**Image upload errors:**
- Ensure image files exist and are accessible
- Check image format (JPG, PNG, GIF supported)
- Verify image size is within limits

**Content rejected:**
- Title must be 2-30 characters
- Avoid prohibited keywords
- Review Toutiao's content publishing guidelines

### Chrome Driver Issues

> [!NOTE]
> On first run, Selenium automatically downloads ChromeDriver, which may take a few minutes.

If download fails, manually download and set environment variable:

```bash
export CHROME_DRIVER_PATH=/path/to/chromedriver
```

## Development

```bash
# Development mode (hot reload)
npm run dev

# Build
npm run build

# Test publishing
npm run test
```

## Security Recommendations

- **Protect Keys** - Never commit `.env` file to version control
- **Encrypted Storage** - Cookies are encrypted with AES-256-GCM
- **Regular Updates** - Keep dependencies updated for security patches
- **Access Control** - Restrict MCP server access in production environments

## Limitations

- Requires valid Toutiao creator account
- Publishing frequency limited by account level
- Some content may require platform review
- UI changes may break automation (selectors need updates)

## Resources

- [Model Context Protocol](https://modelcontextprotocol.io) - Official MCP documentation
- [Toutiao Creator Platform](https://mp.toutiao.com) - Content management backend
- [Selenium WebDriver](https://www.selenium.dev/documentation/) - Browser automation

## License

MIT License - see [LICENSE](LICENSE) file for details

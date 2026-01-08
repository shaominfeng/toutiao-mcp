# Toutiao MCP Server

[中文](README.md) | English

A Model Context Protocol (MCP) server for automating content publishing to Toutiao (今日头条), China's leading content platform. This TypeScript-based server provides seamless integration with AI assistants like Claude to streamline content creation and distribution workflows.

## Features

- **Automated Authentication**: Login via Selenium WebDriver with secure cookie management
- **Content Publishing**: Publish articles and micro-posts with images, tags, and categories
- **Content Management**: List, query, and delete published articles
- **Analytics**: Track account performance and generate data reports
- **AI Integration**: Built-in support for AI-powered content generation
- **Markdown Support**: Convert Markdown content to Toutiao-compatible HTML
- **Wenyan Format**: Support for Wenyan (文言) Markdown conversion for enhanced formatting
- **Secure Storage**: Encrypted cookie storage for session management

## Prerequisites

- Node.js 18+
- Chrome/Chromium browser (for Selenium automation)
- Toutiao account

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/toutiao-mcp.git
cd toutiao-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
# Cookie encryption key (required)
COOKIE_ENCRYPTION_KEY=your-secure-password-at-least-32-characters-long

# Selenium settings
SELENIUM_HEADLESS=false
SELENIUM_IMPLICIT_WAIT=10000
SELENIUM_EXPLICIT_WAIT=30000

# Logging
LOG_LEVEL=info
ENABLE_CONSOLE_LOG=true
ENABLE_FILE_LOG=true

# Optional: AI integration (OpenAI-compatible API)
# OPENAI_API_KEY=your-api-key
# OPENAI_BASE_URL=https://api.openai.com/v1
```

> [!IMPORTANT]
> The `COOKIE_ENCRYPTION_KEY` must be at least 32 characters long. Changing this key will invalidate existing stored cookies.

4. Build the project:

```bash
npm run build
```

## Usage

### Running as MCP Server

Start the MCP server for integration with AI assistants:

```bash
npm start
```

The server exposes MCP tools that can be called by compatible AI clients.

### Development Mode

Run in development mode with hot reload:

```bash
npm run dev
```

### Authentication

First-time login using Selenium:

```bash
npm run login
```

This opens a browser window where you can manually log in. Cookies are saved for subsequent sessions.

### Publishing Content

#### Automated Publishing Scripts

Publish content from your knowledge base:

```bash
npm run auto-publish-knowledge
```

Publish with AI-generated content:

```bash
npm run auto-publish-ai
```

Publish custom content:

```bash
npm run publish-custom
```

#### Using MCP Tools

Once the server is running, AI assistants can call these tools:

**Authentication**
- `login_with_credentials` - Login with username/password
- `check_login_status` - Verify current login state

**Publishing**
- `publish_article` - Publish a complete article
- `publish_micro_post` - Publish a micro-post (similar to a tweet)

**Management**
- `get_article_list` - List published articles
- `delete_article` - Remove an article

**Analytics**
- `get_account_overview` - Get account statistics
- `get_article_stats` - Get statistics for a specific article
- `generate_report` - Generate analytics reports (daily/weekly/monthly)

## MCP Tools Reference

### publish_article

Publish a complete article to Toutiao.

```typescript
{
  title: string;        // 2-30 characters
  content: string;      // Article content (supports Markdown)
  images?: string[];    // Image file paths
  tags?: string[];      // Article tags
  category?: string;    // Article category
}
```

**Example:**

```json
{
  "title": "Getting Started with TypeScript",
  "content": "# Introduction\n\nTypeScript is a typed superset of JavaScript...",
  "images": ["./images/typescript-logo.png"],
  "tags": ["TypeScript", "Programming", "Tutorial"],
  "category": "科技"
}
```

### publish_micro_post

Publish a short-form micro-post.

```typescript
{
  content: string;      // Post content
  images?: string[];    // Up to 9 images
  topic?: string;       // Topic hashtag
}
```

### get_article_list

Retrieve published articles.

```typescript
{
  page?: number;        // Default: 1
  pageSize?: number;    // Default: 20
  status?: string;      // 'all' | 'published' | 'draft' | 'review'
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
│   │   ├── config.ts         # Configuration management
│   │   └── wenyan-converter.ts # Markdown conversion
│   ├── scripts/              # Automation scripts
│   ├── utils/                # Utilities (logger, cookie storage, etc.)
│   └── types/                # TypeScript type definitions
├── examples/                  # Sample content files
├── logs/                     # Application logs
└── data/                     # Data storage
```

## Configuration

### Selenium Options

Control browser automation behavior:

- `SELENIUM_HEADLESS`: Run browser in headless mode (true/false)
- `SELENIUM_IMPLICIT_WAIT`: Default wait time for elements (ms)
- `SELENIUM_EXPLICIT_WAIT`: Maximum wait time for operations (ms)

### Content Settings

- `MAX_IMAGE_SIZE`: Maximum image file size in bytes
- `IMAGE_QUALITY`: Image compression quality (1-100)
- `DEFAULT_CATEGORY`: Default article category

### Logging

- `LOG_LEVEL`: Logging verbosity (error, warn, info, debug)
- `LOG_DIR`: Directory for log files
- `ENABLE_CONSOLE_LOG`: Show logs in console
- `ENABLE_FILE_LOG`: Write logs to files

## Troubleshooting

### Login Issues

> [!TIP]
> If automatic login fails, try running `npm run login` to manually authenticate in the browser window.

**Common problems:**
- Captcha verification required - complete manually during `npm run login`
- Session expired - delete `toutiao_cookies.json` and login again
- Invalid credentials - verify username/password in environment variables

### Publishing Failures

**Image upload errors:**
- Ensure images are under the maximum size limit
- Verify image paths are correct and accessible
- Check that images are in supported formats (JPG, PNG, GIF)

**Content rejected:**
- Review Toutiao's content guidelines
- Ensure title length is 2-30 characters
- Check for restricted keywords or topics

### Performance

> [!NOTE]
> The first run may take longer as Selenium downloads the Chrome driver automatically.

For faster operation:
- Enable headless mode: `SELENIUM_HEADLESS=true`
- Reduce wait times if your network is fast
- Use smaller images or lower `IMAGE_QUALITY`

## Security Considerations

- **Cookie Encryption**: All cookies are encrypted at rest using AES-256-GCM
- **Environment Variables**: Never commit `.env` files to version control
- **API Keys**: Keep `OPENAI_API_KEY` and `COOKIE_ENCRYPTION_KEY` secure
- **Access Control**: Consider running the MCP server in a restricted environment

## Examples

### Basic Article Publishing

```bash
# Test publishing with sample content
npm run test
```

### Wenyan Format Conversion

The server supports Wenyan Markdown format for enhanced HTML rendering:

```bash
npm run test-wenyan
```

## API Integration

This MCP server is designed to work with AI assistants that support the Model Context Protocol. Connect it to Claude or other compatible clients to enable natural language content publishing.

**Example workflow with Claude:**

1. Start the MCP server: `npm start`
2. Configure Claude to connect to the server
3. Ask Claude: "Publish an article about TypeScript best practices"
4. Claude uses the MCP tools to authenticate and publish

## Development

### Building

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Project Scripts

- `npm run dev` - Development mode with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run login` - Interactive login
- `npm test` - Test publishing functionality
- `npm run auto-publish-news` - Auto-publish from news sources
- `npm run auto-publish-ai` - Publish AI-generated content
- `npm run auto-publish-knowledge` - Publish from knowledge base

## Limitations

- Requires active Toutiao account with content publishing permissions
- Rate limits apply based on your account level
- Some content may require manual review by Toutiao
- Selenium automation may break if Toutiao updates their UI

## Resources

- [Model Context Protocol](https://modelcontextprotocol.io)
- [Toutiao Creator Platform](https://mp.toutiao.com)
- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/)

## License

MIT

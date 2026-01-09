/**
 * 今日头条 MCP 服务器类型定义
 */

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
}

export interface CookiesData {
  cookies: Cookie[];
  timestamp: number;
}

export interface UserInfo {
  login_status: boolean;
  user_id?: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  followers_count?: number;
  following_count?: number;
}

export interface PublishArticleParams {
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  category?: string;
  coverImage?: string;
  publishTime?: string;
  original?: boolean;
}

export interface PublishMicroPostParams {
  content: string;
  images?: string[];
  topic?: string;
  location?: string;
  publishTime?: string;
}

export interface PublishResult {
  success: boolean;
  message: string;
  title?: string;
  articleId?: string;
  url?: string;
}

export interface ArticleInfo {
  id: string;
  title: string;
  status: string;
  readCount: number;
  commentCount: number;
  likeCount: number;
  shareCount: number;
  publishTime: string;
}

export interface ArticleListResult {
  success: boolean;
  articles?: ArticleInfo[];
  total?: number;
  page?: number;
  pageSize?: number;
  message?: string;
}

export interface AccountOverview {
  success: boolean;
  followersCount?: number;
  articlesCount?: number;
  totalReadCount?: number;
  totalLikeCount?: number;
  message?: string;
}

export interface ArticleStats {
  success: boolean;
  articleId?: string;
  readCount?: number;
  commentCount?: number;
  likeCount?: number;
  shareCount?: number;
  message?: string;
}

export interface XiaohongshuRecord {
  title: string;
  content: string;
  image_url?: string;
}

export interface FeishuRecord {
  小红书标题?: string;
  仿写小红书文案?: string;
  配图?: string;
  title?: string;
  content?: string;
  image_url?: string;
}

export interface BatchPublishSummary {
  total_records: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
}

export interface BatchPublishResult {
  success: boolean;
  message: string;
  summary?: BatchPublishSummary;
  results?: Array<{
    record: XiaohongshuRecord;
    publish_result: PublishResult;
  }>;
}

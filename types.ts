export interface Source {
  title: string;
  uri: string;
}

export interface TrendItem {
  id: string;
  category: string;
  headline: string;
  summary: string;
  viralityScore: number; // 1-100
  hashtags: string[];
  sources: Source[];
  timestamp: string;
}

export interface GeneratedContent {
  platform: 'Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube' | 'Blog';
  content: string;
}

export enum NewsCategory {
  BREAKING = 'Breaking News',
  TECH = 'Technology',
  CRYPTO = 'Crypto & Web3',
  FINANCE = 'Finance & Markets',
  CELEBRITY = 'Celebrity & Entertainment',
  SPORTS = 'Sports & Football',
  LIFESTYLE = 'Lifestyle & Travel'
}

export enum Region {
  GLOBAL = 'Global',
  USA = 'USA',
  CANADA = 'Canada',
  EUROPE = 'Europe',
  ASIA = 'Asia',
  MIDDLE_EAST = 'Middle East',
  AFRICA = 'Africa',
  LATIN_AMERICA = 'Latin America'
}
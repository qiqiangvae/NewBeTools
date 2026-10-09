import { ReactElement, ReactNode } from 'react';

export enum ToolCategory {
  DEVELOPER = 'Developer',
  CONVERTER = 'Converter',
  CRYPTO = 'Cryptography',
  AI = 'AI Assistant',
  UTILITY = 'Utility'
}

export interface ToolDef {
  id: string;
  name: string;      // Default (English)
  nameZh: string;    // Chinese
  description: string;
  descriptionZh: string;
  category: ToolCategory;
  icon: ReactNode;
  /** A placeholder element; App injects the live props via cloneElement. */
  component: ReactElement<ToolComponentProps>;
  keywords: string[];
}

export type Lang = 'zh' | 'en';
export type Theme = 'light' | 'dark';

export interface ToolComponentProps {
  lang: Lang;
  state?: any;
  onStateChange?: (state: any) => void;
  onNavigateToTool?: (toolId: string, payload?: any) => void;
}

const CATEGORY_LABELS: Record<ToolCategory, Record<Lang, string>> = {
  [ToolCategory.DEVELOPER]: { zh: '开发', en: 'Developer' },
  [ToolCategory.CONVERTER]: { zh: '转换', en: 'Converter' },
  [ToolCategory.CRYPTO]: { zh: '加密', en: 'Crypto' },
  [ToolCategory.AI]: { zh: 'AI 助手', en: 'AI Assistant' },
  [ToolCategory.UTILITY]: { zh: '工具', en: 'Utility' },
};

/** Localized display label for a tool category. */
export const categoryLabel = (category: ToolCategory, lang: Lang): string =>
  CATEGORY_LABELS[category]?.[lang] ?? category;

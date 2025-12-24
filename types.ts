
import { ReactNode } from 'react';

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
  component: ReactNode;
  keywords: string[];
}

export interface ToolState {
  currentToolId: string | null;
}

export type Lang = 'zh' | 'en';
export type Theme = 'light' | 'dark';

export interface ToolComponentProps {
  lang: Lang;
  state?: any;
  onStateChange?: (state: any) => void;
}

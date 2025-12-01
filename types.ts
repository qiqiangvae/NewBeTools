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
  name: string;
  description: string;
  category: ToolCategory;
  icon: ReactNode;
  component: ReactNode;
  keywords: string[];
}

export interface ToolState {
  currentToolId: string | null;
}
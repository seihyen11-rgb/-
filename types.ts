
export interface ProteinLog {
  id: string;
  foodName: string;
  proteinAmount: number;
  timestamp: number;
  imageUrl?: string;
}

export type MessageRole = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text?: string;
  logId?: string; // Reference to a ProteinLog if this message is a food record
  timestamp: number;
}

export interface DailySummary {
  date: string;
  totalProtein: number;
}

export enum ViewMode {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}

// Telegram API types
export interface TelegramMessagePayload {
  chat_id: string;
  text: string;
  parse_mode: string;
  message_thread_id?: string;
}

export interface TelegramApiResponse {
  ok: boolean;
  result?: {
    message_id: number;
    date: number;
    text: string;
  };
  error_code?: number;
  description?: string;
}

export interface Chat {
  contact_id: number;
  contact_username: string;
  contact_profile_picture: string;
  last_message_date: string;
  last_message_content: string;
  unread?: number; // optional, depends if you implement it later
}

export interface RightPanelProps {
  contactId: number | null;
  ws: WebSocket | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export interface Message {
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_date: string;
  last_updated_date: string;
  type?: string; // for "chat" messages via WS
}

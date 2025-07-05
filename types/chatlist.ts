export interface Chat {
  contact_id: number;
  contact_username: string;
  contact_profile_picture: string;
  last_message_date: string;
  last_message_content: string;
  unread?: number; // optional, depends if you implement it later
}

export interface LeftPanelProps {
  onSelectChat: (contactId: number) => void;
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
  // Optional fields for file/media messages
  type?: 0 | 1 | 2 | 3; // defaults to 0 (text) if omitted
  mime_type?: string; // e.g., "image/png", "video/mp4"
  file_name?: string; // only for file uploads
}

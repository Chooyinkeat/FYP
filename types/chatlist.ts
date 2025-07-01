export interface Chat {
  contact_id: number;
  contact_username: string;
  contact_profile_picture: string;
  last_message_date: string;
  last_message_content: string;
  unread?: number; // optional, depends if you implement it later
}

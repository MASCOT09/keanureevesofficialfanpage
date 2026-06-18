export type MessageStatus = "unread" | "read" | "replied";

export interface Message {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  from_name: string;
  is_read: boolean;
  status: MessageStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

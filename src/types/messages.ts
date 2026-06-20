export type MessageStatus = "unread" | "read" | "replied";
export type MessageSenderRole = "admin" | "fan";

export interface Message {
  id: string;
  user_id: string;
  thread_id: string;
  sender_role: MessageSenderRole;
  subject: string;
  body: string;
  from_name: string;
  is_read: boolean;
  status: MessageStatus;
  created_at: string;
}

export interface MessageThread {
  thread_id: string;
  user_id: string;
  subject: string;
  fan_name: string;
  fan_email: string;
  membership_tier: string;
  last_message_at: string;
  last_message_preview: string;
  last_sender_role: MessageSenderRole;
  unread_for_admin: number;
  unread_for_fan: number;
  message_count: number;
  fan_last_seen_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

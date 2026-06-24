export type UserRole = "fan" | "admin";

export type { MembershipTier, MembershipStatus } from "@/types/membership";

export interface Profile {
  id: string;
  display_name: string | null;
  role: UserRole;
  country: string | null;
  avatar_url: string | null;
  membership_tier: import("@/types/membership").MembershipTier;
  membership_status: import("@/types/membership").MembershipStatus;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  celebrity_name: string;
  tagline: string | null;
  hero_video_url: string | null;
  updated_at: string;
}

export type GiveawayStatus = "draft" | "active" | "closed";

export interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  rules: string | null;
  image_url: string | null;
  image_urls: string | null;
  ends_at: string;
  status: GiveawayStatus;
  created_at: string;
}

export interface GiveawayEntry {
  id: string;
  giveaway_id: string;
  user_id: string;
  created_at: string;
}

export type MeetGreetStatus = "upcoming" | "closed";

export interface MeetGreetEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  image_urls: string | null;
  event_date: string;
  max_spots: number;
  status: MeetGreetStatus;
  created_at: string;
}

export type RegistrationStatus = "confirmed" | "waitlist";

export interface MeetGreetRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  platform: string;
  url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type ContactRecipient = "keanu" | "team";

export interface ContactLink {
  id: string;
  platform: "whatsapp" | "zangi" | "telegram" | string;
  recipient: ContactRecipient;
  label: string;
  url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SiteButton {
  id: string;
  button_key: string;
  section: string;
  label: string;
  href: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  open_in_new_tab: boolean;
  updated_at: string;
}

-- Production schema matching the Excel backend (custom auth + sessions).
-- Run this in Supabase → SQL Editor on a new project.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT where applicable.

create extension if not exists "pgcrypto";

create table if not exists public.app_users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  display_name text not null,
  role text not null default 'fan' check (role in ('fan', 'admin')),
  country text,
  avatar_url text,
  membership_tier text not null default 'none',
  membership_status text not null default 'none',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  celebrity_name text not null,
  tagline text,
  hero_video_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.giveaways (
  id text primary key,
  title text not null,
  description text,
  rules text,
  image_url text,
  ends_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.giveaway_entries (
  id text primary key,
  giveaway_id text not null references public.giveaways(id) on delete cascade,
  user_id text not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (giveaway_id, user_id)
);

create table if not exists public.meet_greet_events (
  id text primary key,
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  max_spots int not null default 50,
  status text not null default 'upcoming' check (status in ('upcoming', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.meet_greet_registrations (
  id text primary key,
  event_id text not null references public.meet_greet_events(id) on delete cascade,
  user_id text not null references public.app_users(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'waitlist')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.communities (
  id text primary key,
  name text not null,
  description text,
  platform text not null,
  url text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_links (
  id text primary key,
  platform text not null,
  recipient text not null default 'keanu' check (recipient in ('keanu', 'team')),
  label text not null,
  url text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  subject text not null,
  body text not null,
  from_name text not null,
  is_read boolean not null default false,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.membership_applications (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  user_email text not null,
  user_name text not null,
  tier text not null check (tier in ('silver', 'gold', 'platinum')),
  amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_app_users_email on public.app_users (lower(email));
create index if not exists idx_messages_user_id on public.messages (user_id);
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_giveaway_entries_user_id on public.giveaway_entries (user_id);
create index if not exists idx_meet_greet_registrations_event_id on public.meet_greet_registrations (event_id);

insert into public.site_settings (id, celebrity_name, tagline, hero_video_url, updated_at)
values (
  1,
  'Keanu Reeves',
  'Official fan experience — giveaways, meet & greets, and more.',
  '/videos/intro.mp4',
  now()
)
on conflict (id) do nothing;

-- Disable RLS — the Next.js server uses the service role key only.
alter table public.app_users disable row level security;
alter table public.site_settings disable row level security;
alter table public.giveaways disable row level security;
alter table public.giveaway_entries disable row level security;
alter table public.meet_greet_events disable row level security;
alter table public.meet_greet_registrations disable row level security;
alter table public.communities disable row level security;
alter table public.contact_links disable row level security;
alter table public.messages disable row level security;
alter table public.notifications disable row level security;
alter table public.membership_applications disable row level security;

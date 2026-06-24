alter table public.giveaways
  add column if not exists image_urls text;

alter table public.meet_greet_events
  add column if not exists image_url text,
  add column if not exists image_urls text;

create table if not exists public.content_views (
  id text primary key,
  content_type text not null check (content_type in ('giveaway', 'meet_greet')),
  content_id text not null,
  user_id text not null references public.app_users(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (content_type, content_id, user_id)
);

create index if not exists idx_content_views_content on public.content_views (content_type, content_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

alter table public.content_views disable row level security;

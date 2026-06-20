alter table public.app_users
  add column if not exists last_seen_at timestamptz;

create index if not exists idx_app_users_last_seen_at on public.app_users (last_seen_at);

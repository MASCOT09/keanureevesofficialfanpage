-- Celebrity Fan Site — initial schema

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'fan' check (role in ('fan', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Site settings (singleton row id=1)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  celebrity_name text not null default 'Celebrity Name',
  tagline text default 'Welcome to the official fan experience',
  hero_video_url text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Site settings are publicly readable"
  on public.site_settings for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

insert into public.site_settings (id, celebrity_name, tagline, hero_video_url)
values (1, 'Celebrity Name', 'Welcome to the official fan experience', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
on conflict (id) do nothing;

-- Giveaways
create table if not exists public.giveaways (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  rules text,
  image_url text,
  ends_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.giveaways enable row level security;

create policy "Active giveaways are publicly readable"
  on public.giveaways for select
  using (status = 'active' or status = 'closed');

create policy "Admins can manage giveaways"
  on public.giveaways for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Giveaway entries
create table if not exists public.giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references public.giveaways(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (giveaway_id, user_id)
);

alter table public.giveaway_entries enable row level security;

create policy "Users can view own giveaway entries"
  on public.giveaway_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own giveaway entries"
  on public.giveaway_entries for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all giveaway entries"
  on public.giveaway_entries for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Meet & Greet events
create table if not exists public.meet_greet_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  max_spots int not null default 50,
  status text not null default 'upcoming' check (status in ('upcoming', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.meet_greet_events enable row level security;

create policy "Upcoming events are publicly readable"
  on public.meet_greet_events for select
  using (status in ('upcoming', 'closed'));

create policy "Admins can manage meet greet events"
  on public.meet_greet_events for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Meet & Greet registrations
create table if not exists public.meet_greet_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.meet_greet_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'waitlist')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.meet_greet_registrations enable row level security;

create policy "Users can view own registrations"
  on public.meet_greet_registrations for select
  using (auth.uid() = user_id);

create policy "Users can insert own registrations"
  on public.meet_greet_registrations for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all registrations"
  on public.meet_greet_registrations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Communities
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  platform text not null,
  url text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.communities enable row level security;

create policy "Active communities are publicly readable"
  on public.communities for select
  using (is_active = true);

create policy "Admins can manage communities"
  on public.communities for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Contact links (WhatsApp, Zangi, Telegram)
create table if not exists public.contact_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.contact_links enable row level security;

create policy "Active contact links are publicly readable"
  on public.contact_links for select
  using (is_active = true);

create policy "Admins can manage contact links"
  on public.contact_links for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Seed data (safe to re-run)
insert into public.communities (name, description, platform, url, sort_order)
select 'Official Fan Club', 'Join thousands of fans in our main community', 'telegram', 'https://t.me/example', 1
where not exists (select 1 from public.communities where name = 'Official Fan Club');

insert into public.communities (name, description, platform, url, sort_order)
select 'Behind the Scenes', 'Exclusive updates and sneak peeks', 'telegram', 'https://t.me/example2', 2
where not exists (select 1 from public.communities where name = 'Behind the Scenes');

insert into public.contact_links (platform, label, url, sort_order)
select 'whatsapp', 'WhatsApp', 'https://wa.me/1234567890', 1
where not exists (select 1 from public.contact_links where platform = 'whatsapp' and label = 'WhatsApp');

insert into public.contact_links (platform, label, url, sort_order)
select 'zangi', 'Zangi', 'https://zangi.com/', 2
where not exists (select 1 from public.contact_links where platform = 'zangi');

insert into public.contact_links (platform, label, url, sort_order)
select 'telegram', 'Telegram', 'https://t.me/example', 3
where not exists (select 1 from public.contact_links where platform = 'telegram' and label = 'Telegram');

-- Storage bucket for hero video (run in Supabase dashboard or via CLI)
-- insert into storage.buckets (id, name, public) values ('media', 'media', true);

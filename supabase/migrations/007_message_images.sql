alter table public.messages
  add column if not exists image_url text,
  add column if not exists message_kind text not null default 'text',
  add column if not exists metadata text;

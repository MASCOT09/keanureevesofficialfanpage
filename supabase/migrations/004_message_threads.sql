alter table public.messages
  add column if not exists thread_id text,
  add column if not exists sender_role text not null default 'admin'
    check (sender_role in ('admin', 'fan'));

update public.messages
set thread_id = id
where thread_id is null;

alter table public.messages
  alter column thread_id set not null;

create index if not exists idx_messages_thread_id on public.messages (thread_id);
create index if not exists idx_messages_sender_unread on public.messages (sender_role, is_read);

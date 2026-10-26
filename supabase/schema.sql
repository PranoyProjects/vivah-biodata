-- Run once in Supabase → SQL Editor.
-- Public biodata: readable by any signed-in user, writable only by its owner.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
-- Private saved list + collections, one row per user.
create table if not exists public.saved (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"all":[],"collections":[]}'
);
-- Private contact details, one row per user.
create table if not exists public.contacts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'
);

alter table public.profiles enable row level security;
alter table public.saved    enable row level security;
alter table public.contacts enable row level security;

create policy "members read profiles" on public.profiles for select to authenticated using (true);
create policy "owner inserts profile" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "owner updates profile" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes profile" on public.profiles for delete to authenticated using (auth.uid() = user_id);

create policy "owner only saved"    on public.saved    for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner only contacts" on public.contacts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

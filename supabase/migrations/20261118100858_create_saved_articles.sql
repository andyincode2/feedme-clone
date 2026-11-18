-- A saved article is a snapshot of one conversion, kept per user and URL.
create table public.saved_articles (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  url text not null,
  title text not null,
  author text not null default '',
  published text not null default '',
  site text not null,
  content text not null,
  saved_at timestamptz not null default now(),
  unique (user_id, url)
);

-- The saved list reads newest first per user; this also serves the RLS check.
create index saved_articles_user_saved_at_idx
  on public.saved_articles (user_id, saved_at desc);

alter table public.saved_articles enable row level security;

-- This project's default privileges grant every new table to anon and
-- authenticated. Signed-out visitors get nothing; owners get CRUD only.
revoke all on public.saved_articles from anon, authenticated;
grant select, insert, update, delete on public.saved_articles to authenticated;

create policy "Owners can read their saved articles"
  on public.saved_articles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can save articles"
  on public.saved_articles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can replace their saved articles"
  on public.saved_articles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owners can delete their saved articles"
  on public.saved_articles for delete
  to authenticated
  using ((select auth.uid()) = user_id);

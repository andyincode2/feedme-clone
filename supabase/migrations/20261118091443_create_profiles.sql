-- One profile per Auth user, following Supabase's user-management pattern.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  display_name text,
  updated_at timestamptz not null default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- New tables are not exposed to the Data API automatically; grant only what
-- the app uses. Rows are created by the trigger and removed by the cascade.
grant select, update on public.profiles to authenticated;

create policy "Owners can read their profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Owners can update their profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

-- Only the trigger should run this; keep it off the public API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

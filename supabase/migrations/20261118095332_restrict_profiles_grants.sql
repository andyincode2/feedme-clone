-- This project's default privileges grant every new table to anon and
-- authenticated. Keep profiles to what the app uses: owners read and update.
revoke all on public.profiles from anon;
revoke insert, delete, truncate, references, trigger on public.profiles from authenticated;

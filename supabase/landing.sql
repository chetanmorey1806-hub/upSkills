-- =====================================================================================
-- UpSkillr – landing page tables: student reviews and contact enquiries.
-- Run AFTER supabase/schema.sql (it uses public.is_admin() from there):
-- Supabase Dashboard → SQL Editor → New query → paste this whole file → Run. Safe to run again.
-- =====================================================================================

-- ---------------------------------------------------------------- reviews
-- Students submit a review (always approved = false); the admin approves it before it shows on the home page.
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  course text not null default '' check (char_length(course) <= 80),
  rating smallint not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 10 and 1000),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reviews_approved_idx on public.reviews (approved, created_at desc);
alter table public.reviews enable row level security;
grant select, insert on public.reviews to anon, authenticated;
grant update, delete on public.reviews to authenticated;

drop policy if exists "reviews insert unapproved" on public.reviews;
create policy "reviews insert unapproved" on public.reviews for insert to anon, authenticated
  with check (approved = false);
drop policy if exists "reviews read approved" on public.reviews;
create policy "reviews read approved" on public.reviews for select to anon, authenticated
  using (approved = true or public.is_admin());
drop policy if exists "reviews admin update" on public.reviews;
create policy "reviews admin update" on public.reviews for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "reviews admin delete" on public.reviews;
create policy "reviews admin delete" on public.reviews for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------- enquiries
-- Anyone (even without an account) can send an enquiry; only the admin can read / update / delete them.
create table if not exists public.enquiries (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  email text not null default '' check (char_length(email) <= 120),
  course text not null default '' check (char_length(course) <= 80),
  message text not null default '' check (char_length(message) <= 1000),
  status text not null default 'new' check (status in ('new', 'contacted')),
  created_at timestamptz not null default now()
);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
alter table public.enquiries enable row level security;
grant insert on public.enquiries to anon, authenticated;
grant select, update, delete on public.enquiries to authenticated;

drop policy if exists "enquiries insert" on public.enquiries;
create policy "enquiries insert" on public.enquiries for insert to anon, authenticated
  with check (status = 'new');
drop policy if exists "enquiries admin read" on public.enquiries;
create policy "enquiries admin read" on public.enquiries for select to authenticated
  using (public.is_admin());
drop policy if exists "enquiries admin update" on public.enquiries;
create policy "enquiries admin update" on public.enquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "enquiries admin delete" on public.enquiries;
create policy "enquiries admin delete" on public.enquiries for delete to authenticated
  using (public.is_admin());

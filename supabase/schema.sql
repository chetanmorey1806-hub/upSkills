-- =====================================================================================
-- UpSkillr – Supabase database (run once: Supabase Dashboard → SQL Editor → New query →
-- paste this whole file → Run). Safe to run again: it only creates what is missing and
-- replaces functions/policies.
-- =====================================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[A-Za-z0-9_.]{3,20}$'),
  name text not null check (char_length(name) between 2 and 80),
  email text not null default '',
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  active boolean not null default true,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  lessons_done integer not null default 0,
  tests_passed integer not null default 0,
  stats_at timestamptz,
  created_at timestamptz not null default now()
);

-- role helpers (security definer so policies can use them without recursion)
create or replace function public.my_role() returns text language sql stable security definer set search_path = public as
$$ select coalesce((select role from public.profiles where id = auth.uid() and active), '') $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select public.my_role() = 'admin' $$;
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public as
$$ select public.my_role() in ('teacher', 'admin') $$;

-- create the profile when someone signs up (username/name come from the sign-up form)
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text := regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)), '[^A-Za-z0-9_.]', '', 'g');
  uname text;
  n int := 0;
begin
  if char_length(base) < 3 then base := base || 'user'; end if;
  base := left(base, 16);
  uname := base;
  while exists (select 1 from public.profiles where lower(username) = lower(uname)) loop
    n := n + 1; uname := base || n::text;
  end loop;
  insert into public.profiles (id, username, name, email)
  values (new.id, uname, left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), uname), 80), coalesce(new.email, ''));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- students cannot change their own role / active flag
create or replace function public.protect_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if; -- SQL Editor / service role
  if (new.role is distinct from old.role or new.active is distinct from old.active or new.id is distinct from old.id) and not public.is_admin() then
    raise exception 'Only the admin can change roles.';
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles for each row execute function public.protect_profile();

-- username + password sign-in: returns the e-mail ONLY when the password is right
create or replace function public.login_email(identifier text, pw text) returns text language plpgsql security definer set search_path = public, extensions, auth as $$
declare e text; h text;
begin
  select u.email, u.encrypted_password into e, h
  from auth.users u join public.profiles p on p.id = u.id
  where lower(p.username) = lower(trim(identifier)) and p.active;
  if e is null or h is null or extensions.crypt(pw, h) <> h then return null; end if;
  return e;
end $$;
revoke all on function public.login_email(text, text) from public;
grant execute on function public.login_email(text, text) to anon, authenticated;

create or replace function public.username_taken(u text) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where lower(username) = lower(trim(u))) $$;
grant execute on function public.username_taken(text) to anon, authenticated;

alter table public.profiles enable row level security;
-- e-mail addresses stay private: signed-in users may read every column except email
revoke all on public.profiles from anon, authenticated;
grant select (id, username, name, role, active, xp, level, streak, lessons_done, tests_passed, stats_at, created_at) on public.profiles to authenticated;
grant update (username, name, role, active, xp, level, streak, lessons_done, tests_passed, stats_at) on public.profiles to authenticated;
drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------- per-student progress (sync)
create table if not exists public.user_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null check (char_length(key) <= 200),
  value text not null check (char_length(value) <= 3000000),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.user_data enable row level security;
drop policy if exists "own data" on public.user_data;
create policy "own data" on public.user_data for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------- batches (teacher panel)
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  code text not null unique default upper(substr(md5(random()::text), 1, 6)),
  teacher_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);
create table if not exists public.batch_members (
  batch_id uuid not null references public.batches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (batch_id, user_id)
);
create or replace function public.is_batch_teacher(b uuid) returns boolean language sql stable security definer set search_path = public as
$$ select public.is_admin() or exists (select 1 from public.batches where id = b and teacher_id = auth.uid()) $$;
create or replace function public.is_batch_member(b uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.batch_members where batch_id = b and user_id = auth.uid()) $$;
create or replace function public.join_batch(c text) returns uuid language plpgsql security definer set search_path = public as $$
declare b uuid;
begin
  select id into b from public.batches where code = upper(trim(c));
  if b is null then raise exception 'No batch with this code. Check the code with your teacher.'; end if;
  insert into public.batch_members (batch_id, user_id) values (b, auth.uid()) on conflict do nothing;
  return b;
end $$;
grant execute on function public.join_batch(text) to authenticated;

alter table public.batches enable row level security;
drop policy if exists "batches read" on public.batches;
create policy "batches read" on public.batches for select to authenticated using (public.is_batch_teacher(id) or public.is_batch_member(id));
drop policy if exists "batches create" on public.batches;
create policy "batches create" on public.batches for insert to authenticated with check (public.is_staff() and teacher_id = auth.uid());
drop policy if exists "batches change" on public.batches;
create policy "batches change" on public.batches for update to authenticated using (public.is_batch_teacher(id)) with check (public.is_batch_teacher(id));
drop policy if exists "batches delete" on public.batches;
create policy "batches delete" on public.batches for delete to authenticated using (public.is_batch_teacher(id));

alter table public.batch_members enable row level security;
drop policy if exists "members read" on public.batch_members;
create policy "members read" on public.batch_members for select to authenticated using (public.is_batch_teacher(batch_id) or public.is_batch_member(batch_id));
drop policy if exists "members leave" on public.batch_members;
create policy "members leave" on public.batch_members for delete to authenticated using (user_id = auth.uid() or public.is_batch_teacher(batch_id));

create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  batch_id uuid not null references public.batches (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 5000),
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
drop policy if exists "ann read" on public.announcements;
create policy "ann read" on public.announcements for select to authenticated using (public.is_batch_teacher(batch_id) or public.is_batch_member(batch_id));
drop policy if exists "ann write" on public.announcements;
create policy "ann write" on public.announcements for all to authenticated using (public.is_batch_teacher(batch_id)) with check (public.is_batch_teacher(batch_id));

create table if not exists public.assignments (
  id bigint generated always as identity primary key,
  batch_id uuid not null references public.batches (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  link text not null default '',
  due_at date,
  created_by uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.assignments enable row level security;
drop policy if exists "asg read" on public.assignments;
create policy "asg read" on public.assignments for select to authenticated using (public.is_batch_teacher(batch_id) or public.is_batch_member(batch_id));
drop policy if exists "asg write" on public.assignments;
create policy "asg write" on public.assignments for all to authenticated using (public.is_batch_teacher(batch_id)) with check (public.is_batch_teacher(batch_id));

create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  assignment_id bigint not null references public.assignments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  note text not null default '' check (char_length(note) <= 3000),
  link text not null default '',
  submitted_at timestamptz not null default now(),
  grade text not null default '',
  feedback text not null default '' check (char_length(feedback) <= 3000),
  graded_at timestamptz,
  unique (assignment_id, user_id)
);
create or replace function public.assignment_batch(a bigint) returns uuid language sql stable security definer set search_path = public as
$$ select batch_id from public.assignments where id = a $$;
-- students may not grade themselves
create or replace function public.protect_submission() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_batch_teacher(public.assignment_batch(new.assignment_id)) then
    if tg_op = 'INSERT' then new.grade := ''; new.feedback := ''; new.graded_at := null;
    else new.grade := old.grade; new.feedback := old.feedback; new.graded_at := old.graded_at; end if;
  end if;
  return new;
end $$;
drop trigger if exists submissions_protect on public.submissions;
create trigger submissions_protect before insert or update on public.submissions for each row execute function public.protect_submission();
alter table public.submissions enable row level security;
drop policy if exists "sub read" on public.submissions;
create policy "sub read" on public.submissions for select to authenticated using (user_id = auth.uid() or public.is_batch_teacher(public.assignment_batch(assignment_id)));
drop policy if exists "sub insert" on public.submissions;
create policy "sub insert" on public.submissions for insert to authenticated with check (user_id = auth.uid() and public.is_batch_member(public.assignment_batch(assignment_id)));
drop policy if exists "sub update" on public.submissions;
create policy "sub update" on public.submissions for update to authenticated using (user_id = auth.uid() or public.is_batch_teacher(public.assignment_batch(assignment_id)));
drop policy if exists "sub delete" on public.submissions;
create policy "sub delete" on public.submissions for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------- doubt forum
create table if not exists public.forum_threads (
  id bigint generated always as identity primary key,
  author_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 5 and 200),
  body text not null default '' check (char_length(body) <= 10000),
  course text not null default '',
  lesson_key text not null default '',
  solved boolean not null default false,
  reply_count integer not null default 0,
  last_activity timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.forum_posts (
  id bigint generated always as identity primary key,
  thread_id bigint not null references public.forum_threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  body text not null check (char_length(body) between 1 and 10000),
  is_answer boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists forum_posts_thread on public.forum_posts (thread_id, id);
create index if not exists forum_threads_activity on public.forum_threads (last_activity desc);
create or replace function public.forum_post_count() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then update public.forum_threads set reply_count = reply_count + 1, last_activity = now() where id = new.thread_id;
  elsif tg_op = 'DELETE' then update public.forum_threads set reply_count = greatest(0, reply_count - 1) where id = old.thread_id; end if;
  return null;
end $$;
drop trigger if exists forum_posts_count on public.forum_posts;
create trigger forum_posts_count after insert or delete on public.forum_posts for each row execute function public.forum_post_count();
create or replace function public.thread_author(t bigint) returns uuid language sql stable security definer set search_path = public as
$$ select author_id from public.forum_threads where id = t $$;

alter table public.forum_threads enable row level security;
drop policy if exists "threads read" on public.forum_threads;
create policy "threads read" on public.forum_threads for select to authenticated using (true);
drop policy if exists "threads create" on public.forum_threads;
create policy "threads create" on public.forum_threads for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "threads change" on public.forum_threads;
create policy "threads change" on public.forum_threads for update to authenticated using (author_id = auth.uid() or public.is_staff());
drop policy if exists "threads delete" on public.forum_threads;
create policy "threads delete" on public.forum_threads for delete to authenticated using (author_id = auth.uid() or public.is_staff());

alter table public.forum_posts enable row level security;
drop policy if exists "posts read" on public.forum_posts;
create policy "posts read" on public.forum_posts for select to authenticated using (true);
drop policy if exists "posts create" on public.forum_posts;
create policy "posts create" on public.forum_posts for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "posts change" on public.forum_posts;
create policy "posts change" on public.forum_posts for update to authenticated using (author_id = auth.uid() or public.is_staff() or public.thread_author(thread_id) = auth.uid());
drop policy if exists "posts delete" on public.forum_posts;
create policy "posts delete" on public.forum_posts for delete to authenticated using (author_id = auth.uid() or public.is_staff());

-- ---------------------------------------------------------------- interview experience bank
create table if not exists public.experiences (
  id bigint generated always as identity primary key,
  author_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  company text not null check (char_length(company) between 1 and 100),
  role text not null default '',
  interview_date date,
  mode text not null default '',
  result text not null default '',
  rounds jsonb not null default '[]'::jsonb,
  tips text not null default '' check (char_length(tips) <= 5000),
  created_at timestamptz not null default now()
);
alter table public.experiences enable row level security;
drop policy if exists "exp read" on public.experiences;
create policy "exp read" on public.experiences for select to authenticated using (true);
drop policy if exists "exp create" on public.experiences;
create policy "exp create" on public.experiences for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "exp change" on public.experiences;
create policy "exp change" on public.experiences for update to authenticated using (author_id = auth.uid() or public.is_staff());
drop policy if exists "exp delete" on public.experiences;
create policy "exp delete" on public.experiences for delete to authenticated using (author_id = auth.uid() or public.is_staff());

-- ---------------------------------------------------------------- study material (admin uploads)
create table if not exists public.materials (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('video', 'photo', 'pdf', 'file', 'link')),
  title text not null check (char_length(title) between 1 and 200),
  note text not null default '',
  course text,
  lesson text,
  url text,
  file_path text,
  file_name text,
  file_mime text,
  file_size bigint,
  created_by uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.materials enable row level security;
drop policy if exists "mat read" on public.materials;
create policy "mat read" on public.materials for select to authenticated using (true);
drop policy if exists "mat write" on public.materials;
create policy "mat write" on public.materials for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------- class chat
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  text text not null default '' check (char_length(text) <= 5000),
  files jsonb not null default '[]'::jsonb,
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
drop policy if exists "chat read" on public.chat_messages;
create policy "chat read" on public.chat_messages for select to authenticated using (true);
drop policy if exists "chat send" on public.chat_messages;
create policy "chat send" on public.chat_messages for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "chat delete" on public.chat_messages;
create policy "chat delete" on public.chat_messages for update to authenticated using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------- file storage
-- Public buckets: files are reachable by their (random) link; only signed-in users can list/upload.
insert into storage.buckets (id, name, public, file_size_limit)
values ('materials', 'materials', true, 52428800), ('chat', 'chat', true, 52428800)
on conflict (id) do nothing;

drop policy if exists "materials upload" on storage.objects;
create policy "materials upload" on storage.objects for insert to authenticated with check (bucket_id = 'materials' and public.is_staff());
drop policy if exists "materials delete" on storage.objects;
create policy "materials delete" on storage.objects for delete to authenticated using (bucket_id = 'materials' and public.is_staff());
drop policy if exists "chat upload" on storage.objects;
create policy "chat upload" on storage.objects for insert to authenticated with check (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "chat delete files" on storage.objects;
create policy "chat delete files" on storage.objects for delete to authenticated using (bucket_id = 'chat' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------------------------------------------------------------- app settings (admin permissions, packages)
create table if not exists public.app_config (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
drop policy if exists "config read" on public.app_config;
create policy "config read" on public.app_config for select to anon, authenticated using (true);
drop policy if exists "config write" on public.app_config;
create policy "config write" on public.app_config for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- live updates (Realtime)
do $$
declare t text;
begin
  foreach t in array array['chat_messages', 'forum_threads', 'forum_posts', 'announcements', 'profiles'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- =====================================================================================
-- After you register in the app, make yourself the admin (change the username):
--   update public.profiles set role = 'admin' where username = 'chetan';
-- Make a trainer a teacher:
--   update public.profiles set role = 'teacher' where username = 'trainer_username';
-- =====================================================================================

-- MoTECH-i database schema
-- Run this in Supabase SQL Editor, or with: supabase db push

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone_number text,
  avatar_url text,
  plan text not null default 'Free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists avatar_url text;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  model text not null,
  plate_number text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plate_number)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  service_type text not null,
  booking_date date,
  booking_time text,
  notes text,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_status_check check (status in ('Pending', 'In Progress', 'Completed', 'Cancelled'))
);

create table if not exists public.sos_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  issue text not null,
  coordinates text not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sos_requests_status_check check (status in ('Pending', 'Rescued', 'Cancelled'))
);

create table if not exists public.showroom (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price text not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spare_parts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text not null,
  description text,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_vehicles_updated_at on public.vehicles;
create trigger set_vehicles_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists set_sos_requests_updated_at on public.sos_requests;
create trigger set_sos_requests_updated_at
before update on public.sos_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_showroom_updated_at on public.showroom;
create trigger set_showroom_updated_at
before update on public.showroom
for each row execute function public.set_updated_at();

drop trigger if exists set_spare_parts_updated_at on public.spare_parts;
create trigger set_spare_parts_updated_at
before update on public.spare_parts
for each row execute function public.set_updated_at();

drop trigger if exists set_academy_videos_updated_at on public.academy_videos;
create trigger set_academy_videos_updated_at
before update on public.academy_videos
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone_number, avatar_url, plan)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'plan', 'Free')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    avatar_url = excluded.avatar_url,
    plan = excluded.plan,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, phone_number, avatar_url, plan, created_at, updated_at)
select
  users.id,
  users.raw_user_meta_data ->> 'full_name',
  users.raw_user_meta_data ->> 'phone_number',
  users.raw_user_meta_data ->> 'avatar_url',
  coalesce(users.raw_user_meta_data ->> 'plan', 'Free'),
  users.created_at,
  now()
from auth.users
left join public.profiles on profiles.id = users.id
where profiles.id is null;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.sos_requests enable row level security;
alter table public.showroom enable row level security;
alter table public.spare_parts enable row level security;
alter table public.academy_videos enable row level security;

drop policy if exists "profiles_select_own_or_dashboard" on public.profiles;
create policy "profiles_select_own_or_dashboard"
on public.profiles for select
using (auth.uid() = id or auth.role() = 'anon');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile_photos_select_public" on storage.objects;
create policy "profile_photos_select_public"
on storage.objects for select
using (bucket_id = 'profile-photos');

drop policy if exists "profile_photos_insert_own" on storage.objects;
create policy "profile_photos_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile_photos_update_own" on storage.objects;
create policy "profile_photos_update_own"
on storage.objects for update
using (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile_photos_delete_own" on storage.objects;
create policy "profile_photos_delete_own"
on storage.objects for delete
using (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "vehicles_select_own_or_dashboard" on public.vehicles;
create policy "vehicles_select_own_or_dashboard"
on public.vehicles for select
using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "vehicles_insert_own" on public.vehicles;
create policy "vehicles_insert_own"
on public.vehicles for insert
with check (auth.uid() = user_id);

drop policy if exists "vehicles_update_own" on public.vehicles;
create policy "vehicles_update_own"
on public.vehicles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "vehicles_delete_own" on public.vehicles;
create policy "vehicles_delete_own"
on public.vehicles for delete
using (auth.uid() = user_id);

drop policy if exists "bookings_select_own_or_dashboard" on public.bookings;
create policy "bookings_select_own_or_dashboard"
on public.bookings for select
using (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
on public.bookings for insert
with check (auth.uid() = user_id);

drop policy if exists "bookings_update_own_or_dashboard" on public.bookings;
create policy "bookings_update_own_or_dashboard"
on public.bookings for update
using (auth.uid() = user_id or auth.role() = 'anon')
with check (auth.uid() = user_id or auth.role() = 'anon');

drop policy if exists "sos_requests_select_dashboard" on public.sos_requests;
create policy "sos_requests_select_dashboard"
on public.sos_requests for select
using (auth.role() in ('anon', 'authenticated'));

drop policy if exists "sos_requests_insert_anyone" on public.sos_requests;
create policy "sos_requests_insert_anyone"
on public.sos_requests for insert
with check (user_id is null or auth.uid() = user_id);

drop policy if exists "sos_requests_update_dashboard" on public.sos_requests;
create policy "sos_requests_update_dashboard"
on public.sos_requests for update
using (auth.role() = 'anon' or auth.uid() = user_id)
with check (auth.role() = 'anon' or auth.uid() = user_id);

drop policy if exists "showroom_read_all" on public.showroom;
create policy "showroom_read_all"
on public.showroom for select
using (true);

drop policy if exists "showroom_dashboard_insert" on public.showroom;
create policy "showroom_dashboard_insert"
on public.showroom for insert
with check (auth.role() = 'anon');

drop policy if exists "showroom_dashboard_update" on public.showroom;
create policy "showroom_dashboard_update"
on public.showroom for update
using (auth.role() = 'anon')
with check (auth.role() = 'anon');

drop policy if exists "spare_parts_read_all" on public.spare_parts;
create policy "spare_parts_read_all"
on public.spare_parts for select
using (true);

drop policy if exists "spare_parts_dashboard_insert" on public.spare_parts;
create policy "spare_parts_dashboard_insert"
on public.spare_parts for insert
with check (auth.role() = 'anon');

drop policy if exists "spare_parts_dashboard_update" on public.spare_parts;
create policy "spare_parts_dashboard_update"
on public.spare_parts for update
using (auth.role() = 'anon')
with check (auth.role() = 'anon');

drop policy if exists "academy_videos_read_all" on public.academy_videos;
create policy "academy_videos_read_all"
on public.academy_videos for select
using (true);

drop policy if exists "academy_videos_dashboard_insert" on public.academy_videos;
create policy "academy_videos_dashboard_insert"
on public.academy_videos for insert
with check (auth.role() = 'anon');

drop policy if exists "academy_videos_dashboard_update" on public.academy_videos;
create policy "academy_videos_dashboard_update"
on public.academy_videos for update
using (auth.role() = 'anon')
with check (auth.role() = 'anon');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('showroom', 'showroom', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('spare_parts', 'spare_parts', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('academy', 'academy', true, 524288000, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_showroom_files" on storage.objects;
create policy "public_read_showroom_files"
on storage.objects for select
using (bucket_id = 'showroom');

drop policy if exists "public_read_spare_parts_files" on storage.objects;
create policy "public_read_spare_parts_files"
on storage.objects for select
using (bucket_id = 'spare_parts');

drop policy if exists "public_read_academy_files" on storage.objects;
create policy "public_read_academy_files"
on storage.objects for select
using (bucket_id = 'academy');

drop policy if exists "dashboard_upload_showroom_files" on storage.objects;
create policy "dashboard_upload_showroom_files"
on storage.objects for insert
with check (bucket_id = 'showroom' and auth.role() = 'anon');

drop policy if exists "dashboard_upload_spare_parts_files" on storage.objects;
create policy "dashboard_upload_spare_parts_files"
on storage.objects for insert
with check (bucket_id = 'spare_parts' and auth.role() = 'anon');

drop policy if exists "dashboard_upload_academy_files" on storage.objects;
create policy "dashboard_upload_academy_files"
on storage.objects for insert
with check (bucket_id = 'academy' and auth.role() = 'anon');

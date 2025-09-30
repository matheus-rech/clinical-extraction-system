-- Supabase migration: form submissions and extraction coordinates
-- Ensures compatibility with legacy Google Sheets data structures

create extension if not exists "pgcrypto";

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  document_name text not null,
  form_payload jsonb not null,
  total_pages int,
  extraction_count int not null default 0,
  metadata jsonb,
  submitted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.extraction_coordinates (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.form_submissions(id) on delete cascade,
  field_name text not null,
  page int not null,
  text text not null,
  x numeric not null,
  y numeric not null,
  width numeric not null,
  height numeric not null,
  selection_method text not null,
  document_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_form_submissions_document_name on public.form_submissions (document_name);
create index if not exists idx_form_submissions_submitted_at on public.form_submissions (submitted_at desc);
create index if not exists idx_extraction_coordinates_submission on public.extraction_coordinates (submission_id);
create index if not exists idx_extraction_coordinates_document on public.extraction_coordinates (document_name);

alter table public.form_submissions enable row level security;
alter table public.extraction_coordinates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Allow form submissions insert (anon)'
  ) then
    create policy "Allow form submissions insert (anon)"
      on public.form_submissions
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'Allow form submissions read (authenticated)'
  ) then
    create policy "Allow form submissions read (authenticated)"
      on public.form_submissions
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'Allow form submissions manage (service_role)'
  ) then
    create policy "Allow form submissions manage (service_role)"
      on public.form_submissions
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Allow coordinate insert (anon)'
  ) then
    create policy "Allow coordinate insert (anon)"
      on public.extraction_coordinates
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'Allow coordinate read (authenticated)'
  ) then
    create policy "Allow coordinate read (authenticated)"
      on public.extraction_coordinates
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'Allow coordinate manage (service_role)'
  ) then
    create policy "Allow coordinate manage (service_role)"
      on public.extraction_coordinates
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

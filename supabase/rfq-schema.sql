-- ARCFORT RFQ database setup for Supabase.
-- Run this in the Supabase SQL editor for the target project.
-- No API keys or credentials belong in this file.

create extension if not exists pgcrypto;

create table if not exists public.rfq_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  email text not null,
  whatsapp text,
  country text not null,
  product_requirements text not null,
  quantity text not null,
  message text,
  attachments jsonb not null default '[]'::jsonb,
  source_path text not null default '/rfq',
  landing_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rfq_inquiries_status_check check (
    status in ('new', 'reviewing', 'quoted', 'closed', 'spam')
  )
);

alter table public.rfq_inquiries
  add column if not exists landing_page text,
  add column if not exists referrer text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text;

create index if not exists rfq_inquiries_created_at_idx
  on public.rfq_inquiries (created_at desc);

create index if not exists rfq_inquiries_status_idx
  on public.rfq_inquiries (status);

create index if not exists rfq_inquiries_country_idx
  on public.rfq_inquiries (country);

create index if not exists rfq_inquiries_utm_source_idx
  on public.rfq_inquiries (utm_source);

create index if not exists rfq_inquiries_utm_campaign_idx
  on public.rfq_inquiries (utm_campaign);

create or replace function public.set_rfq_inquiries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_rfq_inquiries_updated_at on public.rfq_inquiries;

create trigger set_rfq_inquiries_updated_at
before update on public.rfq_inquiries
for each row
execute function public.set_rfq_inquiries_updated_at();

alter table public.rfq_inquiries enable row level security;

-- The website API route uses SUPABASE_SERVICE_ROLE_KEY on the server.
-- Do not create anon or authenticated insert/select policies for public website visitors.
grant usage on schema public to service_role;
grant insert, select, update on public.rfq_inquiries to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'rfq-attachments',
  'rfq-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Keep storage private. The server-side API route uploads with the service role key.
-- Create short-lived signed URLs later if an admin dashboard needs secure file downloads.

-- ARCFORT product catalog setup for Supabase.
-- Run this in the Supabase SQL editor after reviewing the field model.
-- No API keys or credentials belong in this file.

create extension if not exists pgcrypto;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text not null,
  title text not null,
  short_title text not null,
  description text not null,
  seo_title text not null,
  seo_description text not null,
  seo_intro text not null,
  buyer_guide jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  related_category_slugs jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_categories_status_check check (status in ('draft', 'review', 'published', 'archived'))
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  category_slug text not null,
  slug text not null unique,
  title text not null,
  sku text not null,
  kind text not null,
  process text,
  consumable_family text,
  equipment_family text,
  supported_processes jsonb not null default '[]'::jsonb,
  short_description text not null,
  description text not null,
  image_label text not null,
  keywords jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  compatibility jsonb not null default '[]'::jsonb,
  applications jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  packaging text not null,
  moq text not null,
  lead_time text not null,
  missing_fields jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_kind_check check (kind in ('welding-consumable', 'welding-equipment')),
  constraint products_process_check check (
    process is null or process in ('MIG/MAG', 'TIG', 'MMA', 'Plasma Cutting', 'To be confirmed')
  ),
  constraint products_status_check check (status in ('draft', 'review', 'published', 'archived'))
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_relations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  related_product_id uuid not null references public.products(id) on delete cascade,
  relation_type text not null default 'related',
  created_at timestamptz not null default now(),
  constraint product_relations_unique unique (product_id, related_product_id, relation_type),
  constraint product_relations_type_check check (relation_type in ('related', 'compatible', 'replacement'))
);

create index if not exists product_categories_slug_idx
  on public.product_categories (slug);

create index if not exists product_categories_status_idx
  on public.product_categories (status);

create index if not exists products_category_slug_idx
  on public.products (category_slug);

create index if not exists products_slug_idx
  on public.products (slug);

create index if not exists products_sku_idx
  on public.products (sku);

create index if not exists products_status_idx
  on public.products (status);

create index if not exists product_images_product_id_idx
  on public.product_images (product_id);

create index if not exists product_faqs_product_id_idx
  on public.product_faqs (product_id);

create index if not exists product_relations_product_id_idx
  on public.product_relations (product_id);

create or replace function public.set_product_catalog_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_product_categories_updated_at on public.product_categories;

create trigger set_product_categories_updated_at
before update on public.product_categories
for each row
execute function public.set_product_catalog_updated_at();

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_product_catalog_updated_at();

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_faqs enable row level security;
alter table public.product_relations enable row level security;

-- Server-side imports and future admin tools should use the service role key.
-- Do not expose service role credentials to client components.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.product_categories to service_role;
grant select, insert, update, delete on public.products to service_role;
grant select, insert, update, delete on public.product_images to service_role;
grant select, insert, update, delete on public.product_faqs to service_role;
grant select, insert, update, delete on public.product_relations to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-assets',
  'product-assets',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Keep product assets private until the image workflow is confirmed.
-- Public image delivery can be enabled later through signed URLs or a controlled public bucket.

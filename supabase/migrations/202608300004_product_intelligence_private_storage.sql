-- Private originals and evidence storage. No bucket is public.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'pi-product-originals',
    'pi-product-originals',
    false,
    26214400,
    array['image/jpeg', 'image/png', 'image/webp', 'image/tiff']
  ),
  (
    'pi-technical-evidence',
    'pi-technical-evidence',
    false,
    26214400,
    array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  )
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy pi_private_assets_console_read
on storage.objects
for select
to authenticated
using (
  bucket_id in ('pi-product-originals', 'pi-technical-evidence')
  and public.pi_can_view_console()
);

create policy pi_private_assets_governed_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('pi-product-originals', 'pi-technical-evidence')
  and public.pi_has_console_role(
    array['owner', 'editor', 'reviewer']::public.pi_console_role[]
  )
);

create policy pi_private_assets_governed_update
on storage.objects
for update
to authenticated
using (
  bucket_id in ('pi-product-originals', 'pi-technical-evidence')
  and public.pi_has_console_role(
    array['owner', 'editor', 'reviewer']::public.pi_console_role[]
  )
)
with check (
  bucket_id in ('pi-product-originals', 'pi-technical-evidence')
  and public.pi_has_console_role(
    array['owner', 'editor', 'reviewer']::public.pi_console_role[]
  )
);

create policy pi_private_assets_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('pi-product-originals', 'pi-technical-evidence')
  and public.pi_has_console_role(array['owner']::public.pi_console_role[])
);

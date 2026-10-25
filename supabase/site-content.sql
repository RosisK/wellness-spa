-- Public content for the Waves Spa website. Visitors can read it; admins can update it.

create table if not exists public.site_content (
  id integer primary key check (id = 1),
  content jsonb not null
);

alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
  on public.site_content for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on public.site_content to anon, authenticated;
grant update on public.site_content to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'waves-spa-images',
  'waves-spa-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view Waves Spa images" on storage.objects;
create policy "Public can view Waves Spa images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'waves-spa-images');

drop policy if exists "Admins can upload Waves Spa images" on storage.objects;
create policy "Admins can upload Waves Spa images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'waves-spa-images'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins can delete Waves Spa images" on storage.objects;
create policy "Admins can delete Waves Spa images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'waves-spa-images'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

insert into public.site_content (id, content)
values (
  1,
  '{
    "phone": "982-3682291",
    "whatsapp": "982-3682291",
    "hours": "Daily · 9:00–20:00",
    "locations": [{
      "id": "lakeside-pokhara",
      "name": "Waves Spa",
      "address": "Lakeside 6",
      "city": "Pokhara",
      "region": "Gandaki",
      "country": "Nepal",
      "mapUrl": "https://maps.google.com/?q=Lakeside+6+Pokhara+Nepal"
    }],
    "treatments": [
      {"id":"lakeside-reset","name":"The Lakeside Reset","category":"Massage","description":"Full-body massage focused on areas of tension. Pressure can be adjusted during the session.","duration":"60 min","price":"NPR 4,200","featured":true},
      {"id":"himalayan-warm-oil","name":"Himalayan Warm Oil","category":"Massage","description":"A full-body massage using warm herbal oils and compresses.","duration":"90 min","price":"NPR 6,500","featured":true},
      {"id":"quiet-mind-ritual","name":"Quiet Mind Ritual","category":"Ritual","description":"Facial treatment with a scalp massage and singing bowl session.","duration":"75 min","price":"NPR 5,200","featured":true},
      {"id":"river-stone-journey","name":"River Stone Journey","category":"Massage","description":"Massage using warm stones, with attention to the shoulders and legs.","duration":"90 min","price":"NPR 6,800","featured":false},
      {"id":"rest-and-reset","name":"Rest & Reset","category":"Ritual","description":"Body polish followed by a full-body massage.","duration":"120 min","price":"NPR 8,900","featured":false}
    ]
  }'::jsonb
)
on conflict (id) do nothing;

-- Waves Spa public site content and admin write access.
-- Apply this in the Supabase SQL Editor before configuring the admin page.

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

-- After creating the administrator in Supabase Auth, set that account's role:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin@example.com';

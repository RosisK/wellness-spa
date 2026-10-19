# Waves Spa

Website for Waves Spa in Pokhara. The public pages show treatments, prices, contact details, opening hours, and location information. Booking requests are sent to WhatsApp and must be confirmed by the spa.

## Run locally

```sh
npm install
npm run dev
```

## Configure the admin page

The admin page at `/admin` saves public site content to Supabase. It supports phone and WhatsApp numbers, opening hours, multiple locations, and treatment listings. Public pages read the same record, so saved updates are shared with visitors.

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key from the Supabase project settings. These are public client settings; do not add a service-role key to this app.
3. Run [`supabase/site-content.sql`](supabase/site-content.sql) in the Supabase SQL Editor.
4. Create the admin account in Supabase Authentication.
5. In the SQL Editor, assign that account the admin role by running the final `UPDATE auth.users` statement from the migration with the account’s email in place of `admin@example.com`.
6. Sign in at `/admin`. For production, add the same two environment variables to the hosting project and redeploy.

The database allows public reads and restricts edits to authenticated accounts whose server-managed `app_metadata` contains `role: admin`. The admin interface does not offer public sign-up or store passwords in the browser.

Without Supabase environment variables, the site displays its default content and the admin page explains that database setup is required. It does not pretend edits have been saved.

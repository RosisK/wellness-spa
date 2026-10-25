# Waves Spa

Website for Waves Spa in Pokhara. The public pages show treatments, prices, contact details, opening hours, and location information. Booking requests are sent to WhatsApp and must be confirmed by the spa.

## Run locally

```sh
npm install
npm run dev
```

## Configure Supabase and the admin page

The admin page at `/admin` saves contact details, hours, locations, and treatment listings to one Supabase row. The public pages read that same row, so edits appear for visitors too.

### Supabase dashboard

1. Open your Supabase project and go to **Project Settings → API** (in some dashboard versions, **Project Settings → API Keys**). Copy the **Project URL** and the public **anon** key (or publishable key).
2. In the project root, copy `.env.example` to `.env.local`. Fill in those two values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
   ```

   A legacy anon key can also be supplied as `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Do not use or expose the `service_role` or secret key in this website.

3. In Supabase, open **SQL Editor → New query**. Paste and run [`supabase/site-content.sql`](supabase/site-content.sql). This creates the `site_content` table, enables row-level security on that table, creates public-read/admin-update policies, and inserts the initial Waves Spa content. RLS is enabled per table; an account-level setting alone does not configure these policies.
4. In **Authentication → Users**, add an admin user with email and password. Confirm the user if your Auth settings require email confirmation.
5. In SQL Editor, assign the admin role to that exact account. Replace the email below and run it:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'YOUR_ADMIN_EMAIL';
   ```

   This is a server-managed claim; the admin page has no public sign-up or role-editing feature. Sign out and back in after changing a role so Supabase issues a fresh token.

### Run and verify locally

1. Restart the dev server after saving `.env.local`:

   ```sh
   npm run dev
   ```

2. Open `/admin`, sign in with the admin user, change a phone number or treatment, and click **Save changes**.
3. Open the public site and check the header, footer, booking form, and Treatments page. Saved content should appear there.

If sign-in reports that the account lacks the admin role, rerun the role update using the exact account email and sign in again. If sign-in works but save is denied, check that the migration ran and that the update policy is present on `public.site_content`.

For production, add the same URL and public key as environment variables in the hosting project, then redeploy. Without those variables, the site uses its built-in defaults and the admin page shows a setup message instead of claiming changes were saved.

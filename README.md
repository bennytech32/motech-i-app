# MoTECH-i App

MoTECH-i is an Expo mobile app with a Supabase database, an Express backend for AI/payment operations, and a Next.js admin dashboard.

## Supabase Setup

The app needs these Supabase tables and storage buckets:

- `profiles`
- `vehicles`
- `bookings`
- `sos_requests`
- `showroom`
- `spare_parts`
- `academy_videos`
- Storage buckets: `showroom`, `spare_parts`, `academy`

Create them by running [supabase/migrations/20260707000000_initial_motech_schema.sql](./supabase/migrations/20260707000000_initial_motech_schema.sql) in your Supabase project:

1. Open Supabase Dashboard.
2. Select your project.
3. Go to **SQL Editor**.
4. Paste the migration SQL.
5. Click **Run**.

If you use the Supabase CLI, link the project and push:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

The migration also creates a signup trigger so every new Supabase Auth user gets a matching `profiles` row.

## Environment Files

Create local env files from the examples:

```bash
cp .env.example .env
cp motech-backend/.env.example motech-backend/.env
cp motech-admin/.env.example motech-admin/.env.local
```

Use the same Supabase project URL and anon key in the Expo app and admin dashboard. Use the service role key only in `motech-backend/.env`; never put it in Expo or browser code.

## Social Auth Setup

The mobile app uses this OAuth redirect URL:

```text
motechi://auth/callback
```

Add that exact URL in **Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs**.

Google setup:

1. In Google Cloud Console, create or open your OAuth app.
2. Add your Android/iOS app identifiers as needed for production builds.
3. Copy the Google OAuth Client ID and Client Secret into **Supabase Dashboard -> Authentication -> Providers -> Google**.
4. Enable the Google provider in Supabase.
5. Do not put the Google Client Secret in the mobile app.

Apple setup:

1. In Apple Developer account, enable **Sign in with Apple** for `com.benytech.motechi`.
2. Configure the Apple provider in **Supabase Dashboard -> Authentication -> Providers -> Apple**.
3. Add the Apple Services ID, Team ID, Key ID, and private key in Supabase only.
4. Do not put Apple private keys or secrets in the mobile app.

For local testing, use a development build because custom scheme callbacks such as `motechi://auth/callback` are not reliable in plain Expo Go.

## Run Locally

Install and start the Expo app:

```bash
npm install
npm start
```

Start the backend:

```bash
cd motech-backend
npm install
npm start
```

Start the admin dashboard:

```bash
cd motech-admin
npm install
npm run dev
```

## Security Note

The current admin dashboard talks to Supabase directly from the browser with the anon key, so the migration includes permissive policies for admin dashboard reads/uploads. For production, move admin operations behind server-side API routes that use the Supabase service role key, then tighten the anon policies.

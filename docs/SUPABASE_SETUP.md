# Supabase setup — switch live site from Excel to Postgres

## Overview

- **Local dev (no Supabase keys):** uses `data/celebrity-site.xlsx`
- **Production (Vercel + Supabase keys):** uses Supabase Postgres automatically

---

## Step 1 — Database schema (done if tables exist)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/tbydbcyroaliseawdsgc/sql)
2. Open `supabase/migrations/002_production_schema.sql` in your project folder
3. Copy **all SQL inside the file** (not the filename) and click **Run**

Or ask Cursor (with Supabase MCP connected) to apply the migration.

---

## Step 2 — Get Supabase credentials

1. Supabase Dashboard → **Project Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service role key in client-side code or git.

---

## Step 3 — Import existing Excel data (optional)

If you have fans/data in `data/celebrity-site.xlsx`:

1. Create `.env.local` from `.env.local.example`
2. Add your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Run:

```powershell
npm run migrate:supabase
```

---

## Step 4 — Configure Vercel

1. [Vercel Dashboard](https://vercel.com) → your project → **Settings** → **Environment Variables**
2. Add for **Production** (and Preview if you want):

| Name | Value |
|------|--------|
| `SUPABASE_URL` | `https://tbydbcyroaliseawdsgc.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `SESSION_SECRET` | long random string |
| `NEXT_PUBLIC_SITE_URL` | your live URL (e.g. `https://your-site.vercel.app`) |

3. **Redeploy** (Deployments → ⋯ → Redeploy)

---

## Step 5 — Verify live signup

1. Open your live site → **Sign up**
2. Create a test account
3. In Supabase → **Table Editor** → `app_users` — confirm the new row appears

---

## Default test accounts (after migrate)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@keanu.fan | admin123 |
| Fan | fan@example.com | fan123 |

Change the admin email/password in Supabase after going live.

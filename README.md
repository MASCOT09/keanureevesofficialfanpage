# Celebrity Fan Site

An immersive fan-engagement website built with **Next.js**, **React Three Fiber**, and **Supabase**.

## Features

- Cinematic 5–7 second video intro with 3D camera animation (mobile fallback)
- Fan authentication (sign up / log in)
- Giveaways with one entry per user
- Meet & Greet registration with capacity limits and waitlist
- Communities linking to external groups
- Private DM links (WhatsApp, Zangi, Telegram)
- Admin dashboard to manage all content

---

## Node.js — install later (placeholder)

> **Current status: Pending** — The website code is complete. Node.js setup is deferred until installation finishes on your machine.

**When Node is ready**, follow: **[docs/NODE_SETUP.md](docs/NODE_SETUP.md)**

Quick version:
```powershell
cd "c:\Users\DELL PC\Desktop\Website"
npm install
copy .env.local.example .env.local
npm run dev
```

Until then, all pages use **demo content** so the UI can be reviewed once the dev server runs.

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/) — see placeholder above
- A [Supabase](https://supabase.com) project

## Setup (after Node is installed)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
copy .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Find your URL and anon key in Supabase → Project Settings → API.

### 3. Run the database migration

In Supabase Dashboard → SQL Editor, paste and run:

```
supabase/migrations/001_initial_schema.sql
```

### 4. Create your first admin

1. Sign up on the site at `/signup`
2. In Supabase → SQL Editor, run:

```sql
UPDATE profiles SET role = 'admin' WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Hero video

1. Upload your intro MP4 to Supabase Storage (create a public `media` bucket)
2. In Admin → Site Settings, paste the public URL as **Hero Video URL**

Recommended: 1920×1080, H.264, under 15MB.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the same environment variables from `.env.local`
4. Deploy

## Project structure

```
src/
├── app/                  # Pages and routes
│   ├── admin/            # Admin dashboard
│   ├── giveaways/        # Giveaway pages
│   ├── meet-and-greet/   # Meet & greet pages
│   ├── communities/      # Community links
│   └── contact/          # Private DM links
├── components/           # React components
│   ├── intro/            # 3D video intro
│   └── admin/            # Admin UI
└── lib/                  # Supabase clients, auth helpers
docs/
└── NODE_SETUP.md         # Node.js placeholder — complete when ready
supabase/
└── migrations/           # Database schema + RLS
```

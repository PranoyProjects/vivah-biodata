# Vivah — Matrimonial Biodata Builder

React (Vite) + Supabase (email sign-in + Postgres with Row Level Security). Deploys free on Vercel.

## Features
- Email magic-link sign-in (no passwords)
- Create / edit / delete your biodata (9-step wizard, religion-specific fields)
- Save profiles into private collections (Instagram-style)
- Browse, filter, compare up to 3, print to PDF
- Contact details stored privately; member profiles visible only to signed-in users

## Setup
1. Supabase: create project → SQL Editor → run `supabase/schema.sql`.
2. Supabase → Project Settings → API: copy Project URL and anon public key.
3. Local: `cp .env.example .env.local`, fill both values, `npm install`, `npm run dev`.
4. Vercel: import the GitHub repo, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars, deploy.
5. Supabase → Authentication → URL Configuration: set Site URL to your Vercel URL and add it to Redirect URLs.

The anon key is safe in the browser: access is enforced by RLS policies in `schema.sql`.

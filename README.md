# CipherGuard — Angular + Supabase + Express

## Stack
- **Frontend**: Angular 17 (standalone components, signals, lazy loading)
- **Styling**: Tailwind CSS
- **Auth + DB**: Supabase (GitHub OAuth + Postgres + RLS)
- **Backend API**: Express.js (Stripe billing, webhooks)
- **Scan engine**: TypeScript, runs in browser (zero API calls for scanning)

## Setup

### 1. Fill in environment files

**Angular** — edit `src/environments/environment.ts`:
```
supabaseUrl: 'YOUR_SUPABASE_URL'
supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
apiUrl: 'http://localhost:3001'  (dev) / your Railway URL (prod)
```

**Express** — edit `.env`:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### 2. Supabase setup
- Create project at supabase.com
- SQL Editor → paste `supabase/migrations/001_schema.sql` → Run
- Authentication → Providers → GitHub → enable → paste Client ID + Secret
- GitHub OAuth callback URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`

### 3. Install + run

```bash
# Angular frontend
npm install
npm start  # → http://localhost:4200

# Express backend (new terminal)
cd server && npm install && npm run dev  # → http://localhost:3001
```

### 4. Deploy

**Angular → Vercel**
- Import GitHub repo → Vercel detects Angular via vercel.json
- No extra env vars needed (Supabase keys are in environment.prod.ts)

**Express → Railway**
- New project → Deploy from GitHub repo
- Set ROOT DIRECTORY = server
- Add env vars from .env

## File structure
```
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts          ← providers
│   │   ├── app.routes.ts          ← lazy routes
│   │   ├── core/
│   │   │   ├── guards/auth.guard.ts
│   │   │   ├── models/index.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts    ← signals-based auth
│   │   │       ├── scan.service.ts    ← VULN_DB + scanner
│   │   │       └── supabase.service.ts
│   │   ├── features/
│   │   │   ├── home/              ← landing page
│   │   │   ├── auth/login/        ← GitHub + magic link
│   │   │   ├── dashboard/         ← stats + recent scans
│   │   │   ├── scan/              ← core scanner UI
│   │   │   ├── billing/           ← Stripe plans
│   │   │   └── settings/
│   │   └── shared/layout/shell/   ← sidebar + nav
│   ├── environments/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── server/                        ← Express API
│   ├── index.js
│   └── routes/stripe.js
├── supabase/migrations/001_schema.sql
├── angular.json
├── vercel.json
└── tailwind.config.js
```

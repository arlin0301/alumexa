# Alumexa — Deployment Guide

This guide covers three deployment options for Alumexa:

| Option | Best For | Cost |
|---|---|---|
| **Option A — Render + Vercel** | Live demo, shareable link | Free tier |
| **Option B — Docker (local)** | Internal demo, no internet needed | Free |
| **Option C — Railway** | Alternative to Render | Free tier |

---

## Before You Start — Prerequisites

1. Your code pushed to a **GitHub repository**
2. Node.js v18+ installed locally
3. Accounts on [render.com](https://render.com) and [vercel.com](https://vercel.com) (both free)

---

## Option A — Render (Backend) + Vercel (Frontend) ✅ Recommended

This is the simplest and most reliable option for a live demo link.

---

### Step 1 — Push Code to GitHub

```bash
# If not already a git repo
cd alumexa
git init
git add .
git commit -m "Alumexa Phase 1"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/alumexa.git
git push -u origin main
```

---

### Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy` |
| **Start Command** | `npm start` |

4. Add a **Persistent Disk** (this keeps your SQLite database alive between restarts):
   - Go to your service → **Disks** → **Add Disk**
   - Name: `alumexa-data`
   - Mount Path: `/var/data`
   - Size: `1 GB` (free tier allows this)

5. Set **Environment Variables** (in Render dashboard → Environment):

```
DATABASE_URL        = file:/var/data/alumexa.db
JWT_SECRET          = (generate one — see below)
PORT                = 5000
NODE_ENV            = production
SUPER_ADMIN_EMAIL   = superadmin@alumexa.com
SUPER_ADMIN_USERNAME = superadmin
SUPER_ADMIN_PASSWORD = YourStrongPassword123!
```

> **Generate JWT_SECRET:**
> Run this in your terminal and copy the output:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

6. Click **Deploy** — wait ~3 minutes for the first build.

7. Once deployed, note your backend URL:
   ```
   https://alumexa-backend.onrender.com
   ```

8. **Seed the Super Admin** — open Render's Shell tab and run:
   ```bash
   node prisma/seed.js
   ```

---

### Step 3 — Deploy Frontend on Vercel

1. Copy the Vercel config into your frontend folder:
   ```bash
   cp deployment/vercel/vercel.json frontend/vercel.json
   ```

2. Open `frontend/vercel.json` and replace the backend URL:
   ```json
   "destination": "https://YOUR-ACTUAL-BACKEND.onrender.com/api/:path*"
   ```

3. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

4. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

5. Add **Environment Variable**:
   ```
   VITE_API_URL = /api
   ```

6. Click **Deploy** — done in ~1 minute.

7. Your live URL:
   ```
   https://alumexa.vercel.app
   ```

---

### Step 4 — Test the Deployment

Open your Vercel URL and log in with:
- Email: `superadmin@alumexa.com`
- Password: `YourStrongPassword123!`

If login works, the backend is connected. Then:
1. Create a department
2. Create a staff admin
3. Open an incognito tab → register as alumni → verify the flow

---

### Important — File Uploads on Render

Uploaded proof documents are stored in `backend/uploads/`. On Render with a persistent disk mounted at `/var/data`, update the uploads path in `backend/src/middleware/upload.js`:

```js
// Change this line:
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// To this (for Render persistent disk):
const UPLOADS_DIR = process.env.NODE_ENV === 'production'
  ? '/var/data/uploads'
  : path.join(__dirname, '../../uploads');
```

And in `backend/src/controllers/proofController.js`, update the same:
```js
const UPLOADS_DIR = process.env.NODE_ENV === 'production'
  ? '/var/data/uploads'
  : path.join(__dirname, '../../uploads');
```

Also update `backend/src/server.js` static file serving:
```js
const UPLOADS_DIR = process.env.NODE_ENV === 'production'
  ? '/var/data/uploads'
  : path.join(__dirname, '../uploads');

app.use('/uploads', express.static(UPLOADS_DIR));
```

---

## Option B — Docker (Local / No Internet)

Use this when you want a fully self-contained local demo that doesn't need internet.

### Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed

### Steps

1. Build and start all containers:
   ```bash
   cd deployment/docker
   docker-compose up --build
   ```

2. First run — seed the Super Admin:
   ```bash
   docker-compose exec backend node prisma/seed.js
   ```

3. Open your browser:
   ```
   http://localhost
   ```

4. To stop:
   ```bash
   docker-compose down
   ```

5. To stop and wipe all data:
   ```bash
   docker-compose down -v
   ```

> Data is stored in Docker named volumes (`alumexa_data`, `alumexa_uploads`) and
> persists between `docker-compose up/down` unless you use `-v`.

---

## Option C — Railway (Alternative to Render)

Railway is slightly easier to set up but has less generous free tier limits.

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select your repo → set root directory to `backend`
3. Set the same environment variables as Option A
4. Railway automatically detects Node.js — no extra config needed
5. For the database, Railway offers a managed PostgreSQL free tier — to use it:
   - Add a **PostgreSQL** plugin to your project
   - Copy the `DATABASE_URL` Railway generates
   - Change `provider = "sqlite"` to `provider = "postgresql"` in `backend/prisma/schema.prisma`
   - Run `npx prisma migrate deploy`

---

## Switching from SQLite to PostgreSQL (Optional — for Production)

SQLite is great for demos. For a permanently hosted system, switch to PostgreSQL:

1. Change `schema.prisma`:
   ```diff
   datasource db {
   - provider = "sqlite"
   + provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Get a free PostgreSQL database from:
   - [Supabase](https://supabase.com) — free 500MB
   - [Neon](https://neon.tech) — free 3GB
   - [Railway](https://railway.app) — free tier
   - Render PostgreSQL (free 90 days)

3. Set `DATABASE_URL` to the PostgreSQL connection string

4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```

> No application code changes needed — Prisma abstracts the database difference.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Backend 500 on first deploy | Run `npx prisma migrate deploy` in Render shell |
| Login works but file upload fails | Check `UPLOADS_DIR` path is writable |
| Frontend shows blank page | Check `vercel.json` has correct backend URL |
| "Cannot connect to database" | Verify `DATABASE_URL` env var is set |
| Render service sleeps (free tier) | Render free tier sleeps after 15 min inactivity — first request after sleep takes ~30s |
| Alumni can login before verification | Expected — blocked in `authController.js` at login |

---

## Security Checklist Before Going Live

- [ ] Change `SUPER_ADMIN_PASSWORD` from default
- [ ] Use a cryptographically random `JWT_SECRET` (64+ chars)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (automatic on Render and Vercel)
- [ ] Review CORS settings in `backend/src/server.js` if needed

---

## Quick Reference — URLs After Deployment

| Service | URL |
|---|---|
| Frontend (Vercel) | `https://alumexa.vercel.app` |
| Backend API (Render) | `https://alumexa-backend.onrender.com` |
| API Health Check | `https://alumexa-backend.onrender.com/api/health` |
| Local Docker | `http://localhost` |

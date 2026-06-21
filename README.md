# Alumexa — Alumni Registry & Verification (Phase 1)

Alumexa is a college alumni management platform connecting **Alumni, Students, Staff
Admins, and a Super Admin** through a centralized, verified alumni database.

This is the **Phase 1 MVP**, built from scratch with a simple, demo-friendly stack.

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide icons
- **Backend:** Node.js + Express, Prisma ORM, JWT auth, bcrypt
- **Database:** SQLite (file-based — zero setup)

---

## 📁 Project Structure

```text
alumexa/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Database models
│   │   └── seed.js         # Seeds ONLY the Super Admin account
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── utils/
│       └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        │   ├── super-admin/
        │   ├── staff-admin/
        │   ├── alumni/
        │   └── student/
        └── utils/
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # then set a real JWT_SECRET
npx prisma migrate dev --name init
npm run seed                # creates the Super Admin account only
npm run dev                 # starts on http://localhost:5000
```

To seed the app with demo data for full workflow validation (3 departments, staff admins, alumni, and students):

```bash
npm run seed:demo
```

**Demo Accounts (seed:demo)**

Only for local testing — change these passwords before sharing or deploying.

| Role | Email / Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | superadmin@alumexa.com / superadmin | ChangeMe123! |
| Computer Science Staff Admin | cs_admin@alumexa.com / csadmin | CsAdmin123! |
| Electronics & Communication Staff Admin | ec_admin@alumexa.com / ecadmin | EcAdmin123! |
| Mechanical Engineering Staff Admin | me_admin@alumexa.com / meadmin | MeAdmin123! |
| Alumni — Aarav Sharma | aarav.sharma@example.com / aarav.sharma | Alumni123! |
| Alumni — Meera Nair | meera.nair@example.com / meera.nair | Alumni123! |
| Alumni — Rohit Singh | rohit.singh@example.com / rohit.singh | Alumni123! |
| Student — Nisha Patel | nisha.patel@student.alumexa.com / nisha.patel | Student123! |
| Student — Vikram Rao | vikram.rao@student.alumexa.com / vikram.rao | Student123! |

Note: you can log in with either the email or username. Super Admin credentials are also configurable via `backend/.env`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

---

## 🔑 Seeded Login

Only **one account** is seeded — the Super Admin (credentials come from `backend/.env`):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@alumexa.com` | `ChangeMe123!` |

> ⚠️ Change these values in `backend/.env` before any shared/public deployment.

No departments, staff admins, alumni, or students are pre-seeded. Everything else
is created live through the application:

- **Super Admin** creates Departments and Staff Admin accounts
- **Alumni / Students** self-register
- **Staff Admins** verify alumni submissions

## 🔄 Reset to Super Admin Only

To reset the local dev database and keep only the seeded Super Admin account:

```bash
cd backend
rm -f dev.db
rm -f uploads/*
npx prisma migrate reset --force
npm run seed
```

If `uploads/` contains a `.gitkeep` file, keep it in place.

If you are on Windows PowerShell:

```powershell
cd backend
Remove-Item .\dev.db -Force
Get-ChildItem .\uploads | Where-Object { -not $_.PSIsContainer -and $_.Name -ne '.gitkeep' } | Remove-Item -Force
npx prisma migrate reset --force
npm run seed
```

---

## 🎬 Phase 1 Demo Script

1. **Super Admin** logs in (`superadmin@alumexa.com`) and:
   - Creates a Department (e.g. "Computer Science")
   - Creates a Staff Admin account assigned to that department
   - Views the empty College Dashboard

2. **Alumni** registers via the public registration form:
   - Fills in personal details, contact info, current status (e.g. Working)
   - Sets login credentials
   - Sees status: 🟡 **Pending Verification**

3. **Staff Admin** logs in:
   - Sees the new alumni record under **Pending Verification**
   - Reviews details and clicks **Approve**

4. **Alumni** logs in (now that they're verified):
   - Adds Career Journey entries, Skills, Social Links
   - Sets Mentorship preferences and Profile Visibility to **Public**

5. **Student** registers and logs in:
   - Uses **Find Alumni** to search by department/batch/status/mentor availability
   - Opens the alumni's profile card to view public details
   - Goes to **Smart Mentor Match**, enters a career interest (e.g. "Software Engineering"),
     and gets the top 3 suggested alumni mentors — scored by department overlap,
     keyword overlap with the alumni's role/organization/skills, and mentor availability

6. **Super Admin / Staff Admin** dashboards now show updated stats:
   - Alumni by Department, Alumni by Batch, Career Status Distribution,
     Employment Sector Distribution, Active Mentors
   - Export buttons download CSV reports
   - New: multi-sheet Excel export (.xlsx) for richer reports (Master data, Working, Higher Education, Entrepreneurs, Exam Prep, Other Activities, Employment Details, Higher Ed Details, Proof Documents, Summary, Proof Files)
     - Super Admin: `GET /api/super-admin/export/excel` → `all-departments-alumni-<date>.xlsx`
     - Staff Admin: `GET /api/staff-admin/export/excel` → `<Department>-alumni-<date>.xlsx`
     - Frontend exposes "Export as Excel" buttons on the Super Admin and Staff Admin alumni pages.

---

## ⭐ Features

### Authentication & roles
- Role-based login for:
  - `SUPER_ADMIN`
  - `STAFF_ADMIN`
  - `ALUMNI`
  - `STUDENT`
- JWT authentication with protected API routes
- Super Admin and Staff Admin can change username and password via account settings

### Super Admin
- Create and manage Departments
- Create, edit, activate/deactivate, reset password, and delete Staff Admins
- View all alumni and students across the college
- Search and filter alumni by department, batch, status, and text search
- View full alumni profiles with career entries, skills, proof documents, and public links
- Export CSV and multi-sheet Excel reports for the entire college

### Staff Admin
- Approve or reject pending alumni registrations in their department
- View department alumni roster and filters
- Export department alumni data as CSV or multi-sheet Excel
- View full alumni profiles and proof documents for department alumni
- Download proof documents via authenticated staff routes

### Alumni
- Registration and profile submission
- Upload proof documents with document type validation
- Add career journey entries, skills, and public social links
- Set mentorship preferences and profile visibility
- Track verification status and upload additional proofs

### Student
- Register and login as a student
- Search verified alumni by department, batch, current status, and mentor availability
- View alumni public profiles and contact details
- Use Smart Mentor Match to find top alumni mentors based on interest keywords

### Data export and reporting
- CSV exports for alumni, students, mentors, pending verifications, and more
- Multi-sheet Excel exports with comprehensive worksheets and proof file tracking
- Proof files included in reports via protected download links

### Deployment / uploads
- Local SQLite database for zero-setup development
- Production-ready upload support with mounted uploads directory
- Docker compose and Render configs include upload persistence

---

## ✨ Phase 1+ — Smart Mentor Match

A lightweight, no-ML "AI hook": students enter a career interest, and the backend
scores verified+public alumni using simple rules:

- **+2** if the alumni's department matches the student's department
- **+2 per matched keyword** between the student's career interest and the alumni's
  sector / organization / designation / institution / exam / activity / skills
- **+1** if the alumni has any mentorship preference enabled

The top 3 highest-scoring alumni are returned with human-readable "why this match"
reasons, shown as mentor cards on the **Smart Mentor Match** page.

---

## ⚠️ Known Limitations (Phase 1)

- Document/proof uploads: implemented (file upload via multer, stored under the uploads directory). Proof files are downloadable and included in exports.
- Real-time (Socket.IO) notifications are deferred to a later phase.
- Exports: CSV and multi-sheet Excel exports are available. Use the Excel export for complete, formatted workbooks.

### Deployment notes for uploads (containers)

- In production the backend uses `/var/data/uploads` as the uploads directory. The provided Docker configuration mounts the uploads volume to that path.
   - See `deployment/docker/Dockerfile.backend` and `deployment/docker/docker-compose.yml` (uploads volume mounts to `/var/data/uploads`).
   - When running locally in dev mode the uploads folder is `uploads/` at the repository root.

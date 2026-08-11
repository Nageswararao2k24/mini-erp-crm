# NOVA — Mini ERP + CRM Operations Portal

A production-oriented wholesale/distribution operations portal built to the requested stack: Node.js + TypeScript + Express, PostgreSQL + `pg` raw SQL, JWT + bcrypt, Zod, React + Vite + TypeScript, React Router and Axios. The design uses a responsive dark operations sidebar, clean KPI cards, searchable tables, low-stock control and role-aware navigation.

## Free deployment
- Database: Neon or Supabase Postgres free tier.
- Backend: Render free web service (or Railway if a free allowance is available on your account).
- Frontend: Vercel or Netlify free tier.
- No AWS or paid-only dependency is required.

## Local setup

### 1. Database
Create a PostgreSQL database, then run:

```bash
psql "$DATABASE_URL" -f backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend defaults to `http://localhost:5000`.

Demo accounts:
- Admin: `admin@nova.local` / `Admin@123`
- Sales: `sales@nova.local` / `Sales@123`
- Warehouse: `warehouse@nova.local` / `Warehouse@123`
- Accounts: `accounts@nova.local` / `Accounts@123`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:5000/api` locally.

## Render backend
1. Create a PostgreSQL database on Neon.
2. Run `backend/db/schema.sql` against Neon.
3. Create a Render Web Service from this repository.
4. Root directory: `backend`.
5. Build command: `npm install && npm run build`.
6. Start command: `npm start`.
7. Environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.
8. Run the seed once with `npm run seed` using the service shell or locally against the same Neon URL.

## Vercel frontend
1. Import the repository.
2. Root directory: `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set `VITE_API_URL` to your deployed backend API base, e.g. `https://your-api.onrender.com/api`.

## Included functionality
- JWT login and role-aware UI.
- Customer CRM with append-only follow-up history.
- Product inventory and low-stock queue.
- Challan drafts and confirmation.
- Transaction-safe stock deduction using `BEGIN/COMMIT/ROLLBACK` and `SELECT ... FOR UPDATE`.
- Product name/price snapshots on challan lines.
- Quick reorder endpoint.
- Invoice creation and PDF export.
- Admin user/status/role management endpoints and audit endpoint.
- Global search endpoint.
- Pagination/search contracts on list endpoints.
- Responsive tablet-friendly UI.

## API response convention
List endpoints return `{ data, total, page, limit }`.
All protected routes use `Authorization: Bearer <JWT>`.

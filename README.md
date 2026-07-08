# Rotary Club of Kitende Breeze Registration + Attendance

Next.js registration frontend for weekly fellowship and event check-ins.

## Features

- First-time guest registration.
- Returning guest lookup by email or phone.
- Daily attendance admin dashboard.
- Admin password protection with an HttpOnly signed session cookie.
- Attendance search by name, phone, email, club, classification, purpose, or event.
- Paginated admin tables with mobile attendance cards.
- CSV export for the selected date and current search filter.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## Required environment variables

```bash
REGISTRATION_API_URL=http://your-backend-domain/api/register
ADMIN_PASSWORD=change-this-strong-admin-password
ADMIN_SESSION_SECRET=change-this-long-random-secret
```

Optional:

```bash
REGISTRATION_LOOKUP_API_URL=http://your-backend-domain/api/visitors/lookup
REGISTRATION_ATTENDANCE_API_URL=http://your-backend-domain/api/attendance
ADMIN_SESSION_HOURS=8
ADMIN_API_KEY=change-this-shared-backend-admin-key
```

`ADMIN_API_KEY` should match the Go backend `ADMIN_API_KEY` if you enable direct backend protection for `/api/attendance`.


## Admin session fix notes

This version fixes immediate logout after sign-in by setting the admin cookie based on the actual request protocol instead of blindly forcing `Secure` whenever `NODE_ENV=production`. That matters when the production build is tested over plain HTTP or behind a proxy.

It also forces dynamic/no-store handling for admin pages and admin API routes so cached redirects do not send a valid session back to `/admin/login`.

The `Permissions-Policy: browsing-topics` browser warning is not an auth error. A `next.config.js` header override is included to avoid emitting that unsupported directive from the app.

## Admin

Open `/admin`. Unauthenticated users are redirected to `/admin/login`.

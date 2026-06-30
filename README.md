# Rotary Club of Kitende Breeze Guest Registration

A single-page Next.js registration app for the Rotary Club of Kitende Breeze Presidential Installation event.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Notes

- No backend or database is used.
- Form submissions are stored in React state for the current session and logged to the browser console as JSON.
- The splash screen uses `sessionStorage` so it only appears once per browser tab session.
- Mobile devices auto-scroll to the form after the hero has been displayed.

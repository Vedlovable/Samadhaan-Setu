## Samadhaan Setu (Frontend)

A responsive civic issue reporting interface rebuilt with Next.js App Router, TailwindCSS, shadcn/ui, and Framer Motion. Includes citizen login, dashboard, issue reporting, and an admin panel with filters and status management — all powered by dummy in-memory/JSON data.

### Quick Start

1) Install dependencies

```
npm install
```

2) Run the dev server

```
npm run dev
```

3) Open the app

- http://localhost:3000
- You will be redirected to the login page.

### Demo Credentials

- Citizen
  - Email: `citizen@demo.dev`
  - Password: `123456`
- Admin
  - Email: `admin@demo.dev`
  - Password: `admin123`

### Routes

- `/login` – Dual-tab login for Citizen/Admin with demo credentials section
- `/dashboard` – Personalized greeting, stat cards, and tabbed issue list (All, Mine, Open, In Progress, Resolved)
- `/report` – Issue submission form (title, category, priority, location, description, photo placeholder)
- `/admin` – Admin console with colorful stats, filtering (search, status, category), and issue table with status badges

### Tech Stack

- Next.js 15 (App Router) + React 19
- TailwindCSS v4
- shadcn/ui components (Radix + Tailwind)
- Framer Motion for animations

### Data & State

- Authentication is mocked via a simple context provider in `src/context/AuthContext.tsx`
- Demo users are hard-coded
- Issues are read from `src/data/issues.json`

### Project Structure

- `src/app/` – App Router pages (login, dashboard, report, admin)
- `src/components/` – Reusable components (layout, UI helpers)
- `src/components/ui/` – shadcn/ui primitives
- `src/context/` – Auth context
- `src/data/` – Dummy JSON data

### Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm start` – Run production server

### Notes

- This frontend uses mock data only; there is no backend integration.
- Replace dummy JSON/context with real APIs later and keep the same component structure.
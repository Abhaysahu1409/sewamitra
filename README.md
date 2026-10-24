# Sewamitra — Cooperative Gig Services Platform

**SIH26089 — Smart India Hackathon**

> Building a Stronger Community.

Sewamitra connects customers who need household & community services with local workers who provide them — plumbing, electrical, cleaning, carpentry, painting, gardening, and driving. Built as a cooperative platform with wallet payments, ID verification, ratings, group bookings, an AI voice assistant, and multilingual support.

---

## Features

- **Customer & Worker Registration/Login** — Email/password auth with role selection (customer, worker, admin)
- **Worker Profiles** — Skills, experience, location, hourly rate, bio, and ID verification status
- **Search & Find Nearby Workers** — Filter by service, city, max rate; sort by rating, price, or experience
- **Book Individual or Group Services** — Schedule date/time, address, notes, multi-worker group bookings
- **Ratings & Reviews** — Star ratings + comments after job completion, aggregated on worker profiles
- **Service Pricing & Wallet** — In-app wallet with top-ups, payments, and earnings tracking
- **Job Status Tracking** — pending → accepted → in_progress → completed (or cancelled)
- **Booking History** — Full history with status filters for both customers and workers
- **Admin Dashboard** — Overview stats, worker verification, booking management, user management
- **AI Voice Assistant** — Web Speech API powered chatbot with voice input and text-to-speech
- **Multilingual Support** — English, Hindi, Marathi, Tamil, Telugu, Bengali
- **Responsive Design** — Mobile-first, works across all viewport sizes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Database | PostgreSQL with Row Level Security |
| Voice | Web Speech API (SpeechRecognition + SpeechSynthesis) |

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (already provisioned in this Bolt environment)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env` file is pre-populated with Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If running outside Bolt, create a Supabase project at [supabase.com](https://supabase.com) and add these values to a `.env` file in the project root.

### 3. Database Setup

The database schema is applied automatically via Supabase MCP migrations. The migration creates these tables:

- `profiles` — user profiles with role (customer/worker/admin)
- `worker_details` — worker skills, experience, rates, verification status
- `bookings` — service bookings with status tracking
- `reviews` — customer ratings and comments
- `transactions` — wallet ledger entries
- `wallets` — per-user wallet balance

All tables have Row Level Security (RLS) enabled with appropriate policies.

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at the local development URL shown in your terminal.

### 5. Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

### 6. Type Check

```bash
npm run typecheck
```

---

## Demo / Simulated Features

The following features are clearly marked as simulated in the UI:

- **Sample Workers**: When no workers are registered in the database, the search page displays 8 sample worker profiles with realistic data (clearly labeled "Demo Mode").
- **Sample Reviews**: Worker detail pages show sample reviews when no real reviews exist.
- **Wallet Top-up**: The wallet top-up is simulated — no real payment gateway is integrated. A banner states "Simulated Payment."
- **Platform Fee**: Workers keep 85% of each job; 15% goes to the platform cooperative fund.
- **AI Voice Assistant**: Uses the browser's Web Speech API. Voice recognition may not work in all browsers (best in Chrome). Text input always works as fallback.

---

## Creating an Admin Account

To access the admin dashboard, you need an admin profile. After signing up normally:

1. Sign up with any email as a customer or worker
2. In the Supabase dashboard, run this SQL to promote your account to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

3. Log out and log back in — you'll see the Admin Panel in the navigation.

---

## Project Structure

```
src/
├── components/         # Shared UI components
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── ui.tsx          # Reusable UI primitives (Button, Card, Modal, etc.)
│   ├── VoiceAssistant.tsx
│   └── WorkerCard.tsx
├── lib/                # Core infrastructure
│   ├── auth.tsx        # Auth context + Supabase integration
│   ├── format.ts       # Currency, date, status formatting
│   ├── i18n.tsx        # Multilingual support (6 languages)
│   ├── router.tsx      # Hash-based router
│   ├── serviceIcons.tsx
│   └── supabase.ts     # Supabase client + TypeScript types
├── pages/              # Application pages
│   ├── AdminPage.tsx
│   ├── AuthPages.tsx   # Login + Signup
│   ├── BookingsPage.tsx
│   ├── LandingPage.tsx
│   ├── ProfilePage.tsx
│   ├── SearchPage.tsx
│   ├── WalletPage.tsx
│   ├── WorkerDashboardPage.tsx
│   └── WorkerDetailPage.tsx
├── App.tsx             # App root with routing
├── main.tsx            # Entry point
└── index.css           # Tailwind imports
```

---

## GitHub Upload Instructions

### 1. Initialize a Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Sewamitra - Cooperative Gig Services Platform"
```

### 2. Create a Repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Name it `sewamitra` (or any name you prefer)
4. Set it to **Public** or **Private**
5. Do NOT check "Add a README" (we already have one)
6. Click **Create repository**

### 3. Push Your Code

Copy the commands GitHub shows you, which look like:

```bash
git remote add origin https://github.com/your-username/sewamitra.git
git branch -M main
git push -u origin main
```

### 4. Verify

Refresh your GitHub repository page — all files should now be visible.

---

## Important Notes for SIH Demonstration

1. **Sign up as a customer** to search and book workers
2. **Sign up as a worker** (separate email) to create a worker profile and receive jobs
3. **Top up your wallet** before booking (wallet page → Add Money)
4. **As a worker**, accept jobs → start → complete to earn money
5. **As a customer**, leave reviews after job completion
6. **Promote an account to admin** (see instructions above) to access the admin dashboard
7. **Try the voice assistant** — click the mic icon in the bottom-right corner
8. **Switch languages** — use the globe icon in the header

---

## License

This project is built for the Smart India Hackathon (SIH26089).

© 2026 Sewamitra. Building a Stronger Community.

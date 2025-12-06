# Medical Appointment Manager

AI-Powered Appointment Confirmation System built with Next.js, Supabase, and OpenAI.

## Features

- 📅 **Interactive Calendar** - View appointments in month, week, or day view
- 🤖 **AI Mock Calls** - Simulate phone calls with AI-powered conversation
- 💬 **Real-time Updates** - Instant synchronization across all clients
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Calendar**: React Big Calendar
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 (with mock fallback)
- **Animations**: Framer Motion

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor and run `src/lib/supabase/schema.sql`
4. Get credentials from Settings > API

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key  # Optional
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

- Click appointments to view details
- Click "Call Patient" to start mock call
- Type responses to AI assistant
- Appointments update automatically in real-time

## Documentation

- See `SETUP.md` for detailed setup instructions
- Check `src/lib/supabase/schema.sql` for database schema
- Review component files for implementation details

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Core logic (Supabase, AI)
└── types/            # TypeScript types
```

## License

MIT

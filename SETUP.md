# Quick Setup Guide

## Prerequisites
- Node.js 18+
- Supabase account (free)
- OpenAI API key (optional)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Set project name and database password
4. Wait for initialization (~2 minutes)

### Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `src/lib/supabase/schema.sql`
4. Paste and click "Run"
5. Verify 15 rows inserted

### Get API Credentials

1. Go to **Settings** > **API**
2. Copy:
   - Project URL
   - anon public key

## Step 3: Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-key  # Optional
```

## Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing

1. Click any "Call Patient" button
2. Type responses:
   - "yes" → Confirms appointment
   - "cancel" → Cancels appointment
   - "reschedule" → Marks for rescheduling

## Troubleshooting

### Appointments not showing
- Check `.env.local` exists
- Verify Supabase credentials
- Check browser console for errors

### Build fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Deployment

```bash
npm run build
vercel deploy
```

Add environment variables in hosting dashboard.

---

**Setup time:** 10-15 minutes

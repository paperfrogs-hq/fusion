# Fusion Waitlist Setup Guide

## 🎯 What's New

- Clicking "Join Waitlist" button scrolls to the early access signup form
- Email collection integrated with Supabase database
- Automated confirmation emails (optional - requires setup)

---

## 🔧 Configuration

### 1. Supabase Database Setup

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click **SQL Editor** on the left sidebar
3. Click **New Query**

**⚠️ IMPORTANT: Run these SQL commands in the order below:**

**Step 1: Create the table (run this first)**

```sql
-- Create the early_access_signups table
CREATE TABLE IF NOT EXISTS early_access_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_early_access_email ON early_access_signups(email);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_early_access_created ON early_access_signups(created_at DESC);
```

**Step 2: Enable RLS and policies (run after Step 1 completes)**

```sql
-- Enable Row Level Security (RLS) for security
ALTER TABLE early_access_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their own email (for signup)
CREATE POLICY "Anyone can insert their email" ON early_access_signups
  FOR INSERT
  WITH CHECK (TRUE);

-- Allow anyone to select their own email
CREATE POLICY "Users can view their own email" ON early_access_signups
  FOR SELECT
  USING (TRUE);
```

**Step 3: Create the update trigger (run after Step 2 completes)**

```sql
-- Create a trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_early_access_signups_updated_at
  BEFORE UPDATE ON early_access_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**OR run all at once:** If you copy-paste all three sections together in one query, it will work fine!

#### Option B: Manual Setup (if SQL doesn't work)

Make sure you have the `early_access_signups` table in Supabase with these columns:

- `id` (UUID, primary key)
- `email` (TEXT, unique)
- `confirmed` (BOOLEAN, default false)
- `created_at` (TIMESTAMP, auto-generated)
- `updated_at` (TIMESTAMP, auto-updated)

### 2. Environment Variables

Your `.env` file should contain:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📧 Email Confirmation (Optional)

### Option A: Deploy Supabase Edge Function (Recommended)

1. **Install Supabase CLI:**

   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**

   ```bash
   supabase login
   ```

3. **Link your project:**

   ```bash
   supabase link --project-ref your_project_ref
   ```

4. **Deploy the function:**

   ```bash
   supabase functions deploy send-confirmation-email
   ```

5. **Add email service (SendGrid example):**

   ```bash
   supabase secrets set SENDGRID_API_KEY=your_api_key
   ```

6. **Update the function code** in `supabase/functions/send-confirmation-email/index.ts` to use SendGrid or your preferred email service.

### Option B: Use Third-Party Email Service

Update `supabase-client.ts` to call your own API endpoint instead of Supabase Edge Function:

```typescript
const response = await fetch("/api/send-email", {
  method: "POST",
  body: JSON.stringify({ email, confirmationUrl }),
});
```

### Option C: Do Nothing for Now

The current setup will:

- ✅ Save emails to Supabase database
- ✅ Show success message to users
- ⚠️ Not send automated emails (but you can manually send them or set up email later)

---

## 🚀 Testing

1. Fill in email and click "Get Access"
2. Check Supabase database: the email should appear in `early_access_signups` table
3. If Edge Function is deployed: check your email for confirmation message
4. If using third-party service: verify email is received

---

## 📋 Next Steps

1. **Set up email service** (SendGrid, Resend, AWS SES, etc.)
2. **Configure SMTP or API credentials** in Supabase secrets or environment
3. **Test with yourself** before going live
4. **Monitor email deliverability** after launch

---

## 🔗 Useful Links

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [SendGrid Email API](https://sendgrid.com/solutions/email-api/)
- [Resend Email API](https://resend.com/)

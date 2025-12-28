# Mailgun + Supabase Automated Email Setup

Complete guide to set up automated confirmation emails using Mailgun and Supabase Edge Functions.

---

## 🎯 How It Works

```
User clicks "Get Access" button
         ↓
Email saved to Supabase database
         ↓
Supabase Edge Function triggers automatically
         ↓
Mailgun API sends confirmation email
         ↓
User receives welcome email from noreply@yourdomain.com
```

---

## 📋 Prerequisites

- Fusion project with Supabase configured (already done ✅)
- Mailgun account (free tier available)
- Supabase CLI installed
- Terminal access

---

## 🚀 Step-by-Step Setup

### Step 1: Create Mailgun Account (Free)

1. Go to [mailgun.com](https://mailgun.com)
2. Click **Sign Up**
3. Create account (email will work)
4. Verify email
5. Go to **Account** → **Security** → **API Keys**
6. You'll see:
   - **API Key** (private key) - Copy this
   - **Domain** (e.g., `sandboxXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org`)

### Step 2: Get Your Mailgun Domain

#### Option A: Use Sandbox Domain (Easy, for testing)

- Mailgun gives you a free sandbox domain
- Looks like: `sandboxXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org`
- Emails will work but go to sandbox (slower)
- **Good for:** Testing and development

#### Option B: Add Custom Domain (Recommended for production)

1. In Mailgun dashboard, go to **Domains**
2. Click **Add New Domain**
3. Enter your domain (e.g., `mail.fusion.dev`)
4. Follow DNS setup instructions
5. Verify domain (2-5 minutes)

### Step 3: Link Supabase Project

Open terminal in your Fusion project folder:

```bash
supabase login
```

- Browser will open
- Login to your Supabase account
- Copy the access token from terminal prompt
- Paste in terminal and press Enter

Link your project:

```bash
supabase link --project-ref czcumwmsruqftsfkunpn
```

### Step 4: Add Mailgun Secrets to Supabase

Set your Mailgun credentials in Supabase:

```bash
supabase secrets set MAILGUN_API_KEY=your_mailgun_api_key_here
```

Replace `your_mailgun_api_key_here` with your actual Mailgun API key

Then set your domain:

```bash
supabase secrets set MAILGUN_DOMAIN=sandboxXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org
```

Or if you added a custom domain:

```bash
supabase secrets set MAILGUN_DOMAIN=mail.fusion.dev
```

**Verify secrets were set:**

```bash
supabase secrets list
```

You should see both `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` listed.

### Step 5: Deploy the Edge Function

The Mailgun code is already in [supabase/functions/send-confirmation-email/index.ts](supabase/functions/send-confirmation-email/index.ts)

Deploy it:

```bash
supabase functions deploy send-confirmation-email
```

Wait for confirmation:

```
✓ Function deployed successfully at https://[project].supabase.co/functions/v1/send-confirmation-email
```

---

## ✅ Testing

### Test 1: Local Development

1. Make sure `.env` has your Supabase credentials:

   ```
   VITE_SUPABASE_URL=https://czcumwmsruqftsfkunpn.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Start dev server:

   ```bash
   npm run dev
   ```

3. Go to landing page (http://localhost:5173)

4. Scroll to **Join Waitlist** section

5. Enter your **real email address** and click **Get Access**

6. Check your inbox (wait 10-30 seconds)

### Expected Results ✅

- **In Supabase:** Email appears in `early_access_signups` table
- **In Email:** Welcome email from `noreply@sandboxXXX.mailgun.org` (or your domain)
- **Email contains:**
  - Subject: "Welcome to Fusion Early Access! 🎵"
  - Fusion branding (cyan color #22E6C3)
  - Welcome message
  - "What's next?" section
  - Dark theme (#070B14 background)
  - Footer: "© 2025 Paperfrogs HQ"

### Test 2: Check Mailgun Dashboard

1. Go to [Mailgun Dashboard](https://app.mailgun.com)
2. Go to **Logs** → **Messages**
3. You should see your test email listed
4. Click to view delivery status

---

## 🔧 Troubleshooting

### Email Not Received?

**Check 1: Spam Folder**

- Check spam/junk folder first
- Add `noreply@sandboxXXX.mailgun.org` to contacts

**Check 2: Supabase Logs**

- Go to Supabase Dashboard
- Click **Functions** → **send-confirmation-email**
- Click **Logs** tab
- Look for errors

**Check 3: Mailgun Logs**

- Go to [Mailgun Dashboard](https://app.mailgun.com)
- Go to **Logs** → **Messages**
- Check delivery status and error messages

**Check 4: Verify Secrets**

```bash
supabase secrets list
```

Make sure both `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` are listed.

### Common Errors

**Error: "MAILGUN_API_KEY not configured"**

- You haven't set the API key yet
- Run: `supabase secrets set MAILGUN_API_KEY=your_key_here`

**Error: "Invalid domain"**

- Domain name is wrong
- Check Mailgun dashboard for exact domain
- Run: `supabase secrets set MAILGUN_DOMAIN=your_domain_here`

**Emails going to spam?**

- Sandbox domains have lower reputation
- Add custom domain for production
- Add SPF/DKIM records (Mailgun provides these)

---

## 📧 Email Content

Users will receive:

```
From: noreply@yourdomain.com
Subject: Welcome to Fusion Early Access! 🎵
─────────────────────────────────────

Welcome to Fusion!

Thank you for joining the waitlist for Fusion – the trust layer
for audio in the AI era.

You've taken an important step toward being part of the next
generation of audio authentication.

What's next?
Keep an eye on your inbox for updates about our launch and
exclusive early access opportunities.

─────────────────────────────────────
This is an automated message from Fusion
© 2025 Paperfrogs HQ. All rights reserved.
```

---

## 🌍 Production Deployment (Netlify)

### Step 1: Add Secrets to Netlify

Go to Netlify Dashboard → Your Site → **Site Settings** → **Build & Deploy** → **Environment**

Add these environment variables:

```
VITE_SUPABASE_URL = https://czcumwmsruqftsfkunpn.supabase.co
VITE_SUPABASE_ANON_KEY = your_anon_key_here
```

(Mailgun secrets are already in Supabase, not needed in Netlify)

### Step 2: Deploy

Push to GitHub:

```bash
git add .
git commit -m "Setup Mailgun automated emails"
git push
```

Netlify will automatically build and deploy!

### Step 3: Test on Live Site

1. Go to your live Netlify URL
2. Enter test email
3. Confirm email received from Mailgun
4. Check Mailgun logs for delivery

---

## 📊 Mailgun Pricing

**Sandbox Domain (Free):**

- ✅ Free
- ✅ Good for development/testing
- ❌ Lower delivery rate
- ❌ Limited to 5 authorized recipients

**Custom Domain (Free tier first 5,000 emails/month):**

- ✅ 5,000 free emails/month
- ✅ Better reputation
- ✅ Custom domain branding
- ✅ Good for production

**Paid Plans:**

- After 5,000 emails: $0.001 per email (very affordable)
- At 10,000 emails/month = $5/month

---

## 🔐 Security Notes

✅ **API Key Security:**

- Never commit `.env` to Git
- Use `.gitignore` (already set up)
- Supabase secrets are encrypted

✅ **No-Reply Email:**

- From: `noreply@yourdomain.com`
- Users can't reply to this address
- Support replies go to `support@fusion.dev`
- This is secure and professional

---

## 📝 Edge Function Code

The function is located at: [supabase/functions/send-confirmation-email/index.ts](supabase/functions/send-confirmation-email/index.ts)

**What it does:**

1. Receives email from frontend when user signs up
2. Gets Mailgun credentials from Supabase secrets
3. Formats beautiful HTML email
4. Sends via Mailgun API
5. Returns success/error to frontend
6. Logs delivery to Supabase

**Technologies:**

- Deno (TypeScript runtime)
- Fetch API (HTTP requests)
- FormData (for Mailgun API)
- Base64 auth (Basic authentication)

---

## ✅ Complete Checklist

- [ ] Mailgun account created
- [ ] Mailgun API key copied
- [ ] Mailgun domain identified (sandbox or custom)
- [ ] `supabase login` completed
- [ ] `supabase link --project-ref czcumwmsruqftsfkunpn` done
- [ ] `supabase secrets set MAILGUN_API_KEY=...` completed
- [ ] `supabase secrets set MAILGUN_DOMAIN=...` completed
- [ ] `supabase secrets list` shows both secrets
- [ ] `supabase functions deploy send-confirmation-email` completed
- [ ] Local testing: received test email
- [ ] Email in Supabase database confirmed
- [ ] Mailgun logs show delivery
- [ ] Netlify environment variables set
- [ ] Live site tested and working

---

## 🎉 You're All Set!

Your Fusion landing page now has fully automated confirmation emails!

**Every time someone clicks "Get Access":**

1. ✅ Email saved to database
2. ✅ Confirmation email sent within seconds
3. ✅ User sees success message
4. ✅ Email appears in Mailgun logs

---

## 📞 Support

**Need help?**

- Check Supabase function logs
- Check Mailgun delivery logs
- Verify all secrets are set correctly
- Test with your own email first

**Questions about Mailgun?**

- [Mailgun Docs](https://documentation.mailgun.com/)
- [Mailgun Support](https://mailgun.com/support)

**Questions about Supabase?**

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Docs](https://supabase.com/docs)

---

**Enjoy your automated email system!** 🚀🎵

# Edge Function Deployment Guide - First Time Setup

This guide will walk you through deploying Edge Functions to Supabase for the first time.

---

## Prerequisites

- Supabase account and project
- Node.js installed on your machine
- Terminal/command line access

---

## Step 1: Install Supabase CLI

Open your terminal and run:

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

You should see something like: `1.x.x`

---

## Step 2: Get Your Project Reference ID

You need your Supabase project reference ID (also called project ref).

### Find it in Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Click on your project (FifteenAll)
3. Click **Settings** (gear icon in left sidebar)
4. Click **General** under Settings
5. Look for **Reference ID** - it looks like: `abcdefghijklmnop`

**Copy this ID** - you'll need it in the next step.

---

## Step 3: Link Your Local Project to Supabase

From your project root directory (`/Volumes/robin/src/zany-zebra`):

```bash
supabase login
```

This will open a browser window. Click "Authorize" to connect the CLI to your account.

Then link your project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with the Reference ID you copied in Step 2.

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

When prompted for the database password:
- Go to Supabase Dashboard → Settings → Database
- Find your database password (or reset it if you don't have it)
- Paste it in the terminal

You should see: `✓ Linked to project YOUR_PROJECT_REF`

---

## Step 4: Deploy the Edge Function

Now deploy the `delete-account` function:

### **Option A: Deploy from project root** (Easiest)

```bash
# Create a symlink so Supabase CLI can find your functions
ln -s database/edge supabase/functions

# Deploy the function
supabase functions deploy delete-account
```

### **Option B: Deploy from edge directory**

```bash
cd database/edge
supabase functions deploy delete-account
```

You should see:
```
Deploying Function delete-account (project ref: YOUR_PROJECT_REF)
✓ Function delete-account deployed successfully
```

---

## Step 5: Verify Deployment

Check that the function was deployed:

```bash
supabase functions list
```

You should see:
```
┌────────────────┬─────────┬─────────────────────┐
│ NAME           │ STATUS  │ CREATED AT          │
├────────────────┼─────────┼─────────────────────┤
│ delete-account │ ACTIVE  │ 2025-10-02 12:34:56 │
└────────────────┴─────────┴─────────────────────┘
```

---

## Step 6: Test the Function

### Get Your Function URL

Your function URL will be:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-account
```

Replace `YOUR_PROJECT_REF` with your actual project reference ID.

### Test with curl (Optional)

You can test the function is responding:

```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-account \
  -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

You should get a response (likely an error about missing authorization, which is expected - it means the function is working).

---

## Common Issues & Solutions

### ❌ "command not found: supabase"

**Solution**: Install Supabase CLI globally:
```bash
npm install -g supabase
```

### ❌ "Error: No project linked"

**Solution**: Run the link command:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### ❌ "Error: Function not found"

**Solution**: Make sure you're in the right directory. Either:
- Create symlink: `ln -s database/edge supabase/functions`
- Or deploy from: `cd database/edge && supabase functions deploy delete-account`

### ❌ "Error: Invalid credentials"

**Solution**: Check your database password in Supabase Dashboard → Settings → Database

### ❌ "Import resolution error" during deployment

**Solution**: The function uses Deno imports (jsr:@supabase/supabase-js@2) which are handled by Supabase. This is normal and should work.

---

## Step 7: Update Your App Code (Already Done)

The app is already configured to use this function. In `services/profileService.ts`:

```typescript
const response = await fetch(
  `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  }
);
```

This will automatically use your deployed function.

---

## Viewing Function Logs

After deployment, you can view logs to see if the function is working:

```bash
# View recent logs
supabase functions logs delete-account

# Stream logs in real-time
supabase functions logs delete-account --follow
```

---

## Making Changes and Redeploying

If you need to update the function:

1. Edit `database/edge/delete-account/index.ts`
2. Redeploy:
   ```bash
   supabase functions deploy delete-account
   ```

That's it! The function will be updated instantly.

---

## Summary - Quick Reference

```bash
# 1. Install CLI (one time)
npm install -g supabase

# 2. Login (one time)
supabase login

# 3. Link project (one time)
supabase link --project-ref YOUR_PROJECT_REF

# 4. Create symlink (one time)
ln -s database/edge supabase/functions

# 5. Deploy function
supabase functions deploy delete-account

# 6. Verify deployment
supabase functions list

# 7. View logs (optional)
supabase functions logs delete-account
```

---

## Need Help?

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/introduction)
- Check function logs: `supabase functions logs delete-account`

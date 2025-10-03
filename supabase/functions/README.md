# Edge Functions

Edge Functions are server-side TypeScript functions that run on Supabase's infrastructure (Deno runtime). They have access to secrets like the service role key and can perform privileged operations.

## Directory Structure

```
database/edge/
├── delete-account/
│   └── index.ts          # Account deletion Edge Function
└── _shared/
    └── cors.ts           # CORS headers for all Edge Functions
```

---

## Why Edge Functions?

Edge Functions are necessary when you need to:
- Use the **service role key** (Admin API access)
- Delete from `auth.users` table (can't be done from database functions)
- Perform privileged operations securely (without exposing secrets to client)

### Example: Account Deletion

The `delete-account` Edge Function is required because:
```typescript
// ❌ Can't do this from client (exposes service_role key)
// ❌ Can't do this from database function (no auth schema access)
// ✅ Must use Edge Function with server-side service_role key

await supabaseAdmin.auth.admin.deleteUser(user.id)
```

---

## Deployment

### Prerequisites

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

### Deploy Edge Function

Since functions are in `database/edge/` instead of default `supabase/functions/`, you need to specify the path:

**Option 1: Deploy from function directory**
```bash
cd database/edge
supabase functions deploy delete-account
```

**Option 2: Deploy with explicit path**
```bash
supabase functions deploy delete-account \
  --project-ref YOUR_PROJECT_REF
```

**Option 3: Create symlink (one-time setup)**
```bash
# From project root
ln -s database/edge supabase/functions
supabase functions deploy delete-account
```

### Verify Deployment

```bash
# List all deployed functions
supabase functions list

# Check function logs
supabase functions logs delete-account
```

---

## Local Development

### Serve Functions Locally

```bash
# From project root
supabase functions serve delete-account \
  --env-file ./database/edge/.env.local
```

Or from the edge directory:
```bash
cd database/edge
supabase functions serve delete-account
```

### Test Locally

```bash
# Test the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/delete-account' \
  --header 'Authorization: Bearer YOUR_USER_TOKEN' \
  --header 'Content-Type: application/json'
```

---

## Environment Variables

Edge Functions have access to these environment variables (automatically provided by Supabase):

- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `SUPABASE_ANON_KEY` - Anonymous key (public)

**Security Note**: Never commit service role keys to git. These are provided automatically by Supabase when deployed.

---

## Creating New Edge Functions

1. **Create function directory**:
   ```bash
   mkdir -p database/edge/my-function
   ```

2. **Create index.ts**:
   ```typescript
   import { createClient } from 'jsr:@supabase/supabase-js@2'
   import { corsHeaders } from '../_shared/cors.ts'

   Deno.serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const supabase = createClient(
         Deno.env.get('SUPABASE_URL') ?? '',
         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
       )

       // Your logic here

       return new Response(
         JSON.stringify({ success: true }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         {
           status: 500,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' }
         }
       )
     }
   })
   ```

3. **Deploy**:
   ```bash
   supabase functions deploy my-function
   ```

---

## Troubleshooting

### Function not found during deployment

If you get "function not found" error:
```bash
# Make sure you're in the right directory
cd database/edge
supabase functions deploy delete-account

# Or use absolute path
supabase functions deploy delete-account --project-ref YOUR_PROJECT_REF
```

### CORS errors in browser

Make sure you're importing and using `corsHeaders`:
```typescript
import { corsHeaders } from '../_shared/cors.ts'

// In your response
return new Response(data, { headers: corsHeaders })
```

### Environment variables not available

Environment variables are automatically provided by Supabase. For local development:
```bash
# Create .env.local in database/edge/
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Then serve with env file
supabase functions serve delete-account --env-file ./database/edge/.env.local
```

---

## Security Best Practices

1. **Never expose service role key** to client
2. **Always validate user authentication** in Edge Functions
3. **Use CORS headers** to control access
4. **Validate all inputs** before processing
5. **Log errors** but don't expose sensitive details to client

---

## References

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.land/)
- [Edge Function Examples](https://github.com/supabase/supabase/tree/master/examples/edge-functions)

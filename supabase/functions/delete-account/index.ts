import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid authorization token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // First, delete all user data using the database function
    const { data: deleteData, error: deleteError } = await supabaseAdmin.rpc('delete_user_data', {
      target_user_id: user.id
    })

    console.log('delete_user_data result:', JSON.stringify(deleteData))

    if (deleteError) {
      console.error('Error deleting user data:', deleteError)
      return new Response(
        JSON.stringify({ success: false, message: `Failed to delete user data: ${deleteError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if the function returned a success: false
    if (deleteData && !deleteData.success) {
      console.error('delete_user_data returned failure:', deleteData.message)
      return new Response(
        JSON.stringify({ success: false, message: `Failed to delete user data: ${deleteData.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Now delete the auth user using database function
    const { data: authDeleteData, error: authDeleteError } = await supabaseAdmin.rpc('delete_auth_user', {
      target_user_id: user.id
    })

    if (authDeleteError || (authDeleteData && !authDeleteData.success)) {
      console.error('Error deleting auth user:', authDeleteError || authDeleteData?.message)
      return new Response(
        JSON.stringify({ success: false, message: `Failed to delete account: ${authDeleteError?.message || authDeleteData?.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account successfully deleted',
        details: deleteData?.details || {}
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

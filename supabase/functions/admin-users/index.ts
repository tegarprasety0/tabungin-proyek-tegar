import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-page',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
}

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'GET' && request.method !== 'DELETE') {
    return respond({ error: 'Method not allowed' }, 405)
  }

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return respond({ error: 'Unauthorized' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return respond({ error: 'Server configuration is incomplete' }, 500)
  }

  const accessToken = authorization.slice('Bearer '.length)
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken)
  if (authError || !authData.user) return respond({ error: 'Invalid session' }, 401)
  if (authData.user.app_metadata?.role !== 'admin') return respond({ error: 'Admin access required' }, 403)

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (request.method === 'GET') {
    const requestedPage = Number(request.headers.get('x-page') || '1')
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 100 })
    if (error) return respond({ error: error.message }, 400)

    const users = data.users.map((account) => ({
      id: account.id,
      email: account.email,
      created_at: account.created_at,
      app_metadata: { role: account.app_metadata?.role },
    }))
    return respond({ users })
  }

  let body: { userId?: string }
  try {
    body = await request.json()
  } catch {
    return respond({ error: 'Invalid JSON body' }, 400)
  }

  const targetId = body.userId
  if (!targetId || typeof targetId !== 'string') return respond({ error: 'userId is required' }, 400)
  if (targetId === authData.user.id) return respond({ error: 'You cannot delete your own account' }, 400)

  const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(targetId)
  if (targetError || !targetData.user) return respond({ error: 'User not found' }, 404)
  if (targetData.user.app_metadata?.role === 'admin') {
    return respond({ error: 'Admin accounts cannot be deleted from this panel' }, 403)
  }

  const { error: transactionsError } = await adminClient
    .from('transactions')
    .delete()
    .eq('user_id', targetId)
  if (transactionsError) return respond({ error: `Could not delete user transactions: ${transactionsError.message}` }, 400)

  const { error: goalsError } = await adminClient
    .from('savings_goals')
    .delete()
    .eq('user_id', targetId)
  if (goalsError) return respond({ error: `Could not delete user goals: ${goalsError.message}` }, 400)

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetId)
  if (deleteError) {
    return respond({ error: `User data was removed, but the Auth account could not be deleted: ${deleteError.message}` }, 400)
  }

  return respond({ success: true })
})

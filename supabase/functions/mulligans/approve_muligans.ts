import { SupabaseClient } from '@supabase/supabase-js'

type ApproveMulliganRequest = {
  request_id: number
  admin_id: string
}

export const approve_mulligan = async (
  supabase: SupabaseClient,
  params: ApproveMulliganRequest
) => {
  const { request_id, admin_id } = params

  // Fetch the request
  const { data: req } = await supabase
    .from('mulligan_requests')
    .select('*')
    .eq('id', request_id)
    .single()

  if (!req) {
    return { error: 'Request not found' }
  }

  // Approve the request
  await supabase
    .from('mulligan_requests')
    .update({ status: 'approved', admin_id })
    .eq('id', request_id)

  return { success: true }
}

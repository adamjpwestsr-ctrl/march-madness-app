import { apply_mulligan, MulliganRequest } from './apply_mulligan'

export interface ApproveMulliganRequest {
  request_id: number
  admin_id: number
}

export const approve_mulligan = async (
  supabase: any,
  { request_id, admin_id }: ApproveMulliganRequest
) => {
  const { data: req } = await supabase
    .from('mulligan_requests')
    .select('*')
    .eq('id', request_id)
    .single()

  if (!req) {
    return { error: 'Request not found' }
  }

  // Apply rewrite using the typed MulliganRequest
  await apply_mulligan(supabase, req as MulliganRequest)

  // Update request status
  await supabase
    .from('mulligan_requests')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin_id
    })
    .eq('id', request_id)

  // Increment mulligans used
  await supabase.rpc('increment_mulligans_used', { user_id: req.user_id })

  return { success: true }
}

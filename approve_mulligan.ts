export const approve_mulligan = async (supabase, { request_id, admin_id }) => {
  const { data: req } = await supabase
    .from('mulligan_requests')
    .select('*')
    .eq('id', request_id)
    .single();

  if (!req) return { error: 'Request not found' };

  // Apply rewrite
  await apply_mulligan(supabase, req);

  // Update request status
  await supabase
    .from('mulligan_requests')
    .update({
      status: 'approved',
      approved_at: new Date(),
      approved_by: admin_id
    })
    .eq('id', request_id);

  // Increment mulligans used
  await supabase.rpc('increment_mulligans_used', { user_id: req.user_id });

  return { success: true };
};

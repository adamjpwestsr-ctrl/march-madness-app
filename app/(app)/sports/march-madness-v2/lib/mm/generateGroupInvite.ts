import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { randomUUID } from "crypto";

export async function generateGroupInvite(groupId: string, email: string) {
  const supabase = await createSupabaseServerClient();

  const token = randomUUID();

  const { error } = await supabase.from("mm_group_invites").insert({
    id: token,
    group_id: groupId,
    email,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;

  return {
    token,
    inviteUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`,
  };
}

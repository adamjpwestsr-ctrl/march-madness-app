import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function generateBracketShareImage(bracketId: string) {
  const supabase = await createSupabaseServerClient();

  // Fetch bracket data
  const { data: bracket, error } = await supabase
    .from("mm_brackets")
    .select("*")
    .eq("id", bracketId)
    .single();

  if (error) {
    console.error("Error fetching bracket:", error);
    throw new Error("Failed to load bracket for share image");
  }

  // Placeholder image until we build the real generator
  const placeholderImageUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/images/bracket-share-placeholder.png`;

  return {
    imageUrl: placeholderImageUrl,
    bracket,
  };
}

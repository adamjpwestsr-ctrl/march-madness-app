import { createClient } from "@/utils/supabase/server";
import TournamentMetadataClient from "./TournamentMetadataClient";

export default async function TournamentMetadataPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("golf_tournaments")
    .select("*")
    .order("start_date");

  return <TournamentMetadataClient tournaments={tournaments || []} />;
}

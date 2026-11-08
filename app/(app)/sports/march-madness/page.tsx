import { redirect } from "next/navigation";

export default function LegacyMarchMadnessRedirect() {
  redirect("/sports/march-madness-v2");
}
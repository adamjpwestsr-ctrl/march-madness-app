"use server";

import { submitRound } from "./submitRound";

export async function submitRoundProxy(input: any) {
  return await submitRound(input);
}

import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import { Experience, WalnutParams, WalnutResponse } from "@/types/experience";

export async function fetchExperience() {
  const { data } = await client.get<Experience[]>(ENDPOINTS.EXPERIENCE);
  return data;
}

export async function calculateWalnut(params: WalnutParams) {
  const { data } = await client.get<WalnutResponse>(ENDPOINTS.WALNUT, {
    params,
  });
  return data;
}

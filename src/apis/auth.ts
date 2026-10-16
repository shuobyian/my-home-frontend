import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";

export async function login(password: string) {
  await client.post(ENDPOINTS.LOGIN, { password });
}

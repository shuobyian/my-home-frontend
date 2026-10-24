import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import { InventoryItem, InventoryUpdateItem } from "@/types/inventory";

// 로그인한 회원 본인의 보유 재료
export async function fetchInventory() {
  const { data } = await client.get<InventoryItem[]>(ENDPOINTS.INVENTORY);
  return data;
}

// 보낸 재료의 보유 개수만 바꾼다. 응답은 바뀐 뒤의 전체 보유 재료다.
// 서버에 없는 시세나 같은 시세가 두 번 있으면 400이고 아무것도 저장하지 않는다.
export async function updateInventory(body: InventoryUpdateItem[]) {
  const { data } = await client.put<InventoryItem[]>(ENDPOINTS.INVENTORY, body);
  return data;
}

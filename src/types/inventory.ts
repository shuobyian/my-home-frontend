// 로그인한 회원이 가진 기초 재료 개수(GET /inventory). 개수가 0인 재료는 목록에 없다.
// 시세를 id로 가리키므로 시세 이름이 바뀌면 name도 따라 바뀐다.
export interface InventoryItem {
  marketId: number;
  name: string;
  count: number;
}

// PUT /inventory 항목. 보낸 재료만 바뀌고, 개수를 0으로 보내면 목록에서 빠진다.
export interface InventoryUpdateItem {
  marketId: number;
  count: number;
}

// 재료 시세
export interface Market {
  id: number;
  name: string;
  price: number;
}

// PUT /market 항목. id가 있으면 그 시세의 바꿀 필드만 보내고, 없으면 새 시세다(name·price 필수).
// 서버에 없는 id는 400으로 거절된다.
export interface MarketUpdateItem {
  id?: number;
  name?: string;
  price?: number;
}

// 물품을 저장하기 전에 함께 추가할 새 시세
export interface NewMarket {
  name: string;
  price: number;
}

export interface MarketDeleteRequest {
  ids: number[];
}

// 실제로 지운 id(오름차순). 서버에 없는 id는 무시한다
export interface MarketDeleteResponse {
  deletedIds: number[];
}

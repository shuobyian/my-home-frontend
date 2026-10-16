// 물품 사진 주소. 사진은 public/images/<물품명>.jpg에 있다(서버는 사진 주소를 주지 않는다).
// 이름에 #·?·% 등이 있어도 경로가 깨지지 않도록 인코딩한다.
export function getItemImageUrl(name: string) {
  return `${process.env.PUBLIC_URL}/images/${encodeURIComponent(name)}.jpg`;
}

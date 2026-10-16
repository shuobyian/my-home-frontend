import { PictureOutlined } from "@ant-design/icons";
import { Avatar, Image } from "antd";
import { getItemImageUrl } from "@/lib/image";

interface ItemImageProps {
  name: string;
  // avatar: 목록용 작은 원형, detail: 상세 화면용 큰 사진
  variant?: "avatar" | "detail";
}

// 물품 사진. 사진이 없으면 빈 칸 대신 대체 아이콘을 보여 준다.
export function ItemImage({ name, variant = "avatar" }: ItemImageProps) {
  if (variant === "detail") {
    return (
      <Image
        src={getItemImageUrl(name)}
        alt={`${name} 사진`}
        width={300}
        preview={false}
        fallback={`${import.meta.env.BASE_URL}myhome.png`}
      />
    );
  }

  return (
    <Avatar
      size='large'
      src={getItemImageUrl(name)}
      alt={`${name} 사진`}
      icon={<PictureOutlined />}
    />
  );
}

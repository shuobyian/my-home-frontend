import { useState } from "react";
import { getItemImageUrl } from "@/lib/image";
import { PictureIcon } from "@/ui";
import styles from "./ItemImage.module.css";

interface ItemImageProps {
  name: string;
  // avatar: 목록용 작은 원형, detail: 상세 화면용 큰 사진
  variant?: "avatar" | "detail";
}

// 물품 사진. 사진을 불러오지 못하면 빈 칸 대신 대체 그림을 보여 준다.
export function ItemImage({ name, variant = "avatar" }: ItemImageProps) {
  const src = getItemImageUrl(name);
  // 실패한 주소를 기억해, 다른 물품으로 바뀌면 다시 불러온다
  const [failedSrc, setFailedSrc] = useState<string>();
  const failed = failedSrc === src;
  const alt = `${name} 사진`;
  const handleError = () => setFailedSrc(src);

  if (variant === "detail") {
    return (
      <img
        src={failed ? `${import.meta.env.BASE_URL}myhome.png` : src}
        alt={alt}
        width={300}
        className={styles.detail}
        onError={handleError}
      />
    );
  }

  if (failed) {
    return (
      <span
        role='img'
        aria-label={alt}
        className={`${styles.avatar} ${styles.fallback}`}
      >
        <PictureIcon />
      </span>
    );
  }

  return (
    <span className={styles.avatar}>
      <img src={src} alt={alt} onError={handleError} />
    </span>
  );
}

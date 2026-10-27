import { ArrowUpIcon, Button } from "@/ui";
import { useEffect, useState } from "react";
import { styles } from "./ScrollTopButton.styles";

// 한 화면 넘게 내려가면 '맨 위로' 버튼을 띄운다. 누르면 페이지 맨 위로 올라간다
export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  // 움직임 줄이기를 켠 사용자에게는 부드럽게 굴리지 않고 바로 올린다
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <Button
      css={styles.button}
      icon={<ArrowUpIcon />}
      aria-label='맨 위로'
      onClick={scrollToTop}
    />
  );
}

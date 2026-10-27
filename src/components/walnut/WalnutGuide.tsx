import { Guide } from "@/components/common/Guide";
import { styles } from "@/components/walnut/WalnutGuide.styles";
import { ExternalLinkIcon, Title } from "@/ui";

interface Buff {
  name: string;
  effects: string[];
}

const CONDITIONS: Buff[] = [
  { name: "생단펫 5강", effects: ["생단 30%"] },
  {
    name: "레트로슈가 하트 포션 (5시간)",
    effects: ["생단 10%", "생경 20%", "의뢰 보상 100%"],
  },
  { name: "로빈샵 하급 생단 향수 (30분)", effects: ["생단 10%"] },
  { name: "최소 생단", effects: ["84%"] },
];

const BEST_COMBOS: Buff[] = [
  {
    name: "레트로 향수 + 하급생단 향수",
    effects: ["생산 경험치 증가 60%", "생산 단축 85%"],
  },
];

function BuffList({ title, buffs }: { title: string; buffs: Buff[] }) {
  return (
    <section css={styles.section}>
      <Title level={5} css={styles.sectionTitle}>
        {title}
      </Title>
      <ul css={styles.list}>
        {buffs.map((buff) => (
          <li key={buff.name} css={styles.row}>
            <span>{buff.name}</span>
            <span css={styles.chips}>
              {buff.effects.map((effect) => (
                <span key={effect} css={styles.chip}>
                  {effect}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// 호두작 안내문
export function WalnutGuide() {
  return (
    <Guide title='입력한 정보로 남은 경험치와 필요한 앰플 개수·재료를 계산합니다.'>
      <div css={styles.sections}>
        <BuffList title='필요 조건' buffs={CONDITIONS} />
        <BuffList title='최고 조합' buffs={BEST_COMBOS} />
      </div>
      <a
        href='https://cafe.naver.com/myhomeforkakao/3318785'
        target='_blank'
        rel='noreferrer'
        css={styles.link}
      >
        자세한 설명 보기(네이버 카페)
        <ExternalLinkIcon />
      </a>
    </Guide>
  );
}

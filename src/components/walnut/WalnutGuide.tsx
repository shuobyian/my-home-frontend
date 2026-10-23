import { Stack, Text, Title } from "@/ui";

// 호두작 안내문
export function WalnutGuide() {
  return (
    <Stack vertical gap={0}>
      <Title level={4}>
        자세한 설명은{" "}
        <a
          href='https://cafe.naver.com/myhomeforkakao/3318785'
          target='_blank'
          rel='noreferrer'
        >
          해당 링크
        </a>{" "}
        참고해주세요.
      </Title>
      <Title level={5}>필요 조건</Title>
      <Text>- 생단펫 5강 생단 30%</Text>
      <Text>
        - 레트로슈가 하트 포션 (5시간) 생단 10%, 생경 20%, 의뢰 보상 100%
      </Text>
      <Text>- 로빈샵 하급 생단 향수 (30분) 생단 10%</Text>
      <Text>- 최소 생단 84%</Text>
      <Title level={5}>최고 조합</Title>
      <Text>- 레트로 향수 + 하급생단 향수</Text>
      <Text>- 생산 경험치 증가 60% + 생산 단축 85%</Text>
      <Title level={5}>
        입력한 정보에 따라 계산된 결과를 확인할 수 있습니다.
      </Title>
      <Text>1. 남은 경험치</Text>
      <Text>2. 필요한 앰플 개수</Text>
      <Text>3. 필요한 앰플 재료</Text>
    </Stack>
  );
}

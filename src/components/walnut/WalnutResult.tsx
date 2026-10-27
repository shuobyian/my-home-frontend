import { Panel } from "@/components/common/Panel";
import { ResultCards } from "@/components/result/ResultCards";
import { formatNumber } from "@/lib/format";
import { WalnutResponse } from "@/types/experience";
import { Result } from "@/types/result";
import { Stack, Text } from "@/ui";

interface WalnutResultProps {
  result: WalnutResponse;
  // 앰플 재료 카드의 담기를 누르면 호출된다(장바구니 담기)
  onSelectAmple?: (ample: Result) => void;
}

export function WalnutResult({ result, onSelectAmple }: WalnutResultProps) {
  return (
    <Panel>
      <Stack vertical>
        <Text>남은 경험치: {formatNumber(result.remindExperience)}</Text>
        <Text>필요한 앰플 개수: {formatNumber(result.remindCount)}</Text>
        <Text strong>필요한 앰플 재료</Text>
        <ResultCards
          loading={false}
          contents={[result.ample.result]}
          onAdd={onSelectAmple}
        />
      </Stack>
    </Panel>
  );
}

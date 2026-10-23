import { Panel } from "@/components/common/Panel";
import { ResultTable } from "@/components/result/ResultTable";
import { formatNumber } from "@/lib/format";
import { WalnutResponse } from "@/types/experience";
import { Result } from "@/types/result";
import { Stack, Text } from "@/ui";

interface WalnutResultProps {
  result: WalnutResponse;
  // 앰플 재료 행을 누르면 호출된다(장바구니 담기)
  onSelectAmple?: (ample: Result) => void;
}

export function WalnutResult({ result, onSelectAmple }: WalnutResultProps) {
  return (
    <Panel>
      <Stack vertical>
        <Text>남은 경험치: {formatNumber(result.remindExperience)}</Text>
        <Text>필요한 앰플 개수: {formatNumber(result.remindCount)}</Text>
        <Text strong>필요한 앰플 재료</Text>
        <ResultTable
          loading={false}
          contents={[result.ample.result]}
          onRowClick={onSelectAmple}
        />
      </Stack>
    </Panel>
  );
}

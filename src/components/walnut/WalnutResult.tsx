import { Space, Typography } from "antd";
import { Panel } from "components/common/Panel";
import { ResultTable } from "components/result/ResultTable";
import { formatNumber } from "lib/format";
import { WalnutResponse } from "types/experience";
import { Result } from "types/result";

interface WalnutResultProps {
  result: WalnutResponse;
  // 앰플 재료 행을 누르면 호출된다(장바구니 담기)
  onSelectAmple?: (ample: Result) => void;
}

export function WalnutResult({ result, onSelectAmple }: WalnutResultProps) {
  return (
    <Panel>
      <Space direction='vertical' style={{ width: "100%" }}>
        <Typography.Text>
          남은 경험치: {formatNumber(result.remindExperience)}
        </Typography.Text>
        <Typography.Text>
          필요한 앰플 개수: {formatNumber(result.remindCount)}
        </Typography.Text>
        <Typography.Text strong>필요한 앰플 재료</Typography.Text>
        <ResultTable
          loading={false}
          contents={[result.ample.result]}
          onRowClick={onSelectAmple}
        />
      </Space>
    </Panel>
  );
}

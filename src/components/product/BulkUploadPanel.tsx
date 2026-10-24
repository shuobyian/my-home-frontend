import { Panel } from "@/components/common/Panel";
import { MATERIAL_REF_TEXT, UploadProblems } from "@/domain/catalog";
import { BulkUploadPlan } from "@/domain/productExcel";
import { formatNumber } from "@/lib/format";
import { ReactNode } from "react";
import { Product } from "@/types/product";
import { Button, Stack, Text } from "@/ui";

const LIST_STYLE = {
  margin: 0,
  paddingLeft: 20,
  maxHeight: 160,
  overflow: "auto",
};

// 이름이 많을 수 있어 접어 둔다
function NameDetails({
  products,
}: {
  products: Pick<Product, "id" | "name">[];
}) {
  return (
    <details>
      <summary>목록 보기</summary>
      <ul style={LIST_STYLE}>
        {products.map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
      </ul>
    </details>
  );
}

// 문제 한 묶음: 설명 줄(필요하면 버튼)과 그 아래 내용
function Section({
  tone,
  title,
  action,
  children,
}: {
  tone: "warning" | "danger" | "secondary";
  title: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Stack vertical gap={4}>
      <Stack wrap>
        <Text tone={tone}>{title}</Text>
        {action}
      </Stack>
      {children}
    </Stack>
  );
}

interface BulkUploadPanelProps {
  // 서버 목록과 비교한 업로드 계획. 서버 목록을 받기 전에는 없다
  plan?: BulkUploadPlan;
  // 업로드할 물품(plan.toAdd)의 재료 참조 문제
  problems?: UploadProblems;
  loading?: boolean;
  error?: boolean;
  // 시세에 없는 재료를 시세에 추가한다
  onAddMarkets: (names: string[]) => void;
  // 서버에서 지워졌거나 이름이 바뀐 물품을 Raw 목록에서 뺀다
  onDropRevived: () => void;
}

// Raw 목록을 서버에 올리기 전에, 무엇이 올라가고 무엇이 빠지는지와 막는 문제를 늘 보여 준다
export function BulkUploadPanel({
  plan,
  problems,
  loading,
  error,
  onAddMarkets,
  onDropRevived,
}: BulkUploadPanelProps) {
  if (loading) {
    return (
      <Panel>
        <Text tone='secondary'>서버 물품·시세 목록을 불러오는 중…</Text>
      </Panel>
    );
  }
  if (error || !plan) {
    return (
      <Panel>
        <Text tone='warning'>
          서버 물품·시세 목록을 불러오지 못해 무엇을 올릴지 알 수 없습니다.
          새로고침 후 다시 시도해주세요.
        </Text>
      </Panel>
    );
  }

  const { toAdd, revived, differs, serverOnly } = plan;
  const missingMarkets = problems?.missingMarkets ?? [];
  const rowProblems = problems?.rowProblems ?? [];
  const duplicates = problems?.duplicates ?? [];

  return (
    <Panel>
      <Stack vertical gap={10}>
        <Text strong>추가할 새 물품 {formatNumber(toAdd.length)}개</Text>
        {missingMarkets.length > 0 && (
          <Section
            tone='danger'
            title={`시세에 없는 재료 ${formatNumber(missingMarkets.length)}개가 있어 저장할 수 없습니다. 새 재료라면 시세를 추가하고, 오타라면 Raw 행을 고치세요.`}
            action={
              <Button
                onClick={() =>
                  onAddMarkets(missingMarkets.map(({ name }) => name))
                }
              >
                시세 추가
              </Button>
            }
          >
            <ul style={LIST_STYLE}>
              {missingMarkets.map(({ name, usedBy }) => (
                <li key={name}>
                  {name} (쓰는 물품: {usedBy.join(", ")})
                </li>
              ))}
            </ul>
          </Section>
        )}
        {rowProblems.length > 0 && (
          <Section
            tone='danger'
            title={`재료가 잘못된 곳 ${formatNumber(rowProblems.length)}개가 있어 저장할 수 없습니다.`}
          >
            <ul style={LIST_STYLE}>
              {rowProblems.map(({ product, material, ref }) => (
                <li key={JSON.stringify([product, material, ref])}>
                  {product}: {material} - {MATERIAL_REF_TEXT[ref]}
                </li>
              ))}
            </ul>
          </Section>
        )}
        {duplicates.length > 0 && (
          <Section
            tone='danger'
            title={`같은 이름의 새 물품이 여러 번 있어 저장할 수 없습니다. (${duplicates.join(", ")})`}
          />
        )}
        {revived.length > 0 && (
          <Section
            tone='warning'
            title={`서버에서 지워졌거나 이름이 바뀐 물품 ${formatNumber(revived.length)}개는 올리지 않습니다.`}
            action={<Button onClick={onDropRevived}>Raw 목록에서 빼기</Button>}
          >
            <Text tone='secondary'>
              다시 올리려면 '물품 리스트'에서 추가하세요.
            </Text>
            <NameDetails products={revived} />
          </Section>
        )}
        {differs.length > 0 && (
          <Section
            tone='warning'
            title={`서버와 내용이 다른 ${formatNumber(differs.length)}개는 반영되지 않습니다. '물품 리스트'에서 수정하세요.`}
          >
            <NameDetails products={differs} />
          </Section>
        )}
        {serverOnly > 0 && (
          <Section
            tone='secondary'
            title={`서버에만 있는 물품 ${formatNumber(serverOnly)}개`}
          />
        )}
      </Stack>
    </Panel>
  );
}

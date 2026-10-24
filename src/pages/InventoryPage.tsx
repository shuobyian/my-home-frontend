import { getErrorMessage } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { InventoryForm } from "@/components/inventory/InventoryForm";
import {
  useInventoryQuery,
  useUpdateInventoryMutation,
} from "@/queries/inventory";
import { useMarketsQuery } from "@/queries/market";
import { useCurrentUser } from "@/state/auth";
import { createPath, Navigate, useLocation } from "react-router";
import { Spin, Stack, Text, Title, useDialogs, useToast } from "@/ui";

// 보유 재료: 로그인한 회원이 가진 기초 재료 개수를 저장한다.
// 결과·장바구니 합산·자유 모드 결과의 기초 재료 표가 이 값으로 부족 개수를 보여 준다.
export function InventoryPage() {
  const user = useCurrentUser();
  const location = useLocation();
  const toast = useToast();
  const dialogs = useDialogs();
  const markets = useMarketsQuery();
  const inventory = useInventoryQuery(user?.id);
  const save = useUpdateInventoryMutation(user?.id);

  // 로그인하면 이 화면으로 돌아온다
  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: createPath(location) }}
        replace
      />
    );
  }

  return (
    <Stack vertical>
      <Stack vertical gap={0}>
        <Title level={4}>보유 재료</Title>
        <Text>가지고 있는 기초 재료의 개수를 입력해 저장해주세요.</Text>
        <Text>
          결과, 장바구니 합산, 자유 모드 결과에서 필요한 개수에서 보유 개수를 뺀
          부족 개수를 함께 보여 줍니다.
        </Text>
      </Stack>
      {markets.data && inventory.data ? (
        <InventoryForm
          // 다른 계정으로 바꿔 로그인하면 입력하던 값을 지운다
          key={user.id}
          markets={markets.data}
          inventory={inventory.data}
          submitting={save.isPending}
          onSubmit={(changes) =>
            save.mutate(changes, {
              onSuccess: () => toast.success("보유 재료를 저장했습니다."),
              onError: (error) =>
                dialogs.alert({
                  status: "error",
                  title: "저장하지 못했습니다",
                  content: getErrorMessage(error),
                }),
            })
          }
        />
      ) : (
        <Spin />
      )}
    </Stack>
  );
}

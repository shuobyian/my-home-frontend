import { Button, Input, Typography, message } from "antd";
import { WalnutReqParams, WalnutResBody } from "apis/experience/postWalnut";
import MyHomeError from "apis/lib/error/MyHomeError";
import { useWalnutMutation } from "queries/experience/useWalnutMutation";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { StringUtil } from "util/StringUtil";
import { ResultList } from "view/components/home/ResultList";

export function Walnut() {
  const navigate = useNavigate();

  const { isLoading, mutate } = useWalnutMutation();

  const form = useForm<WalnutReqParams>();
  const { handleSubmit, control, watch } = form;
  const { presentLevel } = watch();

  const [walnutResult, setWalnutResult] = useState<WalnutResBody>();

  const onSubmit = (formData: WalnutReqParams) => {
    mutate(formData, {
      onSuccess: ({ data }) => {
        setWalnutResult(data);
      },
      onError: (error) => {
        message.error((error as MyHomeError).getErrorMessage());
      },
    });
  };

  return (
    <>
      <div>
        <Button
          onClick={() => navigate("/experience")}
          style={{ float: "right" }}
        >
          레벨별 필요한 경험치
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography.Title level={4}>
            자세한 설명은{" "}
            <a href='https://cafe.naver.com/myhomeforkakao/3318785'>
              해당 링크
            </a>{" "}
            참고해주세요.
          </Typography.Title>
          <Typography.Title level={5}>필요 조건</Typography.Title>
          <Typography.Text>- 생단펫 5강 생단 30%</Typography.Text>
          <Typography.Text>
            - 레트로슈가 하트 포션 (5시간) 생단 10%, 생경 20%, 의뢰 보상 100%
          </Typography.Text>
          <Typography.Text>
            - 로빈샵 하급 생단 향수 (30분) 생단 10%
          </Typography.Text>
          <Typography.Text>- 최소 생단 84%</Typography.Text>
          <Typography.Title level={5}>최고 조합</Typography.Title>
          <Typography.Text>- 레트로 향수 + 하급생단 향수</Typography.Text>
          <Typography.Text>
            - 생산 경험치 증가 60% + 생산 단축 85%
          </Typography.Text>
          <Typography.Title level={5}>
            입력한 정보에 따라 계산된 결과를 확인할 수 있습니다.
          </Typography.Title>
          <Typography.Text>1. 남은 경험치</Typography.Text>
          <Typography.Text>2. 필요한 앰플 개수</Typography.Text>
          <Typography.Text>3. 필요한 앰플 재료</Typography.Text>
        </div>
        <Button
          type='primary'
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
          style={{ float: "right", margin: "10px" }}
        >
          계산하기
        </Button>
      </div>
      <FormProvider {...form}>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography.Text>
                  현재 레벨을 입력합니다. (필수)
                </Typography.Text>
                <Controller
                  rules={{ required: "현재 레벨을 입력해주세요." }}
                  name={"presentLevel"}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type='number'
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder='현재 레벨'
                      min={55}
                      max={111}
                    />
                  )}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography.Text>현재 경험치를 입력합니다.</Typography.Text>
                <Typography.Text>
                  입력하지 않으면 0으로 계산됩니다.
                </Typography.Text>
                <Controller
                  name={"presentExperience"}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type='number'
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      min={0}
                      placeholder='기본값 = 0'
                    />
                  )}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography.Text>목표 레벨을 입력합니다.</Typography.Text>
                <Typography.Text>
                  입력하지 않으면 다음 레벨로 설정됩니다.
                </Typography.Text>
                <Controller
                  name={"objectiveLevel"}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type='number'
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={`기본값 = ${
                        presentLevel ? Number(presentLevel) + 1 : "X"
                      }`}
                      min={56}
                      max={111}
                    />
                  )}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography.Text>
                  현재 생산 경험치 버프 비율을 입력합니다. 예) 20%일 경우, 20
                </Typography.Text>
                <Controller
                  name={"productionPercent"}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type='number'
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      min={0}
                      max={100}
                      placeholder='기본값 = 60'
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </FormProvider>
      {walnutResult && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "10px",
            border: "1px solid #eeeeee",
            borderRadius: "10px",
            background: "white",
            marginTop: "20px",
          }}
        >
          <Typography.Text>
            남은 경험치:{" "}
            {StringUtil.numberWithCommas(walnutResult.remindExperience)}
          </Typography.Text>
          <Typography.Text>
            필요한 앰플 개수:{" "}
            {StringUtil.numberWithCommas(walnutResult.remindCount)}
          </Typography.Text>
          <Typography.Text strong>필요한 앰플 재료</Typography.Text>
          <ResultList
            loading={isLoading}
            contents={[walnutResult.ample.result]}
          />
        </div>
      )}
    </>
  );
}

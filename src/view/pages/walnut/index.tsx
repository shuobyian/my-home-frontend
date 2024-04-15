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
            호두작은 호두나무를 생단으로 1시간 이하로 만들어서 과속 생산하는
            것을 일컫습니다.
          </Typography.Title>
          <Typography.Text>최소 생단 86%가 필요합니다.</Typography.Text>
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
                      placeholder={`기본값 =  ${
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
                <Typography.Text>
                  입력하지 않으면 대략적인 퍼센트로 설정됩니다. (제 생산
                  경험치입니다.)
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
                      placeholder='기본값 = 19'
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

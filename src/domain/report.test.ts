import {
  buildChangeCandidates,
  createChangeDraft,
  describeActivity,
  formatChangeValue,
  toChangeInput,
} from "@/domain/report";
import { createProduct } from "@/test/fixtures";

const candidates = buildChangeCandidates({
  experiences: [
    { id: 91, level: 91, amount: 11000000 },
    { id: 90, level: 90, amount: 9500000 },
  ],
  markets: [{ id: 3, name: "나무", price: 10 }],
  products: [
    createProduct({
      id: 5,
      name: "식탁",
      materials: [
        { id: 51, name: "판자", basic: false, count: 2 },
        // 엑셀 등에서 만든 재료는 id가 없어 고를 수 없다
        { name: "못", basic: true, count: 4 },
      ],
    }),
  ],
});

describe("buildChangeCandidates", () => {
  it("레벨 순서로 경험치를, 물품마다 id가 있는 재료를 '물품 · 재료'로 만든다", () => {
    expect(candidates.EXPERIENCE.map(({ label }) => label)).toEqual([
      "90레벨",
      "91레벨",
    ]);
    expect(candidates.MATERIAL).toEqual([
      { id: 51, label: "식탁 · 판자", values: { name: "판자", count: 2 } },
    ]);
    // 분류가 없는 옛 시세는 기타로 본다
    expect(candidates.MARKET[0].values.group).toBe("ETC");
  });
});

describe("toChangeInput", () => {
  const draft = { ...createChangeDraft(0), targetId: 90 };

  it("90레벨 경험치는 10,000,000이라는 값을 숫자로 바꿔 보낸다", () => {
    expect(
      toChangeInput({ ...draft, value: "10,000,000" }, candidates)
    ).toEqual({
      input: {
        target: "EXPERIENCE",
        targetId: 90,
        field: "amount",
        value: 10000000,
      },
    });
  });

  it.each([
    [{ targetId: undefined, value: "1" }, "바꿀 대상을 골라주세요."],
    [{ value: "" }, "정수를 입력해주세요."],
    [{ value: "1.5" }, "정수를 입력해주세요."],
    [{ value: "많이" }, "정수를 입력해주세요."],
    [{ value: "9500000" }, "현재 값과 같습니다."],
  ])("잘못된 입력 %o은 '%s'", (patch, error) => {
    expect(toChangeInput({ ...draft, ...patch }, candidates)).toEqual({
      error,
    });
  });

  it("재료 개수는 소수도, 도구는 enum 값도 받는다", () => {
    expect(
      toChangeInput(
        {
          key: 0,
          target: "MATERIAL",
          targetId: 51,
          field: "count",
          value: "2.5",
        },
        candidates
      ).input?.value
    ).toBe(2.5);
    expect(
      toChangeInput(
        {
          key: 0,
          target: "PRODUCT",
          targetId: 5,
          field: "tool",
          value: "FIRE_PIT",
        },
        candidates
      ).input?.value
    ).toBe("FIRE_PIT");
  });
});

describe("formatChangeValue", () => {
  it("숫자는 천 단위로, enum은 이름으로 보여 준다", () => {
    expect(formatChangeValue("EXPERIENCE", "amount", 10000000)).toBe(
      "10,000,000"
    );
    expect(formatChangeValue("PRODUCT", "tool", "FIRE_PIT")).toBe(
      "요리용 화덕"
    );
    expect(formatChangeValue("MARKET", "group", "CROP")).toBe("작물");
    expect(formatChangeValue("MARKET", "name", "나무")).toBe("나무");
  });
});

describe("describeActivity", () => {
  const log = {
    id: 1,
    action: "REPORT_ANSWER" as const,
    userId: 1,
    username: "admin",
    reportId: 7,
    detail: { title: "90레벨 경험치", status: "RESOLVED", answer: "반영" },
    ip: "",
    userAgent: "",
    createdAt: "2026-10-30T00:00:00Z",
  };

  it("제보 로그는 번호·제목과 처리 결과를, 닉네임 변경은 전후를 보여 준다", () => {
    expect(describeActivity(log)).toBe("#7 90레벨 경험치 → 반영");
    expect(describeActivity({ ...log, action: "REPORT_CREATE" })).toBe(
      "#7 90레벨 경험치"
    );
    expect(
      describeActivity({
        ...log,
        action: "PROFILE_UPDATE",
        reportId: null,
        detail: { before: "늘흰", after: "새벽" },
      })
    ).toBe("늘흰 → 새벽");
    expect(
      describeActivity({ ...log, action: "LOGIN", reportId: null, detail: {} })
    ).toBe("");
  });
});

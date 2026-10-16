import { parseWalnutParams, toWalnutSearchParams } from "domain/experience";

describe("parseWalnutParams", () => {
  it("숫자인 값만 읽는다", () => {
    expect(
      parseWalnutParams(
        new URLSearchParams(
          "presentLevel=60&presentExperience=100&objectiveLevel=70&productionPercent=62.5"
        )
      )
    ).toEqual({
      presentLevel: 60,
      presentExperience: 100,
      objectiveLevel: 70,
      productionPercent: 62.5,
    });
  });

  it("현재 레벨이 없거나 숫자가 아니면 계산하지 않는다", () => {
    expect(parseWalnutParams(new URLSearchParams())).toBeUndefined();
    expect(
      parseWalnutParams(new URLSearchParams("presentLevel=abc"))
    ).toBeUndefined();
  });

  it("선택 항목이 비었거나 숫자가 아니면 뺀다", () => {
    expect(
      parseWalnutParams(
        new URLSearchParams(
          "presentLevel=60&objectiveLevel=&productionPercent=x"
        )
      )
    ).toEqual({ presentLevel: 60 });
  });
});

describe("toWalnutSearchParams", () => {
  it("입력한 값만 쓰고 왕복 변환하면 같다", () => {
    const params = { presentLevel: 60, objectiveLevel: 61 };
    expect(toWalnutSearchParams(params).toString()).toBe(
      "presentLevel=60&objectiveLevel=61"
    );
    expect(parseWalnutParams(toWalnutSearchParams(params))).toEqual(params);
  });
});

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

  it("레벨·경험치는 정수만, 버프 비율은 소수까지 받는다", () => {
    expect(
      parseWalnutParams(new URLSearchParams("presentLevel=60.5"))
    ).toBeUndefined();
    expect(
      parseWalnutParams(new URLSearchParams("presentLevel=0x40"))
    ).toBeUndefined();
    expect(
      parseWalnutParams(
        new URLSearchParams(
          "presentLevel=60&objectiveLevel=61.5&productionPercent=62.5"
        )
      )
    ).toEqual({ presentLevel: 60, productionPercent: 62.5 });
  });

  it("0 값도 유지한다", () => {
    const params = {
      presentLevel: 60,
      presentExperience: 0,
      productionPercent: 0,
    };
    expect(parseWalnutParams(toWalnutSearchParams(params))).toEqual(params);
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

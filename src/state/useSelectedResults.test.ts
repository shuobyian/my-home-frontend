import { act, renderHook } from "@testing-library/react";
import { createResult } from "test/fixtures";
import { STORAGE_KEY } from "lib/storage";
import { useSelectedResults } from "state/useSelectedResults";

const chair = createResult({ id: 1, name: "나무 의자" });
const vase = createResult({ id: 2, name: "꽃병" });

beforeEach(() => {
  localStorage.clear();
});

describe("useSelectedResults", () => {
  it("저장된 값이 없으면 빈 장바구니로 시작한다", () => {
    const { result } = renderHook(() => useSelectedResults());

    expect(result.current.selectedResults).toEqual({});
    expect(result.current.totalCount).toBe(0);
  });

  it("마운트 시 localStorage에 저장된 장바구니를 복원한다", () => {
    localStorage.setItem(
      STORAGE_KEY.SELECTED_RESULTS,
      JSON.stringify({ [chair.id]: { item: chair, count: 3 } })
    );

    const { result } = renderHook(() => useSelectedResults());

    expect(result.current.selectedResults).toEqual({
      [chair.id]: { item: chair, count: 3 },
    });
    expect(result.current.totalCount).toBe(3);
  });

  it("저장된 값이 손상되어 있으면 빈 장바구니로 시작한다", () => {
    localStorage.setItem(STORAGE_KEY.SELECTED_RESULTS, "{not json");

    const { result } = renderHook(() => useSelectedResults());

    expect(result.current.selectedResults).toEqual({});
  });

  it("onChange는 새 항목을 1개로 담고, 이미 있으면 1 증가시킨다", () => {
    const { result } = renderHook(() => useSelectedResults());

    act(() => result.current.onChange(chair));
    act(() => result.current.onChange(vase));
    act(() => result.current.onChange(chair));

    expect(result.current.selectedResults).toEqual({
      [chair.id]: { item: chair, count: 2 },
      [vase.id]: { item: vase, count: 1 },
    });
    expect(result.current.totalCount).toBe(3);
  });

  it("add와 sub로 수량을 조절하고, 1개에서 sub하면 항목을 삭제한다", () => {
    const { result } = renderHook(() => useSelectedResults());
    act(() => result.current.onChange(chair));

    // 중첩 객체를 제자리에서 바꾸는 구현이라 count만으로는 리렌더 여부를 알 수 없다.
    // 새 참조와 totalCount까지 확인해 상태 갱신이 일어났는지 검증한다.
    let prev = result.current.selectedResults;
    act(() => result.current.add(chair.id));
    expect(result.current.selectedResults).not.toBe(prev);
    expect(result.current.selectedResults[chair.id].count).toBe(2);
    expect(result.current.totalCount).toBe(2);

    prev = result.current.selectedResults;
    act(() => result.current.sub(chair.id));
    expect(result.current.selectedResults).not.toBe(prev);
    expect(result.current.selectedResults[chair.id].count).toBe(1);
    expect(result.current.totalCount).toBe(1);

    act(() => result.current.sub(chair.id));
    expect(result.current.selectedResults).toEqual({});
    expect(result.current.totalCount).toBe(0);
  });

  it("update는 수량을 지정한 값으로 바꾼다", () => {
    const { result } = renderHook(() => useSelectedResults());
    act(() => result.current.onChange(chair));

    act(() => result.current.update(chair.id, 7));

    expect(result.current.selectedResults[chair.id].count).toBe(7);
    expect(result.current.totalCount).toBe(7);
  });

  it("remove는 항목 하나를, removeAll은 전체를 삭제한다", () => {
    const { result } = renderHook(() => useSelectedResults());
    act(() => result.current.onChange(chair));
    act(() => result.current.onChange(vase));

    act(() => result.current.remove(chair.id));
    expect(result.current.selectedResults).toEqual({
      [vase.id]: { item: vase, count: 1 },
    });

    act(() => result.current.removeAll());
    expect(result.current.selectedResults).toEqual({});
    expect(result.current.totalCount).toBe(0);
  });

  it("backup은 전달한 장바구니를 localStorage에 JSON으로 저장한다", () => {
    const { result } = renderHook(() => useSelectedResults());
    const cart = { [chair.id]: { item: chair, count: 2 } };

    result.current.backup(cart);

    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY.SELECTED_RESULTS)!)
    ).toEqual(cart);
  });
});

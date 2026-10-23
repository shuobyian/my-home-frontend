import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  test("기본 type은 button이라 폼 안에서도 제출하지 않는다", () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Button>취소</Button>
      </form>
    );

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("loading이면 클릭과 제출을 막고 aria-busy로 알린다", () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Button type='submit' loading onClick={onClick}>
          확인
        </Button>
      </form>
    );
    const button = screen.getByRole("button", { name: "확인" });

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeEnabled();
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

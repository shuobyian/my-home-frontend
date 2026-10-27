import { fireEvent, render, screen } from "@testing-library/react";
import { ScrollTopButton } from "@/app/ScrollTopButton";

const scrollWindowTo = (y: number) => {
  vi.spyOn(window, "scrollY", "get").mockReturnValue(y);
  fireEvent.scroll(window);
};

describe("ScrollTopButton", () => {
  it("한 화면 넘게 내려가면 보이고, 누르면 맨 위로 올린다", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<ScrollTopButton />);
    expect(
      screen.queryByRole("button", { name: "맨 위로" })
    ).not.toBeInTheDocument();

    scrollWindowTo(window.innerHeight + 1);
    fireEvent.click(screen.getByRole("button", { name: "맨 위로" }));

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("다시 위로 올라오면 숨는다", () => {
    render(<ScrollTopButton />);
    scrollWindowTo(window.innerHeight + 1);
    expect(screen.getByRole("button", { name: "맨 위로" })).toBeInTheDocument();

    scrollWindowTo(0);

    expect(
      screen.queryByRole("button", { name: "맨 위로" })
    ).not.toBeInTheDocument();
  });
});

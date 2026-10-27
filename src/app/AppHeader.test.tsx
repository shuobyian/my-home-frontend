import { render, screen } from "@testing-library/react";
import { AppHeader } from "@/app/AppHeader";
import { MemoryRouter } from "react-router";

describe("AppHeader", () => {
  it("제목을 누르면 홈으로 가는 링크이고, 메뉴 버튼은 두지 않는다(메뉴는 AppNav)", () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: "놀러와 마이홈 제작 계산기" })
    ).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

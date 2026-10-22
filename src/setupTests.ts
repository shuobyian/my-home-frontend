// toBeInTheDocument 같은 DOM 단언을 Vitest의 expect에 추가한다
import "@testing-library/jest-dom/vitest";

// antd(Form·Grid·Segmented 등)가 쓰는 matchMedia를 jsdom에 제공한다.
// 테스트마다 mock을 되돌리는 설정(restoreMocks)의 영향을 받지 않도록 일반 함수로 정의한다.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// antd 6(@rc-component/resize-observer)은 폴리필 없이 브라우저의 ResizeObserver를 쓴다.
// jsdom에는 없으므로 아무 일도 하지 않는 구현을 둔다(테스트에서는 크기 변화가 없다).
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(globalThis, "ResizeObserver", {
    writable: true,
    value: ResizeObserverStub,
  });
}

// jsdom은 의사 요소(::before 등)의 스타일 계산을 지원하지 않아 antd가 호출할 때마다
// "Not implemented" 경고를 낸다. 테스트에서는 의사 요소 인자를 무시한다.
const getComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element: Element) => getComputedStyle(element);

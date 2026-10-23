import { getErrorMessage } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { useNavigateTo } from "@/app/useNavigateTo";
import { isChunkLoadError } from "@/lib/chunk";
import { Component, ReactNode, useEffect, useState } from "react";
import {
  QueryErrorResetBoundary,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import { useLocation } from "react-router";
import { Button, Result } from "@/ui";

interface ErrorBoundaryProps {
  children: ReactNode;
  // 이 값이 바뀌면(화면 이동) 에러 상태를 초기화한다
  resetKey: string;
  onReset: () => void;
  onGoHome: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
  resetKey: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    resetKey: this.props.resetKey,
  };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  // 화면을 이동하면(resetKey 변경) 같은 렌더에서 오류 상태를 지운다.
  // 이동한 화면이 렌더 중에 새로 던진 에러는 그 뒤 getDerivedStateFromError가 다시 잡는다.
  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState
  ): Partial<ErrorBoundaryState> | null {
    if (props.resetKey === state.resetKey) return null;
    return { hasError: false, error: null, resetKey: props.resetKey };
  }

  reset = () => {
    this.props.onReset();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // 지연 로딩 코드를 받지 못한 경우: React.lazy가 실패를 기억하므로 '다시 시도'로는 복구되지 않는다
    if (isChunkLoadError(this.state.error)) {
      return (
        <Result
          status='warning'
          title='화면을 불러오지 못했습니다.'
          description='새 버전이 배포되었거나 연결이 끊겼습니다. 새로고침해주세요.'
          actions={
            <Button variant='primary' onClick={() => window.location.reload()}>
              새로고침
            </Button>
          }
        />
      );
    }

    return (
      <Result
        status='error'
        title='화면을 불러오지 못했습니다.'
        description={getErrorMessage(this.state.error)}
        actions={
          <>
            <Button variant='primary' onClick={this.reset}>
              다시 시도
            </Button>
            <Button onClick={this.props.onGoHome}>홈으로</Button>
          </>
        }
      />
    );
  }
}

function RouteErrorBoundaryInner({ children }: { children: ReactNode }) {
  // pathname이 아니라 key를 쓴다: 홈에서 '홈으로'처럼 같은 경로로 이동해도 초기화된다
  const { key } = useLocation();
  const navigateTo = useNavigateTo();
  const { reset, clearReset } = useQueryErrorResetBoundary();

  // 화면을 이동하면 캐시에 에러로 남은 쿼리를 마운트 시 다시 요청하도록 표시한다.
  // reset은 내부 플래그만 바꾸므로 렌더 중에 호출해도 안전하다.
  // (ErrorBoundary도 같은 렌더에서 초기화되므로 새 화면의 쿼리가 이 표시를 보고 마운트된다)
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    reset();
  }

  // 커밋되면 표시를 다시 내린다. 표시가 남아 있는 동안에는 쿼리 에러가
  // 오류 화면으로 올라가지 않는데, 새로 마운트되는 쿼리만 이를 내려 주므로
  // 검색 조건만 바뀌는 화면(같은 컴포넌트 유지)에서는 계속 남아 있게 된다.
  // key가 바뀔 때만이 아니라 매 커밋마다 내린다: transition으로 처리되던 이동 렌더가
  // 커밋되지 않고 버려지면(코드를 받는 중에 뒤로 가기 등) 렌더 중에 켠 표시만 남기 때문이다.
  // (돌아간 곳이 히스토리의 첫 항목이면 다시 렌더되지 않아 남을 수 있다. 다음 이동 때 내려간다)
  useEffect(() => {
    clearReset();
  });

  return (
    <ErrorBoundary
      resetKey={key}
      onReset={reset}
      onGoHome={() => navigateTo(ROUTES.HOME)}
    >
      {children}
    </ErrorBoundary>
  );
}

// 라우트 화면에서 발생한 렌더 에러와 react-query 에러(throwOnError)를 잡아
// 흰 화면 대신 재시도 UI를 보여 준다. '다시 시도' 시 실패한 쿼리를 다시 요청한다.
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      <RouteErrorBoundaryInner>{children}</RouteErrorBoundaryInner>
    </QueryErrorResetBoundary>
  );
}

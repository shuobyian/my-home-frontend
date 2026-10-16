import { Button, Result, Space } from "antd";
import { getErrorMessage } from "apis/lib/error/MyHomeError";
import { Component, ReactNode, useRef } from "react";
import {
  QueryErrorResetBoundary,
  useQueryErrorResetBoundary,
} from "react-query";
import { useLocation, useNavigate } from "react-router-dom";

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
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ) {
    // 이미 오류 화면을 보여 주던 중에 화면을 이동했을 때만 초기화한다.
    // (이동한 화면에서 방금 난 에러를 같은 커밋에서 지우지 않도록 prevState를 확인)
    if (
      prevState.hasError &&
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.props.onReset();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Result
        status='error'
        title='화면을 불러오지 못했습니다.'
        subTitle={getErrorMessage(this.state.error)}
        extra={
          <Space>
            <Button type='primary' onClick={this.reset}>
              다시 시도
            </Button>
            <Button onClick={this.props.onGoHome}>홈으로</Button>
          </Space>
        }
      />
    );
  }
}

function RouteErrorBoundaryInner({ children }: { children: ReactNode }) {
  // pathname이 아니라 key를 쓴다: 홈에서 '홈으로'처럼 같은 경로로 이동해도 초기화된다
  const { key } = useLocation();
  const navigate = useNavigate();
  const { reset } = useQueryErrorResetBoundary();

  // 화면을 이동하면 캐시에 에러로 남은 쿼리를 마운트 시 다시 요청하도록 표시한다.
  // reset은 내부 플래그만 바꾸므로 렌더 중에 호출해도 안전하다.
  const prevKey = useRef(key);
  if (prevKey.current !== key) {
    prevKey.current = key;
    reset();
  }

  return (
    <ErrorBoundary
      resetKey={key}
      onReset={reset}
      onGoHome={() => navigate("/")}
    >
      {children}
    </ErrorBoundary>
  );
}

// 라우트 화면에서 발생한 렌더 에러와 react-query 에러(useErrorBoundary)를 잡아
// 흰 화면 대신 재시도 UI를 보여 준다. '다시 시도' 시 실패한 쿼리를 다시 요청한다.
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      <RouteErrorBoundaryInner>{children}</RouteErrorBoundaryInner>
    </QueryErrorResetBoundary>
  );
}

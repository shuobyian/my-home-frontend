import { Button, Result, Space } from "antd";
import { getErrorMessage } from "apis/lib/error/MyHomeError";
import { Component, ReactNode } from "react";
import { QueryErrorResetBoundary } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
  // 이 값이 바뀌면(라우트 이동) 에러 상태를 초기화한다
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

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
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

// 라우트 화면에서 발생한 렌더 에러와 react-query 에러(useErrorBoundary)를 잡아
// 흰 화면 대신 재시도 UI를 보여 준다. '다시 시도' 시 실패한 쿼리를 다시 요청한다.
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          resetKey={pathname}
          onReset={reset}
          onGoHome={() => navigate("/")}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

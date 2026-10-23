import {
  createContext,
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  use,
  useEffect,
  useState,
} from "react";
import { Button } from "./Button";
import { cx } from "./cx";
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "./icons";
import { Modal } from "./Modal";
import styles from "./UIProvider.module.css";

interface ToastOptions {
  // 같은 key의 알림이 떠 있으면 새로 쌓지 않고 내용을 바꾼다
  key?: string;
  // 초 단위
  duration?: number;
}

type ShowToast = (content: ReactNode, options?: ToastOptions) => void;

interface ConfirmOptions {
  title: ReactNode;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  // Promise를 돌려주면 끝날 때까지 기다린다. 실패하면 열린 채 둔다(알림은 호출부가 한다).
  onOk?: () => void | Promise<unknown>;
  okDisabled?: boolean;
  width?: number;
}

interface AlertOptions {
  status?: "info" | "error";
  title: ReactNode;
  content?: ReactNode;
  okText?: string;
  width?: number;
}

interface UIContextValue {
  toast: { success: ShowToast; error: ShowToast };
  dialogs: {
    confirm: (options: ConfirmOptions) => void;
    alert: (options: AlertOptions) => void;
  };
}

interface Toast {
  id: string;
  type: "success" | "error";
  content: ReactNode;
}

const UIContext = createContext<UIContextValue | null>(null);

interface Dialog {
  id: number;
  node: ReactNode;
}

let seq = 0;

// Provider 하나가 쓰는 API. 렌더와 무관하게 한 번만 만들어 호출부가 effect 의존성에 넣을 수 있다.
function createUI(
  setToasts: Dispatch<SetStateAction<Toast[]>>,
  setDialogs: Dispatch<SetStateAction<Dialog[]>>
) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const show =
    (type: Toast["type"]): ShowToast =>
    (content, { key, duration = 3 } = {}) => {
      const id = key === undefined ? `#${++seq}` : `key:${key}`;
      clearTimeout(timers.get(id));
      timers.set(
        id,
        setTimeout(() => {
          timers.delete(id);
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration * 1000)
      );
      const next = { id, type, content };
      setToasts((prev) =>
        prev.some((toast) => toast.id === id)
          ? prev.map((toast) => (toast.id === id ? next : toast))
          : [...prev, next]
      );
    };

  const open = (render: (close: () => void) => ReactNode) => {
    const id = ++seq;
    const close = () =>
      setDialogs((prev) => prev.filter((dialog) => dialog.id !== id));
    setDialogs((prev) => [...prev, { id, node: render(close) }]);
  };

  const api: UIContextValue = {
    toast: { success: show("success"), error: show("error") },
    dialogs: {
      confirm: (options) =>
        open((close) => <ConfirmDialog {...options} onClose={close} />),
      alert: (options) =>
        open((close) => <AlertDialog {...options} onClose={close} />),
    },
  };
  return { api, timers };
}

// 앱 최상단에 둔다. 알림(토스트)과 확인·안내 대화상자를 띄운다.
export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [{ api, timers }] = useState(() => createUI(setToasts, setDialogs));

  useEffect(() => () => timers.forEach(clearTimeout), [timers]);

  return (
    <UIContext value={api}>
      {children}
      {/* status 역할의 기본값(aria-atomic=true)을 꺼서 새 알림만 읽히게 한다 */}
      <div
        className={styles.toasts}
        role='status'
        aria-live='polite'
        aria-atomic='false'
      >
        {toasts.map(({ id, type, content }) => (
          <div key={id} className={styles.toast}>
            <span className={cx(styles.icon, styles[type])}>
              {type === "success" ? <SuccessIcon /> : <ErrorIcon />}
            </span>
            <span>{content}</span>
          </div>
        ))}
      </div>
      {dialogs.map(({ id, node }) => (
        <Fragment key={id}>{node}</Fragment>
      ))}
    </UIContext>
  );
}

function ConfirmDialog({
  title,
  content,
  okText = "확인",
  cancelText = "취소",
  onOk,
  okDisabled,
  width = 416,
  onClose,
}: ConfirmOptions & { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleOk = () => {
    let result: void | Promise<unknown>;
    try {
      result = onOk?.();
    } catch {
      return;
    }
    if (result instanceof Promise) {
      setLoading(true);
      result.then(onClose, () => setLoading(false));
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open
      width={width}
      dismissible={!loading}
      onClose={onClose}
      title={
        <>
          <span className={cx(styles.icon, styles.warning)}>
            <WarningIcon />
          </span>
          {title}
        </>
      }
      footer={
        <>
          <Button disabled={loading} onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant='primary'
            loading={loading}
            disabled={okDisabled}
            onClick={handleOk}
            // 대화상자의 첫 포커스(antd 기본과 같다)
            // eslint-disable-next-line jsx-a11y-x/no-autofocus
            autoFocus
          >
            {okText}
          </Button>
        </>
      }
    >
      {content}
    </Modal>
  );
}

function AlertDialog({
  status = "info",
  title,
  content,
  okText = "확인",
  width = 416,
  onClose,
}: AlertOptions & { onClose: () => void }) {
  return (
    <Modal
      open
      width={width}
      onClose={onClose}
      title={
        <>
          <span className={cx(styles.icon, styles[status])}>
            {status === "error" ? <ErrorIcon /> : <InfoIcon />}
          </span>
          {title}
        </>
      }
      footer={
        // eslint-disable-next-line jsx-a11y-x/no-autofocus -- 대화상자의 첫 포커스
        <Button variant='primary' onClick={onClose} autoFocus>
          {okText}
        </Button>
      }
    >
      {content}
    </Modal>
  );
}

function useUI(hookName: string) {
  const context = use(UIContext);
  if (!context) {
    throw new Error(`${hookName}는 UIProvider 안에서만 쓸 수 있습니다.`);
  }
  return context;
}

export function useToast() {
  return useUI("useToast").toast;
}

export function useDialogs() {
  return useUI("useDialogs").dialogs;
}

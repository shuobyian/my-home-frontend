import { useEffect, useEffectEvent, useState } from "react";
import { Input, InputProps } from "@/ui";

type DebounceInputProps = InputProps & {
  // 마지막 입력 뒤 onChange를 부르기까지 기다리는 시간(ms)
  delay?: number;
};

// 입력을 멈추고 delay가 지나면 onChange를 부르는 Input. 지우기 버튼도 같은 규칙을 따른다.
// value를 넘기면 바깥에서 값이 바뀔 때(뒤로 가기 등) 입력창을 맞추고, 넘기지 않으면 스스로 값을 갖는다.
export function DebounceInput({
  value,
  onChange,
  delay = 500,
  ...rest
}: DebounceInputProps) {
  const [text, setText] = useState(value ?? "");
  // 바깥과 마지막으로 맞춘 값(알린 값 또는 받은 value)
  const [synced, setSynced] = useState(value ?? "");
  // value가 바뀌었을 때만 비교한다. 알린 값이 돌아온 것이면 입력 중인 글자를 그대로 둔다.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== undefined && value !== synced) {
      setSynced(value);
      setText(value);
    }
  }

  const notify = useEffectEvent((next: string) => {
    setSynced(next);
    onChange?.(next);
  });
  useEffect(() => {
    if (text === synced) return;
    const timer = setTimeout(() => notify(text), delay);
    return () => clearTimeout(timer);
  }, [text, synced, delay]);

  return <Input {...rest} value={text} onChange={setText} />;
}

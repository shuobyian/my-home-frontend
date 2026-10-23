import { ReactNode } from "react";

// 장식용 선 아이콘. 크기는 글자 크기(1em), 색은 글자색을 따른다.
// 뜻을 전해야 하면 감싸는 버튼에 aria-label을 붙인다.
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox='0 0 24 24'
      width='1em'
      height='1em'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      focusable='false'
    >
      {children}
    </svg>
  );
}

export const DeleteIcon = () => (
  <Icon>
    <path d='M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6' />
  </Icon>
);

export const PictureIcon = () => (
  <Icon>
    <rect x='3' y='3' width='18' height='18' rx='2' />
    <circle cx='9' cy='9' r='2' />
    <path d='m21 15-5-5L5 21' />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d='M18 6 6 18M6 6l12 12' />
  </Icon>
);

export const PlusIcon = () => (
  <Icon>
    <path d='M12 5v14M5 12h14' />
  </Icon>
);

export const MinusIcon = () => (
  <Icon>
    <path d='M5 12h14' />
  </Icon>
);

export const ChevronLeftIcon = () => (
  <Icon>
    <path d='m15 18-6-6 6-6' />
  </Icon>
);

export const ChevronRightIcon = () => (
  <Icon>
    <path d='m9 18 6-6-6-6' />
  </Icon>
);

export const EyeIcon = () => (
  <Icon>
    <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' />
    <circle cx='12' cy='12' r='3' />
  </Icon>
);

export const EyeOffIcon = () => (
  <Icon>
    <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' />
    <circle cx='12' cy='12' r='3' />
    <path d='m3 3 18 18' />
  </Icon>
);

export const SuccessIcon = () => (
  <Icon>
    <circle cx='12' cy='12' r='10' />
    <path d='m8 12 3 3 5-6' />
  </Icon>
);

export const ErrorIcon = () => (
  <Icon>
    <circle cx='12' cy='12' r='10' />
    <path d='m15 9-6 6M9 9l6 6' />
  </Icon>
);

export const WarningIcon = () => (
  <Icon>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 7v6M12 17h.01' />
  </Icon>
);

export const InfoIcon = () => (
  <Icon>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 11v6M12 7h.01' />
  </Icon>
);

export const EmptyIcon = () => (
  <Icon>
    <path d='M22 12h-6l-2 3h-4l-2-3H2' />
    <path d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' />
  </Icon>
);

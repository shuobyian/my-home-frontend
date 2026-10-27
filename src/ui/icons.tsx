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

export const HomeIcon = () => (
  <Icon>
    <path d='M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' />
    <path d='M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
  </Icon>
);

export const WalnutIcon = () => (
  <Icon>
    <path d='M12 3c4.6 0 8 3.4 8 8 0 5.2-3.5 10-8 10s-8-4.8-8-10c0-4.6 3.4-8 8-8z' />
    <path d='M12 3c-1.6 3.2 1.6 5.4 0 9s1.6 5.4 0 9' />
  </Icon>
);

export const SlidersIcon = () => (
  <Icon>
    <path d='M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3' />
    <path d='M14 2v4M8 10v4M16 18v4' />
  </Icon>
);

export const CartIcon = () => (
  <Icon>
    <circle cx='8' cy='21' r='1' />
    <circle cx='19' cy='21' r='1' />
    <path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' />
  </Icon>
);

export const LoginIcon = () => (
  <Icon>
    <path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' />
    <path d='m10 17 5-5-5-5M15 12H3' />
  </Icon>
);

export const LogoutIcon = () => (
  <Icon>
    <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
    <path d='m16 17 5-5-5-5M21 12H9' />
  </Icon>
);

export const SpreadsheetIcon = () => (
  <Icon>
    <path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z' />
    <path d='M14 2v4a2 2 0 0 0 2 2h4M8 13h2M14 13h2M8 17h2M14 17h2' />
  </Icon>
);

export const BoxIcon = () => (
  <Icon>
    <path d='m7.5 4.27 9 5.15' />
    <path d='M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
    <path d='m3.3 7 8.7 5 8.7-5M12 22V12' />
  </Icon>
);

export const BackpackIcon = () => (
  <Icon>
    <path d='M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z' />
    <path d='M8 10h8M8 18h8' />
    <path d='M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' />
  </Icon>
);

export const TrendingUpIcon = () => (
  <Icon>
    <path d='M16 7h6v6' />
    <path d='m22 7-8.5 8.5-5-5L2 17' />
  </Icon>
);

export const ArrowUpIcon = () => (
  <Icon>
    <path d='M12 19V5M5 12l7-7 7 7' />
  </Icon>
);

export const ExternalLinkIcon = () => (
  <Icon>
    <path d='M15 3h6v6M10 14 21 3' />
    <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
  </Icon>
);

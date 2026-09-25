import type { SVGProps } from "react";

// 细线图标，代替 emoji；统一 24 格、1.5 线宽、跟随文字颜色
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

export const IconArrowRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 12h15M14 6l6 6-6 6" />
  </Icon>
);

export const IconArrowDown = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4v15M6 14l6 6 6-6" />
  </Icon>
);

export const IconArrowUpRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Icon>
);

export const IconSunrise = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 4v4M5.6 10.6 4.2 9.2M18.4 10.6l1.4-1.4M9.5 6.5 12 4l2.5 2.5" />
  </Icon>
);

export const IconSunset = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 4v4M5.6 10.6 4.2 9.2M18.4 10.6l1.4-1.4M9.5 5.5 12 8l2.5-2.5" />
  </Icon>
);

export const IconCar = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M5 11h14" />
    <circle cx="8" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="16" cy="13.5" r="0.6" fill="currentColor" />
  </Icon>
);

export const IconBed = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01" />
  </Icon>
);

export const IconPause = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 2" />
  </Icon>
);

export const IconAlert = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4 2.8 19h18.4L12 4ZM12 10v4M12 16.8v.2" />
  </Icon>
);

export const IconTrail = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 20c2-3 6-3 7-7s4-5 7-8" strokeDasharray="2.2 2.6" />
    <circle cx="5" cy="20" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="19" cy="5" r="1.2" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconGrip = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" strokeWidth={2.4} />
  </Icon>
);

export const IconMore = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth={2.4} />
  </Icon>
);

export const IconCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const IconClose = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const IconChevronLeft = (props: IconProps) => (
  <Icon {...props}>
    <path d="M15 5 8 12l7 7" />
  </Icon>
);

export const IconChevronRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 5 7 7-7 7" />
  </Icon>
);

export const IconExpand = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" />
  </Icon>
);

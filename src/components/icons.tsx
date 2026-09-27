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

export const IconMenu = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const IconArrowUp = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 20V5M6 10l6-6 6 6" />
  </Icon>
);

// 天气
export const IconSun = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </Icon>
);

export const IconCloudSun = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8.5 4.5v1M3.5 9.5h1M5 6l.7.7M12 6l-.7.7M6.2 11.2A3 3 0 1 1 11 8" />
    <path d="M9 19h9a3 3 0 0 0 .4-6A4.5 4.5 0 0 0 9.8 12 3.5 3.5 0 0 0 9 19Z" />
  </Icon>
);

export const IconCloud = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 10.5 3.75 3.75 0 0 0 7 18Z" />
  </Icon>
);

export const IconFog = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 13a3.75 3.75 0 0 1 0-.5A5.5 5.5 0 0 1 17.6 10a4 4 0 0 1 2.3 3M4 16h16M6 19.5h12" />
  </Icon>
);

export const IconRain = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 15h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 7.5 3.75 3.75 0 0 0 7 15ZM8 18l-1 2.5M12.5 18l-1 2.5M17 18l-1 2.5" />
  </Icon>
);

export const IconSnow = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6l2.5-1.5M9.5 19.5 12 18l2.5 1.5" />
  </Icon>
);

export const IconThunder = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 15a3.75 3.75 0 0 1 0-7.5A5.5 5.5 0 0 1 17.6 7a4 4 0 0 1 .4 8M12.5 12 10 16.5h3.5L11 21" />
  </Icon>
);

// 补给、机票、打印、离线
export const IconFuel = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M3.5 20h12M5 10h9M14 8.5l3 2.5v6.5a1.5 1.5 0 0 0 3 0V9l-2.5-3" />
  </Icon>
);

export const IconBolt = (props: IconProps) => (
  <Icon {...props}>
    <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />
  </Icon>
);

export const IconCart = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 4h2.5l2.2 10.5h10.1L20 7H6.4M9 19.5a.5.5 0 1 0 0-.01M17 19.5a.5.5 0 1 0 0-.01" />
  </Icon>
);

export const IconBowl = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0ZM9 19.5h6M14 11l5-7M11 11l3.5-6.5" />
  </Icon>
);

export const IconPlane = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10.5 13.5 4 12l-1 1.5 6 3 3 6 1.5-1-1.5-6.5 5-5c1.2-1.2 1.6-3.1.8-3.8-.7-.8-2.6-.4-3.8.8l-5 5L2.5 6.5 1 7.5l3 6" />
  </Icon>
);

export const IconPrinter = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v6H7v-6Z" />
  </Icon>
);

export const IconDownload = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </Icon>
);

export const IconWallet = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7.5V18a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9.5a1 1 0 0 0-1-1H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h11M16.5 14.5h.01" />
  </Icon>
);

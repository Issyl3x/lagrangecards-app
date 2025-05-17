
import type { SVGProps } from 'react';

export function EstateFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
      <line x1="12" y1="22" x2="12" y2="17.5"></line>
      <path d="M17 14.5l3-2.5-3-2.5"></path>
      <path d="M7 14.5l-3-2.5 3-2.5"></path>
    </svg>
  );
}

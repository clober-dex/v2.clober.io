import React, { SVGProps } from 'react'

export const CheckDefaultSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 23 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      className="default"
      x="1"
      y="1"
      width="21"
      height="21"
      rx="1"
      stroke="white"
      strokeWidth="2"
    />
  </svg>
)

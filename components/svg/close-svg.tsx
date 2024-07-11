import React, { SVGProps } from 'react'

const CloseSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="12"
    height="13"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 3.46431L13 13.6854"
      className="stroke-gray-500"
      strokeWidth="2.5"
      strokeLinecap="square"
    />
    <path
      d="M13.0002 3.46431L3.00024 13.6854"
      className="stroke-gray-500"
      strokeWidth="2.5"
      strokeLinecap="square"
    />
  </svg>
)

export default CloseSvg

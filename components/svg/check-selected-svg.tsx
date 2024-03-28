import React, { SVGProps } from 'react'

export const CheckSelectedSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 23 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="23" height="23" rx="2" fill="#3B82F6" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.887 5.79037C18.5551 6.28027 18.6995 7.21898 18.2096 7.88702L11.6096 16.887C11.3491 17.2423 10.9455 17.4651 10.506 17.4962C10.0665 17.5274 9.63552 17.3637 9.32749 17.0487L4.92749 12.5487C4.34832 11.9563 4.35899 11.0066 4.95132 10.4275C5.54366 9.8483 6.49334 9.85897 7.07251 10.4513L10.2362 13.6869L15.7904 6.11293C16.2803 5.44489 17.219 5.30047 17.887 5.79037Z"
      fill="white"
    />
  </svg>
)

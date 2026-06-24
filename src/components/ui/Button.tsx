'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
  iconRight?: ReactNode
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  iconRight,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'h-14 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 outline-none'

  const variants = {
    primary:
      'bg-[#003D2D] text-white hover:bg-[#01281E] active:bg-[#003D2D] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#003D2D]/20 hover:shadow-xl hover:shadow-[#003D2D]/30',
    secondary:
      'bg-white text-[#003D2D] border-2 border-[#003D2D] hover:bg-[#003D2D]/5 active:bg-[#003D2D]/10 disabled:opacity-50',
    ghost:
      'bg-transparent text-gray-600 hover:text-[#003D2D] hover:bg-gray-100 disabled:opacity-50',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        children
      )}
      {!isLoading && iconRight && iconRight}
    </button>
  )
}

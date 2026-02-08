import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: string
  size?: "default" | "sm" | "lg"
}

const statusClasses: Record<string, string> = {
  // Conference booking statuses
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'approved': 'bg-green-100 text-green-800 border-green-200',
  'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
  'completed': 'bg-gray-100 text-gray-800 border-gray-200',
  'cancelled': 'bg-red-100 text-red-800 border-red-200',

  // Payment statuses
  'paid': 'bg-green-100 text-green-800 border-green-200',
  'partial': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'unpaid': 'bg-red-100 text-red-800 border-red-200',
  'refunded': 'bg-gray-100 text-gray-800 border-gray-200',

  // Default
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
}

const sizeClasses = {
  default: "px-2.5 py-0.5 text-xs",
  sm: "px-2 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
}

export function StatusBadge({
  className,
  status,
  size = "default",
  children,
  ...props
}: StatusBadgeProps) {
  // Safely get status class with fallback
  const statusClass = statusClasses[status?.toLowerCase() || ''] || statusClasses.default;
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        statusClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {children || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown')}
    </div>
  )
}
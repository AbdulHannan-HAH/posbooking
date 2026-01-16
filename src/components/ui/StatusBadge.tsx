import { cn } from '@/lib/utils';

type Status = 'pending' | 'approved' | 'paid' | 'cancelled' | 'checked_in' | 'checked_out' | 'available' | 'occupied' | 'maintenance';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-pending-light text-pending',
  },
  approved: {
    label: 'Approved',
    className: 'bg-success-light text-success',
  },
  paid: {
    label: 'Paid',
    className: 'bg-success-light text-success',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive',
  },
  checked_in: {
    label: 'Checked In',
    className: 'bg-pool-light text-pool-foreground',
  },
  checked_out: {
    label: 'Checked Out',
    className: 'bg-muted text-muted-foreground',
  },
  available: {
    label: 'Available',
    className: 'bg-success-light text-success',
  },
  occupied: {
    label: 'Occupied',
    className: 'bg-hotel-light text-hotel-foreground',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'bg-warning-light text-warning',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

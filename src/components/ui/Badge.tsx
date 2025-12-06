import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';
import { AppointmentStatus } from '@/types/appointment';

interface BadgeProps {
    status: AppointmentStatus;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className }) => {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
                getStatusColor(status),
                className
            )}
        >
            {status}
        </span>
    );
};

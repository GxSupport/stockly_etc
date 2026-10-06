import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ChartCardProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
    children: ReactNode;
}

/**
 * Dashboard bloklari uchun umumiy oq kartochka: sarlavha + kontent.
 */
export function ChartCard({ title, subtitle, action, className, children }: ChartCardProps) {
    return (
        <section className={cn('flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs', className)}>
            <header className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-sm font-semibold">{title}</h2>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                {action}
            </header>
            <div className="flex-1">{children}</div>
        </section>
    );
}

export function ChartEmpty({ message = 'Нет данных' }: { message?: string }) {
    return <div className="flex h-full min-h-40 items-center justify-center text-sm text-muted-foreground">{message}</div>;
}

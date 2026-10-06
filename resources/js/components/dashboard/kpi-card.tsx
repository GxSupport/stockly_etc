import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type KpiTone = 'blue' | 'emerald' | 'slate' | 'violet' | 'sky' | 'lime' | 'cyan' | 'amber' | 'rose';

const toneClasses: Record<KpiTone, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    slate: 'bg-slate-100 text-slate-500 dark:bg-slate-500/20 dark:text-slate-300',
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    lime: 'bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
};

const highlightClasses = {
    warning: 'border-amber-300 ring-1 ring-amber-200 dark:border-amber-700 dark:ring-amber-900',
    danger: 'border-red-300 ring-1 ring-red-200 dark:border-red-800 dark:ring-red-950',
};

interface KpiCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    tone?: KpiTone;
    description?: string;
    href?: string;
    highlight?: keyof typeof highlightClasses | false;
}

/**
 * Dashboard'ning yuqori qatoridagi ko'rsatkich kartochkasi: katta harfli sarlavha, katta raqam va rangli ikonka.
 */
export function KpiCard({ label, value, icon: Icon, tone = 'blue', description, href, highlight = false }: KpiCardProps) {
    const content = (
        <div
            className={cn(
                'flex h-full items-start justify-between gap-3 rounded-2xl border bg-card p-4 shadow-xs transition-all sm:p-5',
                href && 'group-hover:-translate-y-0.5 group-hover:border-primary/20 group-hover:shadow-md',
                highlight && highlightClasses[highlight],
            )}
        >
            <div className="flex min-w-0 flex-col gap-2">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</span>
                <span className="text-2xl leading-none font-bold tracking-tight sm:text-3xl">
                    {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
                </span>
                {description && <span className="text-xs text-muted-foreground">{description}</span>}
            </div>
            <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-11', toneClasses[tone])}>
                <Icon className="size-5" strokeWidth={1.75} />
            </div>
        </div>
    );

    if (!href) {
        return content;
    }

    return (
        <Link href={href} className="group block rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            {content}
        </Link>
    );
}

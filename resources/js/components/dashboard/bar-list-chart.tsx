import { ChartEmpty } from '@/components/dashboard/chart-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';

export interface BarListItem {
    key: string | number;
    label: string;
    value: number;
    href?: string;
}

interface BarListChartProps {
    items: BarListItem[];
    /** Shundan ortiq qatorlar «Другие» ga yig'iladi */
    maxItems?: number;
    unit?: string;
    emptyMessage?: string;
}

const GRID_STEPS = [0.25, 0.5, 0.75, 1];

function foldItems(items: BarListItem[], maxItems: number): BarListItem[] {
    const sorted = [...items].filter((item) => item.value > 0).sort((a, b) => b.value - a.value);

    if (sorted.length <= maxItems) {
        return sorted;
    }

    const rest = sorted.slice(maxItems - 1);

    return [...sorted.slice(0, maxItems - 1), { key: '__other', label: 'Другие', value: rest.reduce((sum, item) => sum + item.value, 0) }];
}

/**
 * Gorizontal bar diagramma — kategoriyalar bo'yicha miqdorni solishtirish uchun (bitta seriya, bitta rang).
 */
export function BarListChart({ items, maxItems = 10, unit = '', emptyMessage }: BarListChartProps) {
    const rows = foldItems(items, maxItems);

    if (rows.length === 0) {
        return <ChartEmpty message={emptyMessage} />;
    }

    const max = rows[0].value;
    const total = rows.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="grid grid-cols-[minmax(6rem,11rem)_1fr] items-center gap-x-3 gap-y-0.5">
            {rows.map((row) => {
                const share = total > 0 ? Math.round((row.value / total) * 100) : 0;
                const bar = (
                    <div className="group/bar flex h-8 items-center gap-2">
                        <div className="relative h-full flex-1">
                            {GRID_STEPS.map((step) => (
                                <span
                                    key={step}
                                    aria-hidden
                                    className="absolute inset-y-0 border-l border-dashed border-[var(--viz-grid)]"
                                    style={{ left: `${step * 100}%` }}
                                />
                            ))}
                            <span aria-hidden className="absolute inset-y-0 left-0 border-l border-[var(--viz-grid)]" />
                            <span
                                className="absolute inset-y-2 left-0 rounded-r-[4px] bg-[var(--viz-1)] transition-opacity group-hover/bar:opacity-80"
                                style={{ width: `max(${(row.value / max) * 100}%, 4px)` }}
                            />
                        </div>
                        <span className="w-10 text-xs font-medium tabular-nums">{row.value}</span>
                    </div>
                );

                return (
                    <div key={row.key} className="contents">
                        <span className="truncate text-right text-xs text-muted-foreground" title={row.label}>
                            {row.label}
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {row.href ? (
                                    <Link
                                        href={row.href}
                                        className="block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        {bar}
                                    </Link>
                                ) : (
                                    <div tabIndex={0} className="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                                        {bar}
                                    </div>
                                )}
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <div className="font-medium">{row.label}</div>
                                <div className="tabular-nums">
                                    {row.value}
                                    {unit} · {share}%
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            })}
        </div>
    );
}

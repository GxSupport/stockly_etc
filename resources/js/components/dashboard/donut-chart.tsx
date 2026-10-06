import { ChartEmpty } from '@/components/dashboard/chart-card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export interface DonutSegment {
    key: string;
    label: string;
    value: number;
    /** CSS rang, masalan `var(--viz-1)` */
    color: string;
    href?: string;
}

interface DonutChartProps {
    segments: DonutSegment[];
    centerLabel?: string;
    emptyMessage?: string;
}

/** Kategorik ranglar qat'iy tartibda — 8 dan ortig'i «Другие» ga yig'iladi */
export const CATEGORICAL_COLORS = Array.from({ length: 8 }, (_, index) => `var(--viz-${index + 1})`);

const RADIUS = 42;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 1.2;

/**
 * Ulushlarni ko'rsatuvchi donut diagramma: markazda jami, ostida legenda.
 * Segment yoki legenda qatori ustiga kelinsa, markazda shu segment qiymati chiqadi.
 */
export function DonutChart({ segments, centerLabel = 'Всего', emptyMessage }: DonutChartProps) {
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const visible = segments.filter((segment) => segment.value > 0);
    const total = visible.reduce((sum, segment) => sum + segment.value, 0);

    if (total === 0) {
        return <ChartEmpty message={emptyMessage} />;
    }

    const active = visible.find((segment) => segment.key === activeKey) ?? null;
    const gap = visible.length > 1 ? GAP : 0;

    let offset = 0;
    const arcs = visible.map((segment) => {
        const length = (segment.value / total) * CIRCUMFERENCE;
        const arc = { segment, dash: Math.max(length - gap, 0.5), offset };
        offset += length;

        return arc;
    });

    return (
        <div className="flex flex-col items-center gap-5">
            <div className="relative size-44">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={`${centerLabel}: ${total}`}>
                    {arcs.map(({ segment, dash, offset: arcOffset }) => (
                        <circle
                            key={segment.key}
                            cx="50"
                            cy="50"
                            r={RADIUS}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={active?.key === segment.key ? STROKE + 2 : STROKE}
                            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                            strokeDashoffset={-arcOffset}
                            className={cn('cursor-pointer transition-all', active && active.key !== segment.key && 'opacity-35')}
                            onMouseEnter={() => setActiveKey(segment.key)}
                            onMouseLeave={() => setActiveKey(null)}
                        >
                            <title>{`${segment.label}: ${segment.value}`}</title>
                        </circle>
                    ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <span className="text-3xl leading-none font-bold tabular-nums">{active ? active.value : total}</span>
                    <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {active ? `${active.label} · ${Math.round((active.value / total) * 100)}%` : centerLabel}
                    </span>
                </div>
            </div>

            <ul className="flex w-full flex-col gap-1">
                {visible.map((segment) => {
                    const row = (
                        <>
                            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                            <span className="flex-1 truncate text-sm">{segment.label}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">{Math.round((segment.value / total) * 100)}%</span>
                            <span className="w-10 text-right text-sm font-semibold tabular-nums">{segment.value}</span>
                        </>
                    );
                    const rowClassName = cn(
                        'flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60',
                        active?.key === segment.key && 'bg-muted/60',
                    );

                    return (
                        <li key={segment.key} onMouseEnter={() => setActiveKey(segment.key)} onMouseLeave={() => setActiveKey(null)}>
                            {segment.href ? (
                                <Link href={segment.href} className={rowClassName}>
                                    {row}
                                </Link>
                            ) : (
                                <div className={rowClassName}>{row}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/**
 * Kategoriyalar ro'yxatini donut segmentlariga aylantiradi: ranglar kelgan tartib bo'yicha beriladi,
 * 8-dan keyingilari «Другие» ga yig'iladi.
 */
export function toCategoricalSegments(items: Array<{ key: string; label: string; value: number }>): DonutSegment[] {
    const sorted = items.filter((item) => item.value > 0);
    const head = sorted.length > CATEGORICAL_COLORS.length ? sorted.slice(0, CATEGORICAL_COLORS.length - 1) : sorted;
    const rest = sorted.slice(head.length);

    const segments = head.map((item, index) => ({ ...item, color: CATEGORICAL_COLORS[index] }));

    if (rest.length > 0) {
        segments.push({
            key: '__other',
            label: 'Другие',
            value: rest.reduce((sum, item) => sum + item.value, 0),
            color: 'var(--viz-neutral)',
        });
    }

    return segments;
}

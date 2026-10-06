import { BarListChart } from '@/components/dashboard/bar-list-chart';
import { ChartCard } from '@/components/dashboard/chart-card';
import { DonutChart, toCategoricalSegments, type DonutSegment } from '@/components/dashboard/donut-chart';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type {
    AdminStats,
    BreadcrumbItem,
    BuxgalterStats,
    DashboardDocument,
    DashboardPageProps,
    DashboardStatusBreakdown,
    DashboardTypeCount,
    DeputyDirectorStats,
    DirectorStats,
    FrpStats,
    HeaderFrpStats,
    SharedData,
} from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    Building2,
    CalendarCheck,
    CheckCircle2,
    Clock,
    FilePen,
    FileStack,
    FileText,
    Hourglass,
    RotateCcw,
    Send,
    UserCheck,
    UserPlus,
    Users,
    UserX,
    Warehouse,
    XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

/** АКТ ro'yxatining «Входящие» qamrovi — dashboard kartochkalari shu ro'yxatga olib boradi */
const INCOMING_URL = '/documents/sent?scope=incoming';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

function formatAmount(amount: number): string {
    return (
        new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount) + ' сум'
    );
}

function greeting(): string {
    const hour = new Date().getHours();

    if (hour < 5 || hour >= 18) {
        return 'Добрый вечер';
    }

    return hour < 12 ? 'Доброе утро' : 'Добрый день';
}

type StatusLinks = Partial<Record<'draft' | 'sent' | 'returned' | 'finished', string>>;

/**
 * Hujjat holatlarini donut segmentlariga aylantiradi. Holat ranglari kategorik ranglardan alohida.
 */
function statusSegments(breakdown: DashboardStatusBreakdown, links: StatusLinks = {}): DonutSegment[] {
    return [
        { key: 'draft', label: 'Черновики', value: breakdown.draft, color: 'var(--viz-neutral)', href: links.draft },
        { key: 'sent', label: 'В процессе', value: breakdown.sent, color: 'var(--viz-1)', href: links.sent },
        { key: 'returned', label: 'Возвращены', value: breakdown.returned, color: 'var(--viz-critical)', href: links.returned },
        { key: 'finished', label: 'Завершены', value: breakdown.finished, color: 'var(--viz-good)', href: links.finished },
    ];
}

function typeBars(items: DashboardTypeCount[]) {
    return items.map((item) => ({ key: item.type, label: item.title, value: item.count }));
}

function KpiGrid({ children, columns = 4 }: { children: ReactNode; columns?: 3 | 4 | 5 }) {
    return (
        <div
            className={cn(
                'grid grid-cols-2 gap-3 sm:gap-4',
                columns === 3 && 'lg:grid-cols-3',
                columns === 4 && 'lg:grid-cols-4',
                columns === 5 && 'lg:grid-cols-3 xl:grid-cols-5',
            )}
        >
            {children}
        </div>
    );
}

function DocumentStatusBadge({ doc }: { doc: DashboardDocument }) {
    if (doc.is_finished) {
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Завершён</Badge>;
    }
    if (doc.is_returned) {
        return <Badge variant="destructive">Возвращён</Badge>;
    }
    if (doc.is_draft) {
        return <Badge variant="secondary">Черновик</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">В процессе</Badge>;
}

function DocumentMiniTable({ documents, title, href }: { documents: DashboardDocument[]; title: string; href?: string }) {
    return (
        <ChartCard
            title={title}
            action={
                href && documents.length > 0 ? (
                    <Link href={href} className="text-xs font-medium text-primary hover:underline">
                        Все →
                    </Link>
                ) : undefined
            }
        >
            {documents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Нет документов</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Документ</TableHead>
                            <TableHead className="text-right">Сумма</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Дата</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc) => (
                            <TableRow key={doc.id} className="cursor-pointer" onClick={() => router.visit(`/documents/${doc.id}`)}>
                                <TableCell className="max-w-56">
                                    <div className="truncate font-medium">{doc.number}</div>
                                    <div className="truncate text-xs text-muted-foreground">{doc.type_title}</div>
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap tabular-nums">{formatAmount(doc.total_amount)}</TableCell>
                                <TableCell>
                                    <DocumentStatusBadge doc={doc} />
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap text-muted-foreground tabular-nums">{doc.created_at}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </ChartCard>
    );
}

// ==================== ADMIN DASHBOARD ====================

function AdminDashboard({ stats }: { stats: AdminStats }) {
    return (
        <>
            <KpiGrid>
                <KpiCard
                    label="Пользователи"
                    value={stats.users.total}
                    description={`Активных: ${stats.users.active}`}
                    icon={UserCheck}
                    tone="blue"
                    href="/employees"
                />
                <KpiCard label="Новых за месяц" value={stats.users.new_this_month} icon={UserPlus} tone="emerald" href="/employees" />
                <KpiCard label="Неактивные" value={stats.users.inactive} icon={UserX} tone="slate" href="/employees" />
                <KpiCard label="Отделы" value={stats.system.departments} icon={Building2} tone="violet" href="/departments" />
                <KpiCard label="Склады" value={stats.system.warehouses} icon={Warehouse} tone="sky" href="/warehouses" />
                <KpiCard label="Типы документов" value={stats.system.document_types} icon={FileStack} tone="lime" href="/document-types" />
                <KpiCard
                    label="Всего документов"
                    value={stats.documents.total}
                    description={`За месяц: ${stats.documents.this_month}`}
                    icon={FileText}
                    tone="cyan"
                />
                <KpiCard label="Завершено" value={stats.documents.finished} icon={CalendarCheck} tone="amber" />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard title="Документы по типам" className="lg:col-span-2">
                    <BarListChart items={typeBars(stats.documents_by_type)} emptyMessage="Документов пока нет" />
                </ChartCard>
                <ChartCard title="Пользователи по ролям">
                    <DonutChart
                        centerLabel="Пользователей"
                        segments={toCategoricalSegments(stats.users_by_role.map((role) => ({ key: role.type, label: role.name, value: role.count })))}
                    />
                </ChartCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard title="Состояние документов">
                    <DonutChart centerLabel="Документов" segments={statusSegments(stats.documents)} emptyMessage="Документов пока нет" />
                </ChartCard>
                <ChartCard
                    title="Последние пользователи"
                    className="lg:col-span-2"
                    action={
                        <Link href="/employees" className="text-xs font-medium text-primary hover:underline">
                            Все →
                        </Link>
                    }
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Имя</TableHead>
                                <TableHead>Телефон</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead>Дата</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.recent_users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell className="tabular-nums">{user.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.role?.name ?? user.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground tabular-nums">
                                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ChartCard>
            </div>
        </>
    );
}

// ==================== DIRECTOR DASHBOARD ====================

function DirectorDashboard({ stats }: { stats: DirectorStats }) {
    return (
        <>
            <KpiGrid>
                <KpiCard
                    label="Ожидают утверждения"
                    value={stats.awaiting_approval.count}
                    icon={Clock}
                    tone="amber"
                    highlight={stats.awaiting_approval.count > 0 && 'warning'}
                    href={INCOMING_URL}
                />
                <KpiCard
                    label="Всего документов"
                    value={stats.documents_total.total}
                    description={`За месяц: ${stats.documents_total.this_month}`}
                    icon={FileText}
                    tone="blue"
                    href={INCOMING_URL}
                />
                <KpiCard
                    label="Завершено"
                    value={stats.documents_total.finished}
                    icon={CheckCircle2}
                    tone="emerald"
                    href={`${INCOMING_URL}&is_finished=1`}
                />
                <KpiCard label="Возвращено" value={stats.returned_count} icon={RotateCcw} tone="rose" />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard title="Документы по типам" className="lg:col-span-2">
                    <BarListChart items={typeBars(stats.documents_by_type)} emptyMessage="Документов пока нет" />
                </ChartCard>
                <ChartCard title="Документы по статусам">
                    <DonutChart
                        centerLabel="Документов"
                        segments={statusSegments(stats.documents_status, {
                            sent: `${INCOMING_URL}&is_finished=0`,
                            finished: `${INCOMING_URL}&is_finished=1`,
                        })}
                    />
                </ChartCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <DocumentMiniTable title="Ожидают вашего утверждения" documents={stats.awaiting_approval.documents} href={INCOMING_URL} />
                <DocumentMiniTable title="Последние завершённые" documents={stats.recently_finished} href={`${INCOMING_URL}&is_finished=1`} />
            </div>
        </>
    );
}

// ==================== DEPUTY DIRECTOR DASHBOARD ====================

function DeputyDirectorDashboard({ stats }: { stats: DeputyDirectorStats }) {
    return (
        <>
            <KpiGrid>
                <KpiCard
                    label="Ожидают утверждения"
                    value={stats.awaiting_approval.count}
                    icon={Clock}
                    tone="amber"
                    highlight={stats.awaiting_approval.count > 0 && 'warning'}
                    href={INCOMING_URL}
                />
                <KpiCard label="Всего утверждено" value={stats.total_approved} icon={CheckCircle2} tone="emerald" href={INCOMING_URL} />
                <KpiCard label="Утверждено за месяц" value={stats.approved_this_month} icon={CalendarCheck} tone="blue" href={INCOMING_URL} />
                <KpiCard label="Возвращено" value={stats.returned_count} icon={RotateCcw} tone="rose" href="/documents/return" />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard title="Утверждённые документы по типам" className="lg:col-span-2">
                    <BarListChart items={typeBars(stats.approved_by_type)} emptyMessage="Вы ещё не утверждали документы" />
                </ChartCard>
                <ChartCard title="Мои решения">
                    <DonutChart
                        centerLabel="Документов"
                        segments={[
                            { key: 'approved', label: 'Утверждено', value: stats.total_approved, color: 'var(--viz-good)', href: INCOMING_URL },
                            {
                                key: 'awaiting',
                                label: 'Ожидают',
                                value: stats.awaiting_approval.count,
                                color: 'var(--viz-warning)',
                                href: INCOMING_URL,
                            },
                            {
                                key: 'returned',
                                label: 'Возвращено',
                                value: stats.returned_count,
                                color: 'var(--viz-critical)',
                                href: '/documents/return',
                            },
                        ]}
                    />
                </ChartCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <DocumentMiniTable title="Ожидают вашего утверждения" documents={stats.awaiting_approval.documents} href={INCOMING_URL} />
                <DocumentMiniTable title="Последние обработанные" documents={stats.recently_processed} />
            </div>
        </>
    );
}

// ==================== BUXGALTER DASHBOARD ====================

function BuxgalterDashboard({ stats }: { stats: BuxgalterStats }) {
    return (
        <>
            <KpiGrid>
                <KpiCard
                    label="Ожидают обработки"
                    value={stats.awaiting_approval.count}
                    icon={Clock}
                    tone="amber"
                    highlight={stats.awaiting_approval.count > 0 && 'warning'}
                    href={INCOMING_URL}
                />
                <KpiCard
                    label="Всего обработано"
                    value={stats.total_processed}
                    icon={CheckCircle2}
                    tone="emerald"
                    href={`${INCOMING_URL}&is_finished=1`}
                />
                <KpiCard label="Сумма завершённых" value={formatAmount(stats.financial_summary.finished_amount)} icon={Banknote} tone="violet" />
                <KpiCard label="Сумма в процессе" value={formatAmount(stats.financial_summary.in_progress_amount)} icon={Hourglass} tone="sky" />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard title="Документы по типам" className="lg:col-span-2">
                    <BarListChart items={typeBars(stats.documents_by_type)} emptyMessage="Документов пока нет" />
                </ChartCard>
                <ChartCard title="Документы по статусам">
                    <DonutChart
                        centerLabel="Документов"
                        segments={statusSegments(stats.documents_status, {
                            sent: `${INCOMING_URL}&is_finished=0`,
                            finished: `${INCOMING_URL}&is_finished=1`,
                        })}
                    />
                </ChartCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <DocumentMiniTable title="Ожидают вашей обработки" documents={stats.awaiting_approval.documents} href={INCOMING_URL} />
                <DocumentMiniTable title="Последние завершённые" documents={stats.recently_finished} href={`${INCOMING_URL}&is_finished=1`} />
            </div>
        </>
    );
}

// ==================== HEADER FRP DASHBOARD ====================

function HeaderFrpDashboard({ stats }: { stats: HeaderFrpStats }) {
    return (
        <>
            <KpiGrid>
                <KpiCard
                    label="Ожидают утверждения"
                    value={stats.awaiting_approval.count}
                    icon={Clock}
                    tone="amber"
                    highlight={stats.awaiting_approval.count > 0 && 'warning'}
                    href={INCOMING_URL}
                />
                <KpiCard
                    label="Документы команды"
                    value={stats.team_documents.total}
                    description={`Завершено: ${stats.team_documents.finished}`}
                    icon={Users}
                    tone="blue"
                    href={INCOMING_URL}
                />
                <KpiCard
                    label="Мои документы"
                    value={stats.own_documents.total}
                    description={`Черновики: ${stats.own_documents.draft}`}
                    icon={FileText}
                    tone="violet"
                    href="/documents/sent?scope=mine"
                />
                <KpiCard
                    label="Возвращённые (команда)"
                    value={stats.team_documents.returned}
                    icon={RotateCcw}
                    tone="rose"
                    highlight={stats.team_documents.returned > 0 && 'danger'}
                    href="/documents/return"
                />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard
                    title="Документы по членам команды"
                    subtitle="Нажмите на строку, чтобы открыть документы сотрудника"
                    className="lg:col-span-2"
                >
                    <BarListChart
                        items={stats.team_members.map((member) => ({
                            key: member.id,
                            label: member.name,
                            value: member.documents_count,
                            href: `${INCOMING_URL}&author=${member.id}`,
                        }))}
                        emptyMessage={stats.team_members.length === 0 ? 'Нет подчинённых' : 'У команды пока нет документов'}
                    />
                </ChartCard>
                <ChartCard title="Документы команды по статусам">
                    <DonutChart
                        centerLabel="Документов"
                        segments={statusSegments(stats.team_documents, {
                            sent: `${INCOMING_URL}&is_finished=0`,
                            returned: '/documents/return',
                            finished: `${INCOMING_URL}&is_finished=1`,
                        })}
                        emptyMessage="У команды пока нет документов"
                    />
                </ChartCard>
            </div>

            <DocumentMiniTable title="Ожидают вашего утверждения" documents={stats.awaiting_approval.documents} href={INCOMING_URL} />
        </>
    );
}

// ==================== FRP DASHBOARD ====================

function FrpDashboard({ stats }: { stats: FrpStats }) {
    return (
        <>
            <KpiGrid columns={5}>
                <KpiCard label="Документы" value={stats.own_documents.total} icon={FileText} tone="blue" href="/documents/sent" />
                <KpiCard label="Черновики" value={stats.own_documents.draft} icon={FilePen} tone="slate" href="/documents/draft" />
                <KpiCard label="В процессе" value={stats.own_documents.sent} icon={Send} tone="sky" href="/documents/sent?is_finished=0" />
                <KpiCard
                    label="Возвращены"
                    value={stats.own_documents.returned}
                    icon={RotateCcw}
                    tone="rose"
                    highlight={stats.own_documents.returned > 0 && 'danger'}
                    href="/documents/return"
                />
                <KpiCard
                    label="Завершены"
                    value={stats.own_documents.finished}
                    icon={CheckCircle2}
                    tone="emerald"
                    href="/documents/sent?is_finished=1"
                />
            </KpiGrid>

            {stats.awaiting_approval.count > 0 && (
                <KpiCard
                    label="Ожидают вашего подтверждения"
                    value={stats.awaiting_approval.count}
                    description="Акты, назначенные вам на приём"
                    icon={Clock}
                    tone="amber"
                    highlight="warning"
                    href="/documents/incoming"
                />
            )}

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard title="Мои документы по типам" className="lg:col-span-2">
                    <BarListChart items={typeBars(stats.documents_by_type)} emptyMessage="У вас пока нет документов" />
                </ChartCard>
                <ChartCard title="Мои документы по статусам">
                    <DonutChart
                        centerLabel="Документов"
                        segments={statusSegments(stats.own_documents, {
                            draft: '/documents/draft',
                            sent: '/documents/sent?is_finished=0',
                            returned: '/documents/return',
                            finished: '/documents/sent?is_finished=1',
                        })}
                        emptyMessage="У вас пока нет документов"
                    />
                </ChartCard>
            </div>

            {stats.awaiting_approval.count > 0 && (
                <DocumentMiniTable title="Ожидают вашего подтверждения" documents={stats.awaiting_approval.documents} href="/documents/incoming" />
            )}

            <div className="grid gap-4 xl:grid-cols-2">
                <DocumentMiniTable title="Последние документы" documents={stats.recent_documents} href="/documents/sent" />
                <DocumentMiniTable title="Возвращённые документы" documents={stats.pending_returns} href="/documents/return" />
            </div>
        </>
    );
}

// ==================== EMPTY DASHBOARD ====================

function EmptyDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-2 py-8">
                    <XCircle className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Для вашей роли панель не настроена</p>
                </div>
            </CardContent>
        </Card>
    );
}

// ==================== MAIN COMPONENT ====================

function DashboardHeader({ name, roleName, warehouse }: { name: string; roleName: string | null; warehouse?: string | null }) {
    const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-xl font-semibold tracking-tight">
                    {greeting()}, {name.split(' ')[0]}!
                </h1>
                <p className="text-sm text-muted-foreground">{[roleName, warehouse && `Склад: ${warehouse}`].filter(Boolean).join(' · ')}</p>
            </div>
            <p className="text-sm text-muted-foreground first-letter:uppercase">{today}</p>
        </div>
    );
}

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const { stats, userRole, roleName } = usePage<SharedData & DashboardPageProps>().props;
    const showModal = !auth.user.chat_id;

    const { data, setData, put, processing, errors } = useForm({
        chat_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/user/chat-id');
    };

    const frpWarehouse = userRole === 'frp' ? (stats as FrpStats).warehouse?.warehouse : null;
    const warehouseLabel = frpWarehouse ? `${frpWarehouse.title}${frpWarehouse.code ? ` (${frpWarehouse.code})` : ''}` : null;

    const renderDashboard = () => {
        switch (userRole) {
            case 'admin':
                return <AdminDashboard stats={stats as AdminStats} />;
            case 'director':
                return <DirectorDashboard stats={stats as DirectorStats} />;
            case 'deputy_director':
                return <DeputyDirectorDashboard stats={stats as DeputyDirectorStats} />;
            case 'buxgalter':
                return <BuxgalterDashboard stats={stats as BuxgalterStats} />;
            case 'header_frp':
                return <HeaderFrpDashboard stats={stats as HeaderFrpStats} />;
            case 'frp':
                return <FrpDashboard stats={stats as FrpStats} />;
            default:
                return <EmptyDashboard />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <Dialog open={showModal}>
                <DialogContent
                    className="sm:max-w-md [&>button]:hidden"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Telegram ID talab qilinadi</DialogTitle>
                        <DialogDescription>Tizimdan foydalanish uchun Telegram ID raqamingizni kiriting.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                        1
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        Telegram botiga o'ting va <strong>/start</strong> bosing
                                    </p>
                                </div>

                                <div className="ml-9">
                                    <Button variant="outline" asChild>
                                        <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer">
                                            <TelegramIcon className="h-4 w-4" />
                                            Telegramga o'tish
                                        </a>
                                    </Button>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                        2
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        Bot sizga ID raqamingizni ko'rsatadi. Uni nusxalab, quyidagi maydonga kiriting.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="chat_id">Telegram ID</Label>
                                <Input
                                    id="chat_id"
                                    type="text"
                                    placeholder="Masalan: 123456789"
                                    value={data.chat_id}
                                    onChange={(e) => setData('chat_id', e.target.value)}
                                />
                                {errors.chat_id && <p className="text-sm text-destructive">{errors.chat_id}</p>}
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="submit" disabled={processing || !data.chat_id.trim()}>
                                {processing ? 'Saqlanmoqda...' : 'Saqlash'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto bg-muted/40 p-4 md:p-6 dark:bg-transparent">
                <DashboardHeader name={auth.user.name} roleName={roleName} warehouse={warehouseLabel} />
                {renderDashboard()}
            </div>
        </AppLayout>
    );
}

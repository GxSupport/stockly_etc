import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type {
    AdminStats,
    BreadcrumbItem,
    BuxgalterStats,
    DashboardDocument,
    DashboardPageProps,
    DeputyDirectorStats,
    DirectorStats,
    FrpStats,
    HeaderFrpStats,
    SharedData,
} from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Building2, CheckCircle2, Clock, FileText, Package, RotateCcw, Send, Users, Warehouse, XCircle } from 'lucide-react';

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

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

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    className,
}: {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    className?: string;
}) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
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

function DocumentMiniTable({ documents, title }: { documents: DashboardDocument[]; title: string }) {
    if (!documents || documents.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Нет документов</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>№</TableHead>
                            <TableHead>Тип</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Дата</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc) => (
                            <TableRow key={doc.id} className="cursor-pointer" onClick={() => router.visit(`/documents/${doc.id}`)}>
                                <TableCell className="font-medium">{doc.number}</TableCell>
                                <TableCell>{doc.type_title}</TableCell>
                                <TableCell>{formatAmount(doc.total_amount)}</TableCell>
                                <TableCell>
                                    <DocumentStatusBadge doc={doc} />
                                </TableCell>
                                <TableCell>{doc.created_at}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ==================== ADMIN DASHBOARD ====================

function AdminDashboard({ stats }: { stats: AdminStats }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Всего пользователей" value={stats.users.total} description={`Активных: ${stats.users.active}`} icon={Users} />
                <StatCard
                    title="Всего документов"
                    value={stats.documents.total}
                    description={`Завершено: ${stats.documents.finished}`}
                    icon={FileText}
                />
                <StatCard title="Склады" value={stats.system.warehouses} icon={Warehouse} />
                <StatCard
                    title="Отделы"
                    value={stats.system.departments}
                    description={`Типов документов: ${stats.system.document_types}`}
                    icon={Building2}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Пользователи по ролям</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.users_by_role.map((role) => (
                                <div key={role.type} className="flex items-center justify-between">
                                    <span className="text-sm">{role.name}</span>
                                    <Badge variant="secondary">{role.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Состояние документов</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-muted-foreground" /> Черновики
                                </span>
                                <Badge variant="secondary">{stats.documents.draft}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm">
                                    <Send className="h-4 w-4 text-blue-500" /> Отправлены
                                </span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{stats.documents.sent}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm">
                                    <RotateCcw className="h-4 w-4 text-red-500" /> Возвращены
                                </span>
                                <Badge variant="destructive">{stats.documents.returned}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Завершены
                                </span>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    {stats.documents.finished}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Последние пользователи</CardTitle>
                </CardHeader>
                <CardContent>
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
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.role?.name ?? user.type}</Badge>
                                    </TableCell>
                                    <TableCell>{user.created_at}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// ==================== DIRECTOR DASHBOARD ====================

function DirectorDashboard({ stats }: { stats: DirectorStats }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Ожидают утверждения"
                    value={stats.awaiting_approval.count}
                    icon={Clock}
                    className={stats.awaiting_approval.count > 0 ? 'border-amber-300 dark:border-amber-700' : ''}
                />
                <StatCard
                    title="Всего документов"
                    value={stats.documents_total.total}
                    description={`В процессе: ${stats.documents_total.in_progress}`}
                    icon={FileText}
                />
                <StatCard title="Завершено" value={stats.documents_total.finished} icon={CheckCircle2} />
                <StatCard title="Возвращено" value={stats.returned_count} icon={RotateCcw} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <DocumentMiniTable title="Ожидают вашего утверждения" documents={stats.awaiting_approval.documents} />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Документы по типам</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.documents_by_type.map((item) => (
                                <div key={item.type} className="flex items-center justify-between">
                                    <span className="text-sm">{item.title}</span>
                                    <Badge variant="secondary">{item.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DocumentMiniTable title="Последние завершённые документы" documents={stats.recently_finished} />
        </div>
    );
}

// ==================== DEPUTY DIRECTOR DASHBOARD ====================

function DeputyDirectorDashboard({ stats }: { stats: DeputyDirectorStats }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Ожидают утверждения"
                    value={stats.awaiting_approval.count}
                    icon={Clock}
                    className={stats.awaiting_approval.count > 0 ? 'border-amber-300 dark:border-amber-700' : ''}
                />
                <StatCard title="Всего утверждено" value={stats.total_approved} icon={CheckCircle2} />
                <StatCard title="Возвращено" value={stats.returned_count} icon={RotateCcw} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <DocumentMiniTable title="Ожидают вашего утверждения" documents={stats.awaiting_approval.documents} />
                <DocumentMiniTable title="Последние обработанные" documents={stats.recently_processed} />
            </div>
        </div>
    );
}

// ==================== BUXGALTER DASHBOARD ====================

function BuxgalterDashboard({ stats }: { stats: BuxgalterStats }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Ожидают обработки"
                    value={stats.awaiting_approval.count}
                    icon={Clock}
                    className={stats.awaiting_approval.count > 0 ? 'border-amber-300 dark:border-amber-700' : ''}
                />
                <StatCard title="Всего обработано" value={stats.total_processed} icon={CheckCircle2} />
                <StatCard title="Завершённые (сумма)" value={formatAmount(stats.financial_summary.finished_amount)} icon={Package} />
                <StatCard title="В процессе (сумма)" value={formatAmount(stats.financial_summary.in_progress_amount)} icon={FileText} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <DocumentMiniTable title="Ожидают вашей обработки" documents={stats.awaiting_approval.documents} />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Документы по типам</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.documents_by_type.map((item) => (
                                <div key={item.type} className="flex items-center justify-between">
                                    <span className="text-sm">{item.title}</span>
                                    <Badge variant="secondary">{item.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DocumentMiniTable title="Последние завершённые документы" documents={stats.recently_finished} />
        </div>
    );
}

// ==================== HEADER FRP DASHBOARD ====================

function HeaderFrpDashboard({ stats }: { stats: HeaderFrpStats }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Ожидают утверждения"
                    value={stats.awaiting_approval.count}
                    icon={Clock}
                    className={stats.awaiting_approval.count > 0 ? 'border-amber-300 dark:border-amber-700' : ''}
                />
                <StatCard
                    title="Документы команды"
                    value={stats.team_documents.total}
                    description={`Завершено: ${stats.team_documents.finished}`}
                    icon={Users}
                />
                <StatCard
                    title="Мои документы"
                    value={stats.own_documents.total}
                    description={`Черновики: ${stats.own_documents.draft}`}
                    icon={FileText}
                />
                <StatCard title="Возвращённые (команда)" value={stats.team_documents.returned} icon={RotateCcw} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <DocumentMiniTable title="Ожидают вашего утверждения" documents={stats.awaiting_approval.documents} />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Члены команды</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.team_members.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Нет подчинённых</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Имя</TableHead>
                                        <TableHead>Телефон</TableHead>
                                        <TableHead>Документов</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.team_members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">{member.name}</TableCell>
                                            <TableCell>{member.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{member.documents_count}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Документы команды по статусам</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Черновики:</span>
                            <Badge variant="secondary">{stats.team_documents.draft}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Send className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Отправлены:</span>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{stats.team_documents.sent}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Возвращены:</span>
                            <Badge variant="destructive">{stats.team_documents.returned}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Завершены:</span>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {stats.team_documents.finished}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ==================== FRP DASHBOARD ====================

function FrpDashboard({ stats }: { stats: FrpStats }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Всего документов" value={stats.own_documents.total} icon={FileText} />
                <StatCard title="Черновики" value={stats.own_documents.draft} icon={FileText} />
                <StatCard title="Отправлены" value={stats.own_documents.sent} icon={Send} />
                <StatCard
                    title="Возвращены"
                    value={stats.own_documents.returned}
                    icon={RotateCcw}
                    className={stats.own_documents.returned > 0 ? 'border-red-300 dark:border-red-700' : ''}
                />
                <StatCard title="Завершены" value={stats.own_documents.finished} icon={CheckCircle2} />
            </div>

            {stats.warehouse && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Мой склад</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Warehouse className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{stats.warehouse.warehouse?.title ?? 'Не назначен'}</p>
                                {stats.warehouse.warehouse?.code && (
                                    <p className="text-sm text-muted-foreground">Код: {stats.warehouse.warehouse.code}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <DocumentMiniTable title="Последние документы" documents={stats.recent_documents} />
                <DocumentMiniTable title="Возвращённые документы" documents={stats.pending_returns} />
            </div>
        </div>
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

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const { stats, userRole } = usePage<SharedData & DashboardPageProps>().props;
    const showModal = !auth.user.chat_id;

    const { data, setData, put, processing, errors } = useForm({
        chat_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/user/chat-id');
    };

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

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">{renderDashboard()}</div>
        </AppLayout>
    );
}

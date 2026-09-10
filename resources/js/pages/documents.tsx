import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Filter, Plus, X } from 'lucide-react';
import { useState } from 'react';

// Updated Interfaces
interface RoleInfo {
    name: string;
}

interface Priority {
    user_id: number | null;
    user_role: string;
    is_success: boolean;
    role_info: RoleInfo | null;
}

interface Author {
    id: number;
    name: string;
}

interface Document {
    id: number;
    number: string;
    document_type: {
        title: string;
    };
    total_amount: number;
    date_order: string;
    is_finished: boolean;
    is_returned: boolean;
    status: number;
    author: Author | null;
    priority: Priority[];
}

interface PaginatedData {
    data: Document[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
}

interface DocumentType {
    id: number;
    title: string;
}

interface Filters {
    search?: string;
    start_date?: string;
    end_date?: string;
    document_type?: string;
    is_finished?: string;
    author?: string;
    per_page?: number;
}

type Scope = 'mine' | 'incoming' | 'all';

const SCOPE_LABELS: Record<Scope, string> = {
    mine: 'Мои',
    incoming: 'Входящие',
    all: 'Все',
};

interface DocumentsPageProps {
    documents: PaginatedData;
    status: 'draft' | 'sent' | 'return' | 'incoming';
    documentTypes: DocumentType[];
    incomingCount: number;
    scope: Scope;
    availableScopes: Scope[];
    awaitingApprovalCount: number;
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'АКТ', href: '/documents' }];

const DocumentStatus = ({ document }: { document: Document }) => {
    // Yakunlangan hujjat
    if (document.is_finished) {
        return (
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Завершен</span>
            </div>
        );
    }

    // Qaytarilgan hujjat
    if (document.is_returned) {
        return (
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Возвращено</span>
            </div>
        );
    }

    // Jarayonda - priority bo'yicha status
    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                {document.priority.map((p, index) => (
                    <Tooltip key={index}>
                        <TooltipTrigger>
                            <div className={`h-4 w-4 rounded-sm ${p.is_success ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{p.role_info?.name ?? p.user_role}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
};

export default function Documents({
    documents,
    status: currentTab,
    documentTypes,
    incomingCount,
    scope,
    availableScopes,
    awaitingApprovalCount,
    filters,
}: DocumentsPageProps) {
    const { auth } = usePage().props as unknown as { auth: { user: { type: string } } };
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [documentType, setDocumentType] = useState(filters.document_type || '');
    const [documentStatus, setDocumentStatus] = useState(filters.is_finished || '');
    const [perPage, setPerPage] = useState(filters.per_page || 20);
    const [showFilters, setShowFilters] = useState(false);

    const showScopeFilter = currentTab === 'sent' && availableScopes.length > 1;
    // Muallif ustuni faqat begona hujjatlar ko'rinadigan rejimlarda ma'noga ega
    const showAuthorColumn = (currentTab === 'sent' && scope !== 'mine') || currentTab === 'incoming';
    // Dashboard'dan «Члены команды» orqali kelinganda qaysi muallif bo'yicha filtrlanayotgani ko'rinsin
    const activeAuthorName = filters.author
        ? (documents.data.find((doc) => doc.author?.id.toString() === filters.author)?.author?.name ?? `#${filters.author}`)
        : null;

    // Har bir navigatsiyada joriy filtrlar URL da saqlanadi, shunda sahifa
    // yangilanganda yoki havola ulashilganda holat yo'qolmaydi.
    const buildParams = (overrides: Record<string, string | number> = {}) => {
        const params: Record<string, string | number> = { page: 1 };
        if (searchQuery) params.search = searchQuery;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (documentType) params.document_type = documentType;
        if (documentStatus) params.is_finished = documentStatus;
        if (filters.author) params.author = filters.author;
        if (showScopeFilter) params.scope = scope;
        if (perPage !== 20) params.per_page = perPage;

        return { ...params, ...overrides };
    };

    const navigate = (params: Record<string, string | number>, tab: string = currentTab) => {
        router.get(`/documents/${tab}`, params, { preserveState: true, replace: true });
    };

    const applyFilters = () => navigate(buildParams());

    const clearFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setDocumentType('');
        setDocumentStatus('');
        setPerPage(20);
        navigate(showScopeFilter ? { per_page: 20, scope } : { per_page: 20 });
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        navigate(buildParams({ search: value }));
    };

    const handlePageChange = (newPage: number) => navigate(buildParams({ page: newPage }));

    const handleScopeChange = (value: Scope) => navigate(buildParams({ scope: value, page: 1 }));

    const handleRowClick = (doc: Document) => {
        if (currentTab === 'sent' || currentTab === 'incoming') {
            if (doc.status === 0) {
                router.visit(`/documents/${doc.id}/edit`);
            } else {
                router.visit(`/documents/${doc.id}`);
            }
        } else {
            router.visit(`/documents/${doc.id}/edit`);
        }
    };

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

    const isFrp = auth.user?.type === 'frp' || auth.user?.type === 'header_frp';
    const isAdmin = auth.user?.type === 'admin';
    const availableTabs: { value: string; label: string; badge?: number }[] = [];
    if (isAdmin || isFrp) {
        availableTabs.push({ value: 'draft', label: 'Черновик' });
    }
    availableTabs.push({
        value: 'sent',
        label: isFrp ? 'Отправленные' : 'Полученные',
        badge: showScopeFilter ? undefined : awaitingApprovalCount,
    });
    // Kelgan hujjatlar - tayinlangan hujjatlar bor bo'lsa ko'rsatish
    if (incomingCount > 0 || currentTab === 'incoming') {
        availableTabs.push({ value: 'incoming', label: 'Келган', badge: incomingCount });
    }
    if (isAdmin || isFrp) {
        availableTabs.push({ value: 'return', label: 'Возврат' });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="АКТ" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">АКТ</h1>
                    {isFrp && (
                        <Button onClick={() => router.visit('/documents/create')} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Добавить АКТ
                        </Button>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="min-w-[280px] flex-1">
                            <Input placeholder="Поиск по номеру документа..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
                        </div>
                        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                            <Filter className="h-4 w-4" />
                            Фильтры
                        </Button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">На странице:</span>
                            <Select
                                value={perPage.toString()}
                                onValueChange={(value) => {
                                    setPerPage(Number(value));
                                    navigate(buildParams({ per_page: value }));
                                }}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {showFilters && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-medium">Фильтры</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Дата начала</label>
                                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Дата окончания</label>
                                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Тип документа</label>
                                        <Select value={documentType || undefined} onValueChange={(value) => setDocumentType(value || '')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Все типы" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Статус акта</label>
                                        <Select value={documentStatus || undefined} onValueChange={(value) => setDocumentStatus(value || '')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Все статусы" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">В обработке</SelectItem>
                                                <SelectItem value="1">Завершен</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button onClick={applyFilters} className="gap-2">
                                        <Filter className="h-4 w-4" />
                                        Применить
                                    </Button>
                                    <Button variant="outline" onClick={clearFilters}>
                                        Очистить
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <Tabs value={currentTab} onValueChange={(value) => router.visit('/documents/' + value)} className="w-full">
                    <TabsList
                        className={`grid w-full ${
                            availableTabs.length === 1
                                ? 'grid-cols-1'
                                : availableTabs.length === 2
                                  ? 'grid-cols-2'
                                  : availableTabs.length === 3
                                    ? 'grid-cols-3'
                                    : 'grid-cols-4'
                        }`}
                    >
                        {availableTabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} className="relative">
                                {tab.label}
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                                        {tab.badge}
                                    </span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value={currentTab} className="mt-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {showScopeFilter && (
                                <div className="inline-flex rounded-md border p-1">
                                    {availableScopes.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleScopeChange(value)}
                                            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                                                scope === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {SCOPE_LABELS[value]}
                                            {value === 'incoming' && awaitingApprovalCount > 0 && (
                                                <span
                                                    className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                                                        scope === value ? 'bg-primary-foreground text-primary' : 'bg-red-500 text-white'
                                                    }`}
                                                >
                                                    {awaitingApprovalCount}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {activeAuthorName && (
                                <button
                                    type="button"
                                    onClick={() => navigate(buildParams({ author: '' }))}
                                    className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-sm hover:bg-muted"
                                >
                                    Автор: {activeAuthorName}
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className={`w-full table-fixed ${showAuthorColumn ? 'min-w-[960px]' : 'min-w-[800px]'}`}>
                                    <colgroup>
                                        <col className="w-[140px]" />
                                        <col className="w-[200px]" />
                                        {showAuthorColumn && <col className="w-[160px]" />}
                                        <col className="w-[150px]" />
                                        <col className="w-[160px]" />
                                        <col className="w-[150px]" />
                                    </colgroup>
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground">Номер</th>
                                            <th className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground">
                                                Тип документа
                                            </th>
                                            {showAuthorColumn && (
                                                <th className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground">Автор</th>
                                            )}
                                            <th className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground">Сумма</th>
                                            <th className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground">
                                                Дата заказа
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground">Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.data.length > 0 ? (
                                            documents.data.map((document) => (
                                                <tr
                                                    key={document.id}
                                                    className="cursor-pointer border-b hover:bg-muted/50"
                                                    onClick={() => handleRowClick(document)}
                                                >
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="truncate font-mono text-sm font-medium">{document.number}</div>
                                                    </td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="truncate text-sm font-medium" title={document.document_type.title}>
                                                            {document.document_type.title}
                                                        </div>
                                                    </td>
                                                    {showAuthorColumn && (
                                                        <td className="h-12 px-4 align-middle">
                                                            <div className="truncate text-sm" title={document.author?.name ?? ''}>
                                                                {document.author?.name ?? '—'}
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="text-sm font-medium">{formatAmount(document.total_amount)}</div>
                                                    </td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-4 w-4 flex-shrink-0" />
                                                            <span>{formatDate(document.date_order)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <DocumentStatus document={document} />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={showAuthorColumn ? 6 : 5} className="h-24 text-center">
                                                    <div className="text-muted-foreground">Документы не найдены</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {documents.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Показано {documents.from}-{documents.to} из {documents.total} записей
                                    <span className="ml-2 text-muted-foreground">
                                        (Страница {documents.current_page} из {documents.last_page})
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(Math.max(documents.current_page - 1, 1))}
                                        disabled={documents.current_page === 1}
                                    >
                                        Предыдущая
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(Math.min(documents.current_page + 1, documents.last_page))}
                                        disabled={documents.current_page === documents.last_page}
                                    >
                                        Следующая
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

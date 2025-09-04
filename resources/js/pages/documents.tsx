import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type BreadcrumbItem } from '@/types';
import { Plus, Calendar } from 'lucide-react';

// Updated Interfaces
interface Priority {
    user_id: number | null;
    user_role: string;
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
    status: number; // Detailed status field
    priority: Priority[]; // Added priority relationship
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

interface DocumentsPageProps {
    documents: PaginatedData;
    search: string | null;
    status: 'draft' | 'sent' | 'return';
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'АКТ', href: '/documents' },
];

export default function Documents({ documents, search, status: currentTab }: DocumentsPageProps) {
    const { auth } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState(search || '');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get(`/documents/${currentTab}`, { search: value, page: 1 }, { preserveState: true, replace: true });
    };

    const handlePageChange = (newPage: number) => {
        router.get(`/documents/${currentTab}`, { search: searchQuery || undefined, page: newPage }, { preserveState: true, replace: true });
    };

    const handleRowClick = (doc: Document) => {
        if (currentTab === 'sent') {
            if (doc.status === 0 || doc.status === 3) {
                router.visit(`/documents/${doc.id}/edit`);
            } else {
                router.visit(`/documents/${doc.id}`);
            }
        } else {
            router.visit(`/documents/${doc.id}/edit`);
        }
    };

    const formatAmount = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

    const isFrp = auth.user?.type === 'frp';
    const isAdmin = auth.user?.type === 'admin';

    const availableTabs = [];
    if (isAdmin || isFrp) {
        availableTabs.push({ value: 'draft', label: 'Черновик' });
    }
    availableTabs.push({ value: 'sent', label: isFrp ? 'Отправленные' : 'Полученные' });
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
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input placeholder="Поиск по номеру документа..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
                    </div>
                </div>
                <Tabs value={currentTab} onValueChange={(value) => router.visit('/documents/' + value)} className="w-full">
                    <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
                        {availableTabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value={currentTab} className="mt-4">
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Номер</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Тип документа</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Сумма</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Дата заказа</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.data.length > 0 ? (
                                            documents.data.map((document) => (
                                                <tr key={document.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => handleRowClick(document)}>
                                                    <td className="h-12 px-4 align-middle"><div className="font-medium font-mono text-sm">{document.number}</div></td>
                                                    <td className="h-12 px-4 align-middle"><div className="font-medium">{document.document_type.title}</div></td>
                                                    <td className="h-12 px-4 align-middle"><div className="font-medium">{formatAmount(document.total_amount)}</div></td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="text-muted-foreground flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(document.date_order)}
                                                        </div>
                                                    </td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            {document.priority && document.priority.map((p, index) => (
                                                                <Badge key={index} variant={p.user_id ? 'default' : 'secondary'}>
                                                                    {p.user_role}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="h-24 text-center">
                                                    <div className="text-muted-foreground">Документы не найдены</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {documents.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">Показано {documents.from}-{documents.to} из {documents.total} записей</div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(documents.current_page - 1, 1))} disabled={documents.current_page === 1}>Предыдущая</Button>
                                    <div className="flex gap-1">
                                        {(() => {
                                            const pages = [];
                                            const maxVisiblePages = 5;
                                            const halfVisible = Math.floor(maxVisiblePages / 2);
                                            let startPage = Math.max(1, documents.current_page - halfVisible);
                                            let endPage = Math.min(documents.last_page, documents.current_page + halfVisible);
                                            if (endPage - startPage + 1 < maxVisiblePages) {
                                                if (startPage === 1) endPage = Math.min(documents.last_page, startPage + maxVisiblePages - 1);
                                                else startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                            }
                                            if (startPage > 1) {
                                                pages.push(<Button key={1} variant="outline" size="sm" onClick={() => handlePageChange(1)} className="w-8">1</Button>);
                                                if (startPage > 2) pages.push(<span key="start-ellipsis" className="px-2 text-muted-foreground">...</span>);
                                            }
                                            for (let i = startPage; i <= endPage; i++) {
                                                pages.push(<Button key={i} variant={documents.current_page === i ? "default" : "outline"} size="sm" onClick={() => handlePageChange(i)} className="w-8">{i}</Button>);
                                            }
                                            if (endPage < documents.last_page) {
                                                if (endPage < documents.last_page - 1) pages.push(<span key="end-ellipsis" className="px-2 text-muted-foreground">...</span>);
                                                pages.push(<Button key={documents.last_page} variant="outline" size="sm" onClick={() => handlePageChange(documents.last_page)} className="w-8">{documents.last_page}</Button>);
                                            }
                                            return pages;
                                        })()}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.min(documents.current_page + 1, documents.last_page))} disabled={documents.current_page === documents.last_page}>Следующая</Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

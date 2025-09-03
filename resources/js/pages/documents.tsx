import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type BreadcrumbItem } from '@/types';
import { Plus, Calendar } from 'lucide-react';

interface Document {
    id: number;
    number: string;
    document_type: string;
    total_amount: number;
    date_order: string;
    status: 'draft' | 'sent' | 'return';
}

interface PaginatedData {
    documents: Document[];
    total: number;
    page: number;
    perPage: number;
    search: string | null;
    status: 'draft' | 'sent' | 'return';
}

type DocumentsPageProps = PaginatedData;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'АКТ',
        href: '/documents',
    },
];

// Fake data - static to prevent recreation
const allFakeDocuments: Document[] = [
    // Draft documents
    { id: 1, number: '2025/001', document_type: 'Счет-фактура', total_amount: 150000, date_order: '2025-09-01', status: 'draft' },
    { id: 2, number: '2025/002', document_type: 'Приходная накладная', total_amount: 75000, date_order: '2025-09-02', status: 'draft' },
    { id: 3, number: '2025/003', document_type: 'Заказ на поставку', total_amount: 320000, date_order: '2025-09-03', status: 'draft' },
    
    // Sent documents  
    { id: 4, number: '2025/004', document_type: 'Расходная накладная', total_amount: 89500, date_order: '2025-08-28', status: 'sent' },
    { id: 5, number: '2025/005', document_type: 'Документ возврата', total_amount: 45000, date_order: '2025-08-29', status: 'sent' },
    { id: 6, number: '2025/006', document_type: 'Перемещение товара', total_amount: 125000, date_order: '2025-08-30', status: 'sent' },
    { id: 7, number: '2025/007', document_type: 'Инвентаризация', total_amount: 200000, date_order: '2025-08-31', status: 'sent' },
    
    // Return documents
    { id: 8, number: '2025/008', document_type: 'Списание товара', total_amount: 35000, date_order: '2025-08-25', status: 'return' },
    { id: 9, number: '2025/009', document_type: 'Корректировка остатков', total_amount: 67800, date_order: '2025-08-26', status: 'return' },
    { id: 10, number: '2025/010', document_type: 'Заказ на закупку', total_amount: 95000, date_order: '2025-08-27', status: 'return' },
];

export default function Documents({ 
    documents: initialDocuments = [], 
    total: initialTotal = 0, 
    page = 1, 
    perPage = 10, 
    search, 
    status: initialStatus = 'draft' 
}: DocumentsPageProps) {
    const [activeTab, setActiveTab] = useState<'draft' | 'sent' | 'return'>(initialStatus);
    const [searchQuery, setSearchQuery] = useState(search || '');
    
    // Filter documents based on current state
    const getFilteredDocuments = () => {
        if (initialDocuments.length > 0) {
            return initialDocuments;
        }
        
        let filtered = allFakeDocuments.filter(doc => doc.status === activeTab);
        
        if (searchQuery) {
            filtered = filtered.filter(doc => 
                doc.number.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return filtered;
    };

    const filteredDocs = getFilteredDocuments();
    const currentTotal = initialDocuments.length > 0 ? initialTotal : filteredDocs.length;
    const totalPages = Math.ceil(currentTotal / perPage);
    const startIndex = (page - 1) * perPage;
    
    const [localDocuments, setLocalDocuments] = useState<Document[]>(filteredDocs);

    // Update documents when tab changes
    useEffect(() => {
        setLocalDocuments(getFilteredDocuments());
    }, [activeTab, searchQuery]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/documents', { search: value, page: 1, status: activeTab }, { preserveState: false });
    };

    const handlePageChange = (newPage: number) => {
        router.get('/documents', { search: searchQuery || undefined, page: newPage, status: activeTab }, { preserveState: false });
    };

    const handleTabChange = (newStatus: string) => {
        const status = newStatus as 'draft' | 'sent' | 'return';
        setActiveTab(status);
        router.get('/documents', { search: searchQuery || undefined, page: 1, status }, { preserveState: false });
    };

    const getStatusLabel = (status: 'draft' | 'sent' | 'return') => {
        switch (status) {
            case 'draft': return 'Черновик';
            case 'sent': return 'Отправлен';
            case 'return': return 'Возврат';
        }
    };

    const getStatusVariant = (status: 'draft' | 'sent' | 'return') => {
        switch (status) {
            case 'draft': return 'secondary' as const;
            case 'sent': return 'default' as const;
            case 'return': return 'destructive' as const;
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="АКТ" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">АКТ</h1>
                    <Button onClick={() => router.visit('/documents/create')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить АКТ
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Поиск по номеру документа..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="draft">Черновик</TabsTrigger>
                        <TabsTrigger value="sent">Отправлен</TabsTrigger>
                        <TabsTrigger value="return">Возврат</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={activeTab} className="mt-4">
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Номер
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Тип документа
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Сумма
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Дата заказа
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                                Статус
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {localDocuments.length > 0 ? (
                                            localDocuments.map((document) => (
                                                <tr key={document.id} className="border-b">
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="font-medium font-mono text-sm">
                                                            {document.number}
                                                        </div>
                                                    </td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="font-medium">{document.document_type}</div>
                                                    </td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="font-medium">{formatAmount(document.total_amount)}</div>
                                                    </td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <div className="text-muted-foreground flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(document.date_order)}
                                                        </div>
                                                    </td>
                                                    <td className="h-12 px-4 align-middle">
                                                        <Badge variant={getStatusVariant(document.status)}>
                                                            {getStatusLabel(document.status)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="h-24 text-center">
                                                    <div className="text-muted-foreground">
                                                        Документы не найдены
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Показано {startIndex + 1}-{Math.min(startIndex + perPage, currentTotal)} из {currentTotal} записей
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(Math.max(page - 1, 1))}
                                        disabled={page === 1}
                                    >
                                        Предыдущая
                                    </Button>

                                    <div className="flex gap-1">
                                        {(() => {
                                            const maxVisiblePages = 5;
                                            const halfVisible = Math.floor(maxVisiblePages / 2);
                                            
                                            let startPage = Math.max(1, page - halfVisible);
                                            let endPage = Math.min(totalPages, page + halfVisible);
                                            
                                            if (endPage - startPage + 1 < maxVisiblePages) {
                                                if (startPage === 1) {
                                                    endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                                } else {
                                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                                }
                                            }
                                            
                                            const pages = [];
                                            
                                            if (startPage > 1) {
                                                pages.push(
                                                    <Button
                                                        key={1}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(1)}
                                                        className="w-8"
                                                    >
                                                        1
                                                    </Button>
                                                );
                                                
                                                if (startPage > 2) {
                                                    pages.push(
                                                        <span key="start-ellipsis" className="px-2 text-muted-foreground">
                                                            ...
                                                        </span>
                                                    );
                                                }
                                            }
                                            
                                            for (let i = startPage; i <= endPage; i++) {
                                                pages.push(
                                                    <Button
                                                        key={i}
                                                        variant={page === i ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(i)}
                                                        className="w-8"
                                                    >
                                                        {i}
                                                    </Button>
                                                );
                                            }
                                            
                                            if (endPage < totalPages) {
                                                if (endPage < totalPages - 1) {
                                                    pages.push(
                                                        <span key="end-ellipsis" className="px-2 text-muted-foreground">
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                
                                                pages.push(
                                                    <Button
                                                        key={totalPages}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(totalPages)}
                                                        className="w-8"
                                                    >
                                                        {totalPages}
                                                    </Button>
                                                );
                                            }
                                            
                                            return pages;
                                        })()}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                                        disabled={page === totalPages}
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
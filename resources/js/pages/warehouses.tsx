import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Warehouse } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WarehouseType {
    id: number;
    title: string;
    is_active: boolean;
}

interface Warehouse {
    id: number;
    code: string;
    title: string;
    type: number;
    type_info: WarehouseType;
    is_active: boolean;
    comment: string | null;
}

interface PaginatedData {
    warehouses: Warehouse[];
    total: number;
    page: number;
    perPage: number;
    search: string | null;
}

type WarehousesPageProps = PaginatedData;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Склады',
        href: '/warehouses',
    },
];

export default function Warehouses({ warehouses, total, page, perPage, search }: WarehousesPageProps) {
    const [localWarehouses, setLocalWarehouses] = useState<Warehouse[]>(warehouses);
    const [searchQuery, setSearchQuery] = useState(search || '');

    // Update local warehouses when props change
    useEffect(() => {
        setLocalWarehouses(warehouses);
    }, [warehouses]);

    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/warehouses', { search: value, page: 1 }, { preserveState: false });
    };

    const handlePageChange = (newPage: number) => {
        router.get('/warehouses', { search: searchQuery || undefined, page: newPage }, { preserveState: false });
    };

    const handleDeactivate = (id: number) => {
        setLocalWarehouses((prev) => prev.map((warehouse) => (warehouse.id === id ? { ...warehouse, is_active: false } : warehouse)));
    };

    const handleActivate = (id: number) => {
        setLocalWarehouses((prev) => prev.map((warehouse) => (warehouse.id === id ? { ...warehouse, is_active: true } : warehouse)));
    };

    const getTypeColor = (typeName?: string) => {
        switch (typeName?.toLowerCase()) {
            case 'основной':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'вспомогательный':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'временный':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'архивный':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Склады" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Склады</h1>
                    <Button onClick={() => router.visit('/warehouses/create')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить склад
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Поиск по коду или названию склада..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Код склада</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Название</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Тип</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Статус</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Комментарий</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localWarehouses.length > 0 ? (
                                    localWarehouses.map((warehouse) => (
                                        <tr key={warehouse.id} className="border-b">
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-mono text-sm font-medium">{warehouse.code}</div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-medium">{warehouse.title}</div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <Badge className={getTypeColor(warehouse.type_info?.title)}>
                                                    {warehouse.type_info?.title || 'Не указано'}
                                                </Badge>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
                                                    {warehouse.is_active ? 'Активен' : 'Неактивен'}
                                                </Badge>
                                            </td>
                                            <td className="h-12 max-w-xs px-4 align-middle">
                                                <div className="truncate text-sm text-muted-foreground">{warehouse.comment || '—'}</div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                {warehouse.is_active ? (
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeactivate(warehouse.id)}>
                                                        Деактивировать
                                                    </Button>
                                                ) : (
                                                    <Button variant="default" size="sm" onClick={() => handleActivate(warehouse.id)}>
                                                        Активировать
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="h-24 text-center">
                                            <div className="text-muted-foreground">Склады не найдены</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Показано {startIndex + 1}-{Math.min(startIndex + perPage, total)} из {total} записей
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(page - 1, 1))} disabled={page === 1}>
                                Предыдущая
                            </Button>

                            <div className="flex gap-1">
                                {(() => {
                                    const maxVisiblePages = 5;
                                    const halfVisible = Math.floor(maxVisiblePages / 2);

                                    let startPage = Math.max(1, page - halfVisible);
                                    let endPage = Math.min(totalPages, page + halfVisible);

                                    // Adjust if we're near the beginning or end
                                    if (endPage - startPage + 1 < maxVisiblePages) {
                                        if (startPage === 1) {
                                            endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                        } else {
                                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                        }
                                    }

                                    const pages = [];

                                    // First page + ellipsis if needed
                                    if (startPage > 1) {
                                        pages.push(
                                            <Button key={1} variant="outline" size="sm" onClick={() => handlePageChange(1)} className="w-8">
                                                1
                                            </Button>,
                                        );

                                        if (startPage > 2) {
                                            pages.push(
                                                <span key="start-ellipsis" className="px-2 text-muted-foreground">
                                                    ...
                                                </span>,
                                            );
                                        }
                                    }

                                    // Visible pages
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <Button
                                                key={i}
                                                variant={page === i ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(i)}
                                                className="w-8"
                                            >
                                                {i}
                                            </Button>,
                                        );
                                    }

                                    // Last page + ellipsis if needed
                                    if (endPage < totalPages) {
                                        if (endPage < totalPages - 1) {
                                            pages.push(
                                                <span key="end-ellipsis" className="px-2 text-muted-foreground">
                                                    ...
                                                </span>,
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
                                            </Button>,
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
            </div>
        </AppLayout>
    );
}

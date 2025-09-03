import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Plus, Archive } from 'lucide-react';

interface WarehouseType {
    id: number;
    title: string;
    is_active: boolean;
}

interface PaginatedData {
    warehouse_types: WarehouseType[];
    total: number;
    page: number;
    perPage: number;
    search: string | null;
}

type WarehouseTypesPageProps = PaginatedData;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Типы складов',
        href: '/warehouse-types',
    },
];

// Fake data for development
const generateFakeWarehouseTypes = (page: number, perPage: number, search: string | null): PaginatedData => {
    const allTypes = [
        { id: 1, title: 'Основной', is_active: true },
        { id: 2, title: 'Вспомогательный', is_active: true },
        { id: 3, title: 'Временный', is_active: true },
        { id: 4, title: 'Архивный', is_active: false },
        { id: 5, title: 'Производственный', is_active: true },
        { id: 6, title: 'Торговый', is_active: true },
        { id: 7, title: 'Склад возврата', is_active: true },
        { id: 8, title: 'Транзитный', is_active: false },
        { id: 9, title: 'Холодильный', is_active: true },
        { id: 10, title: 'Складской комплекс', is_active: true },
        { id: 11, title: 'Распределительный', is_active: true },
        { id: 12, title: 'Логистический', is_active: false },
    ];

    let filteredTypes = allTypes;
    if (search) {
        filteredTypes = allTypes.filter(type => 
            type.title.toLowerCase().includes(search.toLowerCase())
        );
    }

    const total = filteredTypes.length;
    const startIndex = (page - 1) * perPage;
    const warehouse_types = filteredTypes.slice(startIndex, startIndex + perPage);

    return {
        warehouse_types,
        total,
        page,
        perPage,
        search
    };
};

export default function WarehouseTypes({ warehouse_types: initialWarehouseTypes = [], total: initialTotal = 0, page = 1, perPage = 10, search }: WarehouseTypesPageProps) {
    // Use fake data if no real data provided
    const fakeData = generateFakeWarehouseTypes(page, perPage, search);
    const warehouse_types = initialWarehouseTypes.length > 0 ? initialWarehouseTypes : fakeData.warehouse_types;
    const total = initialTotal > 0 ? initialTotal : fakeData.total;
    
    const [localWarehouseTypes, setLocalWarehouseTypes] = useState<WarehouseType[]>(warehouse_types);
    const [searchQuery, setSearchQuery] = useState(search || '');
    
    // Update local warehouse types when props change
    useEffect(() => {
        setLocalWarehouseTypes(warehouse_types);
    }, [warehouse_types]);

    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/warehouse-types', { search: value, page: 1 }, { preserveState: false });
    };

    const handlePageChange = (newPage: number) => {
        router.get('/warehouse-types', { search: searchQuery || undefined, page: newPage }, { preserveState: false });
    };

    const handleDeactivate = (id: number) => {
        setLocalWarehouseTypes(prev =>
            prev.map(type =>
                type.id === id ? { ...type, is_active: false } : type
            )
        );
    };

    const handleActivate = (id: number) => {
        setLocalWarehouseTypes(prev =>
            prev.map(type =>
                type.id === id ? { ...type, is_active: true } : type
            )
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Типы складов" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Типы складов</h1>
                    <Button onClick={() => router.visit('/warehouse-types/create')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить тип склада
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Поиск по названию типа склада..."
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
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        ID
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Название
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Статус
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {localWarehouseTypes.length > 0 ? (
                                    localWarehouseTypes.map((warehouseType) => (
                                        <tr key={warehouseType.id} className="border-b">
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-medium font-mono text-sm">
                                                    {warehouseType.id}
                                                </div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-medium">{warehouseType.title}</div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <Badge variant={warehouseType.is_active ? "default" : "secondary"}>
                                                    {warehouseType.is_active ? 'Активен' : 'Неактивен'}
                                                </Badge>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                {warehouseType.is_active ? (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeactivate(warehouseType.id)}
                                                    >
                                                        Деактивировать
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleActivate(warehouseType.id)}
                                                    >
                                                        Активировать
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="h-24 text-center">
                                            <div className="text-muted-foreground">
                                                Типы складов не найдены
                                            </div>
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
                                    
                                    // Visible pages
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
                                    
                                    // Last page + ellipsis if needed
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
            </div>
        </AppLayout>
    );
}
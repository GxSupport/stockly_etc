import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Plus } from 'lucide-react';

interface Department {
    id: number;
    dep_code: string;
    title: string;
    is_active: boolean;
}

interface PaginatedData {
    departments: Department[];
    total: number;
    page: number;
    perPage: number;
    search: string | null;
}

type DepartmentsPageProps = PaginatedData;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Отделы',
        href: '/departments',
    },
];

export default function Departments({ departments, total, page, perPage, search }: DepartmentsPageProps) {
    const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);
    const [searchQuery, setSearchQuery] = useState(search || '');
    
    // Update local departments when props change
    useEffect(() => {
        setLocalDepartments(departments);
    }, [departments]);

    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/departments', { search: value, page: 1 }, { preserveState: false });
    };

    const handlePageChange = (newPage: number) => {
        router.get('/departments', { search: searchQuery || undefined, page: newPage }, { preserveState: false });
    };

    const handleDeactivate = (id: number) => {
        setLocalDepartments(prev =>
            prev.map(dept =>
                dept.id === id ? { ...dept, is_active: false } : dept
            )
        );
    };

    const handleActivate = (id: number) => {
        setLocalDepartments(prev =>
            prev.map(dept =>
                dept.id === id ? { ...dept, is_active: true } : dept
            )
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Отделы" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Отделы</h1>
                    <Button onClick={() => router.visit('/departments/create')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить отдел
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Поиск по коду или названию отдела..."
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
                                        Код отдела
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
                                {localDepartments.length > 0 ? (
                                    localDepartments.map((department) => (
                                        <tr key={department.id} className="border-b">
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-medium font-mono text-sm">
                                                    {department.dep_code}
                                                </div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-medium">{department.title}</div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <Badge variant={department.is_active ? "default" : "secondary"}>
                                                    {department.is_active ? 'Активен' : 'Неактивен'}
                                                </Badge>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                {department.is_active ? (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeactivate(department.id)}
                                                    >
                                                        Деактивировать
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleActivate(department.id)}
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
                                                Отделы не найдены
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
import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Plus } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    name: string;
    phone: string | null;
    is_active: boolean;
    role?: Role;
}

interface PaginatedData {
    employees: Employee[];
    total: number;
    page: number;
    perPage: number;
    search: string | null;
}

type EmployeesPageProps = PaginatedData;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Сотрудники',
        href: '/employees',
    },
];

export default function Employees({ employees, total, page, perPage, search }: EmployeesPageProps) {
    const [localEmployees, setLocalEmployees] = useState<Employee[]>(employees);
    const [searchQuery, setSearchQuery] = useState(search || '');
    
    // Update local employees when props change
    useEffect(() => {
        setLocalEmployees(employees);
    }, [employees]);

    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/employees', { search: value, page: 1 }, { preserveState: false });
    };

    const handlePageChange = (newPage: number) => {
        router.get('/employees', { search: searchQuery || undefined, page: newPage }, { preserveState: false });
    };

    const handleDeactivate = (id: number) => {
        setLocalEmployees(prev =>
            prev.map(emp =>
                emp.id === id ? { ...emp, is_active: false } : emp
            )
        );
    };

    const handleActivate = (id: number) => {
        setLocalEmployees(prev =>
            prev.map(emp =>
                emp.id === id ? { ...emp, is_active: true } : emp
            )
        );
    };

    const formatPhone = (phone: string | null) => {
        if (!phone || typeof phone !== 'string') return '';
        // +998901234567 -> +998 90 123 45 67
        if (phone.startsWith('+998') && phone.length === 13) {
            return phone.replace(/^(\+998)(\d{2})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
        }
        return phone;
    };

    const getRoleColor = (roleName?: string) => {
        switch (roleName?.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'employee':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'intern':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Сотрудники" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Сотрудники</h1>
                    <Button onClick={() => router.visit('/employees/create')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить сотрудника
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Поиск по имени или телефону..."
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
                                        Имя
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Телефон
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Тип
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
                                {localEmployees.length > 0 ? (
                                    localEmployees.map((employee) => (
                                        <tr key={employee.id} className="border-b">
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-medium">{employee.name}</div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <div className="text-muted-foreground">{formatPhone(employee.phone)}</div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <Badge className={getRoleColor(employee.role?.name)}>
                                                    {employee.role?.name || 'Не указано'}
                                                </Badge>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <Badge variant={employee.is_active ? "default" : "secondary"}>
                                                    {employee.is_active ? 'Активен' : 'Неактивен'}
                                                </Badge>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                {employee.is_active ? (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeactivate(employee.id)}
                                                    >
                                                        Деактивировать
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleActivate(employee.id)}
                                                    >
                                                        Активировать
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="h-24 text-center">
                                            <div className="text-muted-foreground">
                                                Сотрудники не найдены
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

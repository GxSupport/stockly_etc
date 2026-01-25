import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { SearchableSelect, SearchableSelectOption } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Department {
    id: number;
    dep_code: string;
    title: string;
    is_active: boolean;
}

interface Warehouse {
    id: number;
    code: string;
    title: string;
    is_active: boolean;
}

interface Supervisor {
    id: number;
    name: string;
}

interface CreateEmployeeProps {
    dep_list: Department[];
    warehouses: Warehouse[];
    supervisors: Supervisor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Сотрудники',
        href: '/employees',
    },
    {
        title: 'Добавить сотрудника',
        href: '/employees/create',
    },
];

export default function CreateEmployee({ dep_list, warehouses, supervisors }: CreateEmployeeProps) {
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
    const [phoneValue, setPhoneValue] = useState<string>('');

    // User type options
    const userTypeOptions: SearchableSelectOption[] = [
        { value: 'admin', label: 'Администратор' },
        { value: 'director', label: 'Директор' },
        { value: 'deputy_director', label: 'Заместитель директора' },
        { value: 'buxgalter', label: 'Бухгалтер' },
        { value: 'header_frp', label: 'Старший МОЛ' },
        { value: 'frp', label: 'МОЛ' },
        { value: 'user', label: 'Пользователь' },
    ];

    const departmentOptions: SearchableSelectOption[] = dep_list
        .filter((dept) => dept.is_active)
        .map((dept) => ({
            value: dept.dep_code,
            label: `${dept.dep_code} - ${dept.title}`,
        }));

    const warehouseOptions: SearchableSelectOption[] = warehouses
        .filter((warehouse) => warehouse.is_active)
        .map((warehouse) => ({
            value: warehouse.id.toString(),
            label: `${warehouse.code} - ${warehouse.title}`,
        }));

    const supervisorOptions: SearchableSelectOption[] = supervisors.map((supervisor) => ({
        value: supervisor.id.toString(),
        label: supervisor.name,
    }));

    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');

        if (cleaned.startsWith('998')) {
            const number = cleaned.slice(3);
            if (number.length <= 2) {
                return `+998 ${number}`;
            } else if (number.length <= 5) {
                return `+998 ${number.slice(0, 2)} ${number.slice(2)}`;
            } else if (number.length <= 7) {
                return `+998 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
            } else if (number.length <= 9) {
                return `+998 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 7)} ${number.slice(7)}`;
            }
        } else if (cleaned.length > 0) {
            if (cleaned.length <= 2) {
                return `+998 ${cleaned}`;
            } else if (cleaned.length <= 5) {
                return `+998 ${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
            } else if (cleaned.length <= 7) {
                return `+998 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
            } else if (cleaned.length <= 9) {
                return `+998 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
            }
        }

        return value;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneValue(formatted);
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Добавить сотрудника" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/employees')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Добавить сотрудника</h1>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Информация о сотруднике</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form action="/employees/create" method="post" className="flex flex-col gap-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Имя и фамилия *</Label>
                                            <Input id="name" name="name" type="text" placeholder="Введите полное имя" required autoFocus />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Телефон *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="text"
                                                placeholder="+998 90 999 93 41"
                                                value={phoneValue}
                                                onChange={handlePhoneChange}
                                                required
                                            />
                                            <InputError message={errors.phone} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Тип пользователя *</Label>
                                            <SearchableSelect
                                                options={userTypeOptions}
                                                value={selectedType}
                                                onValueChange={setSelectedType}
                                                placeholder="Выберите тип"
                                                searchPlaceholder="Поиск типа..."
                                            />
                                            <InputError message={errors.type} />
                                            <input type="hidden" name="type" value={selectedType} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Отдел *</Label>
                                            <SearchableSelect
                                                options={departmentOptions}
                                                value={selectedDepartment}
                                                onValueChange={setSelectedDepartment}
                                                placeholder="Выберите отдел"
                                                searchPlaceholder="Поиск отдела..."
                                            />
                                            <InputError message={errors.dep_code} />
                                            <input type="hidden" name="dep_code" value={selectedDepartment} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Пароль *</Label>
                                            <Input id="password" name="password" type="password" placeholder="Введите пароль" required />
                                            <InputError message={errors.password} />
                                        </div>

                                        {selectedType === 'frp' && (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label>Склад *</Label>
                                                    <SearchableSelect
                                                        options={warehouseOptions}
                                                        value={selectedWarehouse}
                                                        onValueChange={setSelectedWarehouse}
                                                        placeholder="Выберите склад"
                                                        searchPlaceholder="Поиск склада..."
                                                    />
                                                    <InputError message={errors.warehouse_id} />
                                                    <input type="hidden" name="warehouse_id" value={selectedWarehouse} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Руководитель *</Label>
                                                    <SearchableSelect
                                                        options={supervisorOptions}
                                                        value={selectedSupervisor}
                                                        onValueChange={setSelectedSupervisor}
                                                        placeholder="Выберите руководителя"
                                                        searchPlaceholder="Поиск руководителя..."
                                                    />
                                                    <InputError message={errors.senior_id} />
                                                    <input type="hidden" name="senior_id" value={selectedSupervisor} />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="button" variant="outline" onClick={() => router.visit('/employees')}>
                                            Отменить
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Сохранить сотрудника
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

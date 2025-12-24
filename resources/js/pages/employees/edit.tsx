import { Form, Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DynamicSearchableSelect, DynamicSearchableSelectOption } from '@/components/dynamic-searchable-select';
import InputError from '@/components/input-error';
import { SearchableSelect, SearchableSelectOption } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface Role {
    id: number;
    title: string;
    name: string;
    is_active: boolean;
}

interface Department {
    id: number;
    dep_code: string;
    title: string;
    is_active: boolean;
}

interface Senior {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    name: string;
    phone: string | null;
    type: string;
    dep_code: string;
    chat_id: string | null;
    senior_id: number | null;
    is_active: boolean;
    role?: Role;
    warehouse?: {
        warehouse_id: number;
        warehouse: {
            title: string;
        };
    };
}

interface EditEmployeeProps {
    employee: Employee;
    roles_list: Role[];
    dep_list: Department[];
    senior_list?: Senior[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Сотрудники',
        href: '/employees',
    },
    {
        title: 'Изменить сотрудника',
        href: '#',
    },
];

export default function EditEmployee({ employee, roles_list, dep_list, senior_list = [] }: EditEmployeeProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedRole, setSelectedRole] = useState<string>(employee.role?.title || '');
    const [selectedDepartment, setSelectedDepartment] = useState<string>(employee.dep_code || '');
    const [selectedType, setSelectedType] = useState<string>(employee.type || '');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>((employee.warehouse?.warehouse_id || '').toString());
    const [selectedSenior, setSelectedSenior] = useState<string>((employee.senior_id || '').toString());
    const [phoneValue, setPhoneValue] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(employee.is_active);
    const isAdmin = auth.user.type === 'admin';

    // User type options
    const userTypeOptions: SearchableSelectOption[] = [
        { value: 'admin', label: 'Администратор' },
        { value: 'director', label: 'Директор' },
        { value: 'buxgalter', label: 'Бухгалтер' },
        { value: 'user', label: 'Пользователь' },
        { value: 'frp', label: 'МОЛ' },
    ];

    // Convert backend data to SearchableSelect options
    const roleOptions: SearchableSelectOption[] = roles_list
        .filter((role) => role.is_active)
        .map((role) => ({
            value: role.title.toString(),
            label: role.name,
        }));

    const departmentOptions: SearchableSelectOption[] = dep_list
        .filter((dept) => dept.is_active)
        .map((dept) => ({
            value: dept.dep_code,
            label: `${dept.dep_code} - ${dept.title}`,
        }));

    // Get current warehouse info for display
    const currentWarehouse: DynamicSearchableSelectOption | undefined = employee.warehouse?.warehouse_id
        ? {
              id: employee.warehouse.warehouse_id.toString(),
              title: employee.warehouse.warehouse.title, // Will be replaced by dynamic search
          }
        : undefined;

    const seniorOptions: SearchableSelectOption[] = senior_list.map((senior) => ({
        value: senior.id.toString(),
        label: senior.name,
    }));

    useEffect(() => {
        if (employee.phone) {
            setPhoneValue(formatPhoneNumber(employee.phone));
        }
    }, [employee.phone]);

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
            <Head title={`Изменить сотрудника - ${employee.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/employees')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Изменить сотрудника</h1>
                    </div>
                </div>

                <Card className="max-w-full">
                    <CardHeader>
                        <CardTitle>Информация о сотруднике</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form action={`/employees/${employee.id}`} method="put" className="flex flex-col gap-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Имя и фамилия *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                placeholder="Введите полное имя"
                                                defaultValue={employee.name}
                                                required
                                            />
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
                                                disabled={!isAdmin}
                                                required
                                            />
                                            <InputError message={errors.phone} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Роль *</Label>
                                            <SearchableSelect
                                                options={roleOptions}
                                                value={selectedRole}
                                                onValueChange={setSelectedRole}
                                                placeholder="Выберите роль"
                                                searchPlaceholder="Поиск роли..."
                                                disabled={!isAdmin}
                                            />
                                            <InputError message={errors.role_id} />
                                            <input type="hidden" name="role_id" value={selectedRole} />
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
                                            <Label>Тип пользователя *</Label>
                                            <SearchableSelect
                                                options={userTypeOptions}
                                                value={selectedType}
                                                onValueChange={setSelectedType}
                                                placeholder="Выберите тип"
                                                searchPlaceholder="Поиск типа..."
                                                disabled={!isAdmin}
                                            />
                                            <InputError message={errors.type} />
                                            <input type="hidden" name="type" value={selectedType} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="chat_id">Telegram ID</Label>
                                            <Input
                                                id="chat_id"
                                                name="chat_id"
                                                type="text"
                                                placeholder="Введите Telegram ID"
                                                defaultValue={employee.chat_id || ''}
                                            />
                                            <InputError message={errors.chat_id} />
                                        </div>

                                        {selectedType === 'frp' && (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label>Склад</Label>
                                                    <DynamicSearchableSelect
                                                        value={selectedWarehouse}
                                                        onValueChange={setSelectedWarehouse}
                                                        placeholder="Выберите склад"
                                                        searchPlaceholder="Поиск склада..."
                                                        searchUrl="/employees/search-warehouses"
                                                        selectedOption={currentWarehouse}
                                                        disabled={!isAdmin}
                                                        emptyText="Склады не найдены"
                                                    />
                                                    <InputError message={errors.warehouse_id} />
                                                    <input type="hidden" name="warehouse_id" value={selectedWarehouse} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Руководитель МОЛ</Label>
                                                    <SearchableSelect
                                                        options={seniorOptions}
                                                        value={selectedSenior}
                                                        onValueChange={setSelectedSenior}
                                                        placeholder="Выберите руководителя"
                                                        searchPlaceholder="Поиск руководителя..."
                                                        disabled={!isAdmin}
                                                    />
                                                    <InputError message={errors.senior_id} />
                                                    <input type="hidden" name="senior_id" value={selectedSenior} />
                                                </div>
                                            </>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Новый пароль (оставьте пустым, чтобы не изменять)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Введите новый пароль"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input type="hidden" name="is_active" value="0" />
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                name="is_active"
                                                value="1"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                                className="h-4 w-4"
                                            />
                                            <Label htmlFor="is_active">Активен</Label>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="button" variant="outline" onClick={() => router.visit('/employees')}>
                                            Отменить
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Сохранить изменения
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

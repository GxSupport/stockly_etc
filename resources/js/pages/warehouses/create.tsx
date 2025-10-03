import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface WarehouseType {
    id: number;
    title: string;
    is_active: boolean;
}

interface CreateWarehouseProps {
    warehouse_types: WarehouseType[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Склады',
        href: '/warehouses',
    },
    {
        title: 'Добавить склад',
        href: '/warehouses/create',
    },
];

export default function CreateWarehouse({ warehouse_types }: CreateWarehouseProps) {
    const [selectedType, setSelectedType] = useState<string>('');

    const handleSubmit = () => {
        // Form will be submitted via Inertia
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Добавить склад" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/warehouses')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Добавить склад</h1>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Информация о складе</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form action="/warehouses/create" method="post" className="flex flex-col gap-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="code">Код склада *</Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                type="text"
                                                placeholder="Введите код склада (например: MAIN-01, PROD-01)"
                                                required
                                                autoFocus
                                                className="font-mono"
                                                style={{ textTransform: 'uppercase' }}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLInputElement;
                                                    target.value = target.value.toUpperCase();
                                                }}
                                            />
                                            <InputError message={errors.code} />
                                            <div className="text-xs text-muted-foreground">
                                                Используйте уникальный код (например: MAIN-01, TEMP-02)
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="title">Название склада *</Label>
                                            <Input id="title" name="title" type="text" placeholder="Введите название склада" required />
                                            <InputError message={errors.title} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Тип склада *</Label>
                                            <Select value={selectedType} onValueChange={setSelectedType} name="type">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите тип склада" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouse_types.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            {type.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.type} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="comment">Комментарий</Label>
                                            <Textarea
                                                id="comment"
                                                name="comment"
                                                placeholder="Добавьте описание или комментарий к складу..."
                                                className="min-h-[80px]"
                                            />
                                            <InputError message={errors.comment} />
                                            <div className="text-xs text-muted-foreground">Необязательное поле для дополнительной информации</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="button" variant="outline" onClick={() => router.visit('/warehouses')}>
                                            Отменить
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Сохранить склад
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

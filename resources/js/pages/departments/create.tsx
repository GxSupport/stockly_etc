import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Отделы',
        href: '/departments',
    },
    {
        title: 'Добавить отдел',
        href: '/departments/create',
    },
];

export default function CreateDepartment() {
    const handleSubmit = () => {
        // Form will be submitted via Inertia
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Добавить отдел" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.visit('/departments')}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Добавить отдел</h1>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Информация об отделе</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action="/departments/create"
                            method="post"
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="dep_code">Код отдела *</Label>
                                            <Input
                                                id="dep_code"
                                                name="dep_code"
                                                type="text"
                                                placeholder="Введите код отдела (например: IT, HR, FIN)"
                                                required
                                                autoFocus
                                                className="font-mono"
                                                style={{ textTransform: 'uppercase' }}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLInputElement;
                                                    target.value = target.value.toUpperCase();
                                                }}
                                            />
                                            <InputError message={errors.dep_code} />
                                            <div className="text-xs text-muted-foreground">
                                                Используйте короткий уникальный код (2-5 символов)
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="title">Название отдела *</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                type="text"
                                                placeholder="Введите полное название отдела"
                                                required
                                            />
                                            <InputError message={errors.title} />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit('/departments')}
                                        >
                                            Отменить
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Сохранить отдел
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
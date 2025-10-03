import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Типы документов',
        href: '/document-types',
    },
    {
        title: 'Добавить тип документа',
        href: '/document-types/create',
    },
];

export default function CreateDocumentType() {
    const handleSubmit = () => {
        // Form will be submitted via Inertia
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Добавить тип документа" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/document-types')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Добавить тип документа</h1>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Информация о типе документа</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form action="/document-types/create" method="post" className="flex flex-col gap-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="code">Код документа *</Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                type="text"
                                                placeholder="Введите код документа (например: INV, ORD, REC)"
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
                                            <div className="text-xs text-muted-foreground">Используйте уникальный код (например: INV, ORD, REC)</div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="title">Название типа документа *</Label>
                                            <Input id="title" name="title" type="text" placeholder="Введите название типа документа" required />
                                            <InputError message={errors.title} />
                                            <div className="text-xs text-muted-foreground">
                                                Введите описательное название (например: Счет-фактура, Заказ на поставку)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="button" variant="outline" onClick={() => router.visit('/document-types')}>
                                            Отменить
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Сохранить тип документа
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

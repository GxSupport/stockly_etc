import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        title: '',
        workflow_type: '1',
        requires_deputy_approval: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/document-types/create');
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
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Код документа *</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="Введите код документа (например: INV, ORD, REC)"
                                        required
                                        autoFocus
                                        className="font-mono"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <InputError message={errors.code} />
                                    <div className="text-xs text-muted-foreground">Используйте уникальный код (например: INV, ORD, REC)</div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="title">Название типа документа *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Введите название типа документа"
                                        required
                                    />
                                    <InputError message={errors.title} />
                                    <div className="text-xs text-muted-foreground">
                                        Введите описательное название (например: Счет-фактура, Заказ на поставку)
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Label>Тип согласования *</Label>
                                    <div className="grid gap-3">
                                        <label
                                            className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors ${
                                                data.workflow_type === '1' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="workflow_type"
                                                value="1"
                                                checked={data.workflow_type === '1'}
                                                onChange={(e) => setData('workflow_type', e.target.value)}
                                                className="mt-1"
                                            />
                                            <div className="grid gap-1">
                                                <span className="font-medium">Последовательное согласование</span>
                                                <p className="text-sm text-muted-foreground">
                                                    Документ проходит через всех сотрудников по очереди: МОЛ → Начальник → Директор → Бухгалтер
                                                </p>
                                            </div>
                                        </label>
                                        <label
                                            className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors ${
                                                data.workflow_type === '2' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="workflow_type"
                                                value="2"
                                                checked={data.workflow_type === '2'}
                                                onChange={(e) => {
                                                    setData('workflow_type', e.target.value);
                                                    // Reset deputy approval when switching to direct workflow
                                                    if (e.target.value === '2') {
                                                        setData('requires_deputy_approval', false);
                                                    }
                                                }}
                                                className="mt-1"
                                            />
                                            <div className="grid gap-1">
                                                <span className="font-medium">Прямое назначение</span>
                                                <p className="text-sm text-muted-foreground">
                                                    Создатель назначает конкретного сотрудника: Создатель → Назначенный сотрудник → Бухгалтер
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                    <InputError message={errors.workflow_type} />
                                </div>

                                {data.workflow_type === '1' && (
                                    <div className="grid gap-3">
                                        <div className="flex items-center space-x-3 rounded-lg border p-4">
                                            <Checkbox
                                                id="requires_deputy_approval"
                                                checked={data.requires_deputy_approval}
                                                onCheckedChange={(checked) => setData('requires_deputy_approval', checked === true)}
                                            />
                                            <div className="grid gap-1">
                                                <Label htmlFor="requires_deputy_approval" className="cursor-pointer font-medium">
                                                    Требуется согласование зам. директора
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Документ должен быть одобрен заместителем директора перед директором
                                                </p>
                                            </div>
                                        </div>
                                        <InputError message={errors.requires_deputy_approval} />
                                    </div>
                                )}
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
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

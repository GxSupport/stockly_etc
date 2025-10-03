import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BarChart3, FileText, Package, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Отчеты',
        href: '/reports',
    },
];

export default function Reports() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Отчеты" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Отчеты</h2>
                    <p className="text-muted-foreground">Выберите тип отчета для просмотра</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Product Report Card */}
                    <Card className="transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                <CardTitle>Отчет по товарам</CardTitle>
                            </div>
                            <CardDescription>Остатки товаров на складе по состоянию на выбранную дату</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" onClick={() => router.visit('/reports/products')}>
                                <FileText className="mr-2 h-4 w-4" />
                                Открыть отчет
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Placeholder for future reports */}
                    <Card className="opacity-60">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Отчет по движению</CardTitle>
                            </div>
                            <CardDescription>Движение товаров за период (в разработке)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" disabled>
                                <FileText className="mr-2 h-4 w-4" />
                                Скоро доступно
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="opacity-60">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Аналитический отчет</CardTitle>
                            </div>
                            <CardDescription>Анализ оборачиваемости товаров (в разработке)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" disabled>
                                <FileText className="mr-2 h-4 w-4" />
                                Скоро доступно
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

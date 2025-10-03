import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Download, Loader2, Package, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
    name: string;
    warehouse: string;
    measure: string;
    price: number;
    count: string;
    nomenclature: string;
}

interface ProductsReportPageProps {
    date?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Отчеты',
        href: '/reports',
    },
    {
        title: 'Отчет по товарам',
        href: '/reports/products',
    },
];

export default function ProductsReport({ date }: ProductsReportPageProps) {
    const [selectedDate, setSelectedDate] = useState(date || formatDate(new Date()));
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Format date to dd.mm.yyyy
    function formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    // Convert dd.mm.yyyy to yyyy-mm-dd for input
    function toInputDate(dateStr: string): string {
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`;
    }

    // Convert yyyy-mm-dd to dd.mm.yyyy
    function fromInputDate(dateStr: string): string {
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    }

    const fetchProducts = async (reportDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/product/list?date=${reportDate}`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setProducts(data.data);
            } else {
                setError(data.message || 'Ошибка при загрузке отчета');
                setProducts([]);
            }
        } catch (err) {
            setError('Ошибка при загрузке отчета');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = fromInputDate(e.target.value);
        setSelectedDate(newDate);
    };

    const handleLoadReport = () => {
        fetchProducts(selectedDate);
    };

    const handleExport = () => {
        // Convert to CSV
        const headers = ['Номенклатура', 'Склад', 'Ед.Изм', 'Цена', 'Количество', 'Код'];
        const rows = filteredProducts.map((p) => [p.name, p.warehouse, p.measure, p.price.toString(), p.count, p.nomenclature]);

        const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `products_report_${selectedDate.replace(/\./g, '_')}.csv`;
        link.click();
    };

    // Filter products by search query
    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.nomenclature.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Calculate totals
    const totalQuantity = filteredProducts.reduce((sum, p) => sum + parseFloat(p.count || '0'), 0);
    const totalAmount = filteredProducts.reduce((sum, p) => sum + p.price * parseFloat(p.count || '0'), 0);

    // Load initial data
    useEffect(() => {
        fetchProducts(selectedDate);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Отчет по товарам" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Отчет по товарам</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Параметры отчета
                        </CardTitle>
                        <CardDescription>Выберите дату для формирования отчета</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-4">
                            <div className="max-w-xs flex-1">
                                <Label htmlFor="report-date">Дата отчета</Label>
                                <Input
                                    id="report-date"
                                    type="date"
                                    value={toInputDate(selectedDate)}
                                    onChange={handleDateChange}
                                    className="mt-1.5"
                                />
                            </div>
                            <Button onClick={handleLoadReport} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Загрузка...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-4 w-4" />
                                        Сформировать отчет
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-destructive">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {products.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Результаты отчета
                                    </CardTitle>
                                    <CardDescription>
                                        Найдено товаров: {filteredProducts.length} из {products.length}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" onClick={handleExport}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Экспорт CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Input
                                    placeholder="Поиск по названию или коду..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="max-w-md"
                                />
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Номенклатура</TableHead>
                                            <TableHead>Склад</TableHead>
                                            <TableHead>Ед.Изм</TableHead>
                                            <TableHead className="text-right">Цена</TableHead>
                                            <TableHead className="text-right">Количество</TableHead>
                                            <TableHead className="text-right">Сумма</TableHead>
                                            <TableHead>Код</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                    {searchQuery ? 'Товары не найдены' : 'Нет данных'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            <>
                                                {filteredProducts.map((product, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{product.name}</TableCell>
                                                        <TableCell>{product.warehouse}</TableCell>
                                                        <TableCell>{product.measure}</TableCell>
                                                        <TableCell className="text-right">
                                                            {product.price.toLocaleString('ru-RU', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </TableCell>
                                                        <TableCell className="text-right">{product.count}</TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {(product.price * parseFloat(product.count || '0')).toLocaleString('ru-RU', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{product.nomenclature}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-muted/50 font-semibold">
                                                    <TableCell colSpan={4} className="text-right">
                                                        Итого:
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {totalQuantity.toLocaleString('ru-RU', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {totalAmount.toLocaleString('ru-RU', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

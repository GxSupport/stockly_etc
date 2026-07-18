import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Loader2, Package, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WarehouseType {
    id: number;
    title: string;
    is_active: boolean;
}

interface Warehouse {
    id: number;
    code: string;
    title: string;
    type: number;
    type_info: WarehouseType | null;
    is_active: boolean;
    comment: string | null;
}

interface Product {
    name: string;
    warehouse: string;
    measure: string;
    price: number;
    count: string;
    nomenclature: string;
}

interface WarehouseShowPageProps {
    warehouse: Warehouse;
}

export default function WarehouseShow({ warehouse }: WarehouseShowPageProps) {
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Склады',
            href: '/warehouses',
        },
        {
            title: warehouse.title,
            href: `/warehouses/${warehouse.id}`,
        },
    ];

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

    const fetchProducts = async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/warehouses/${warehouse.id}/products?date=${date}`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setProducts(data.data);
            } else {
                setError(data.message || 'Ошибка при загрузке товаров');
                setProducts([]);
            }
        } catch {
            setError('Ошибка при загрузке товаров');
            setProducts([]);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(fromInputDate(e.target.value));
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Склад: ${warehouse.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/warehouses')} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">{warehouse.title}</h1>
                        <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>{warehouse.is_active ? 'Активен' : 'Неактивен'}</Badge>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Информация о складе
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Код склада</div>
                                <div className="font-mono font-medium">{warehouse.code}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Название</div>
                                <div className="font-medium">{warehouse.title}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Тип</div>
                                <div className="font-medium">{warehouse.type_info?.title || 'Не указано'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Комментарий</div>
                                <div className="font-medium">{warehouse.comment || '—'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Остатки товаров
                        </CardTitle>
                        <CardDescription>Выберите дату для просмотра остатков на складе</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-4">
                            <div className="max-w-xs flex-1">
                                <Label htmlFor="products-date">Дата</Label>
                                <Input id="products-date" type="date" value={toInputDate(selectedDate)} onChange={handleDateChange} className="mt-1.5" />
                            </div>
                            <Button onClick={() => fetchProducts(selectedDate)} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Загрузка...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-4 w-4" />
                                        Показать
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <div className="font-medium text-destructive">{error}</div>
                        </CardContent>
                    </Card>
                )}

                {loading && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-3">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="h-10 animate-pulse rounded-md bg-muted" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && loaded && !error && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Товары на складе
                            </CardTitle>
                            <CardDescription>
                                Найдено товаров: {filteredProducts.length} из {products.length}
                            </CardDescription>
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
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    {searchQuery ? 'Товары не найдены' : 'На складе нет товаров'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            <>
                                                {filteredProducts.map((product, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{product.name}</TableCell>
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
                                                    <TableCell colSpan={3} className="text-right">
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

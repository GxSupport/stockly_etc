import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, Plus, Trash2, Calendar } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import { SearchableSelect } from '@/components/searchable-select';
import { type BreadcrumbItem } from '@/types';

interface DocumentType {
    id: number;
    code: string;
    title: string;
}

interface Product {
    name: string;
    warehouse: string;
    measure: string;
    price: number;
    count: string;
    nomenclature: string;
}

interface CreateDocumentProps {
    documentTypes: DocumentType[];
    products: Product[];
}

interface ProductItem {
    id: string;
    selected_product: Product | null;
    product_name: string;
    measure: string;
    quantity: number;
    amount: number;
    nomenclature: string;
    max_quantity: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'АКТ',
        href: '/documents',
    },
    {
        title: 'Добавить АКТ',
        href: '/documents/create',
    },
];

export default function CreateDocument({ documentTypes, products: allProducts }: CreateDocumentProps) {
    const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
    const [documentNumber, setDocumentNumber] = useState('2025/');
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const today = new Date().toLocaleDateString('ru-RU');

    const addProduct = () => {
        const newProduct: ProductItem = {
            id: Math.random().toString(36).substr(2, 9),
            selected_product: null,
            product_name: '',
            measure: '',
            quantity: 1,
            amount: 0,
            nomenclature: '',
            max_quantity: 0,
        };
        setProducts([...products, newProduct]);
    };

    const removeProduct = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const updateProduct = (id: string, field: keyof ProductItem, value: any) => {
        setProducts(products.map(p => {
            if (p.id === id) {
                const updated = { ...p, [field]: value };

                // Auto-fill fields when product is selected
                if (field === 'selected_product' && value) {
                    const selectedProduct = allProducts.find(fp => fp.nomenclature === value);
                    if (selectedProduct) {
                        updated.selected_product = selectedProduct;
                        updated.product_name = selectedProduct.name;
                        updated.measure = selectedProduct.measure;
                        updated.amount = selectedProduct.price * updated.quantity;
                        updated.nomenclature = selectedProduct.nomenclature;
                        updated.max_quantity = parseInt(selectedProduct.count);
                        // Agar joriy quantity max dan ko'p bo'lsa, max ga o'rnatamiz
                        if (updated.quantity > parseInt(selectedProduct.count)) {
                            updated.quantity = parseInt(selectedProduct.count);
                            updated.amount = selectedProduct.price * updated.quantity;
                        }
                    }
                }

                // Recalculate amount when quantity changes
                if (field === 'quantity' && p.selected_product) {
                    // Quantity validation - max_quantity dan ko'p bo'lsa cheklaymiz
                    const maxQty = p.max_quantity;
                    const validatedQuantity = Math.max(1, Math.min(value, maxQty));
                    updated.quantity = validatedQuantity;
                    updated.amount = p.selected_product.price * validatedQuantity;
                }

                return updated;
            }
            return p;
        }));
    };

    // Calculate total amount
    useEffect(() => {
        const total = products.reduce((sum, product) => sum + product.amount, 0);
        setTotalAmount(total);
    }, [products]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.startsWith('2025/')) {
            setDocumentNumber(value);
        } else if (!value.includes('2025/')) {
            setDocumentNumber('2025/' + value.replace('2025/', ''));
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleSubmit = () => {
        // Form will be submitted via Inertia
    };

    const documentTypeOptions = documentTypes.map(docType => ({
        value: docType.id.toString(),
        label: docType.title,
    }));

    const productOptions = allProducts.map(product => {
        const truncatedName = product.name.length > 50
            ? product.name.substring(0, 50) + '...'
            : product.name;

        return {
            value: product.nomenclature,
            label: `${truncatedName} | ${product.measure} | ${formatAmount(product.price)} | Склад: ${product.count}`,
        };
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Добавить АКТ" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit('/documents')}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Добавить АКТ</h1>
                    </div>
                </div>

                <Form
                    action="/documents/create"
                    method="post"
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <Card className="max-w-4xl">
                                <CardHeader>
                                    <CardTitle>Основная информация</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>Тип документа *</Label>
                                            <SearchableSelect
                                                options={documentTypeOptions}
                                                value={selectedDocumentType?.id.toString()}
                                                onValueChange={(value) => {
                                                    const docType = documentTypes.find(d => d.id.toString() === value);
                                                    setSelectedDocumentType(docType || null);
                                                }}
                                                placeholder="Выберите тип документа"
                                                searchPlaceholder="Поиск типа документа..."
                                            />
                                            <InputError message={errors.document_type} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="number">Номер документа *</Label>
                                            <Input
                                                id="number"
                                                name="number"
                                                type="text"
                                                value={documentNumber}
                                                onChange={handleNumberChange}
                                                placeholder="2025/"
                                                required
                                                className="font-mono"
                                            />
                                            <InputError message={errors.number} />
                                            <div className="text-xs text-muted-foreground">
                                                Префикс "2025/" нельзя удалить
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="order_date">Дата заказа</Label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="order_date"
                                                    name="order_date"
                                                    type="text"
                                                    value={today}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="total_amount">Общая сумма</Label>
                                            <Input
                                                id="total_amount"
                                                name="total_amount"
                                                type="text"
                                                value={formatAmount(totalAmount)}
                                                readOnly
                                                className="bg-muted font-mono"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="max-w-6xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Товары</CardTitle>
                                        <Button type="button" onClick={addProduct} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Добавить товар
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {products.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Нажмите "Добавить товар" чтобы начать добавление товаров
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {products.map((product, index) => (
                                                <div key={product.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-medium">Товар #{index + 1}</h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeProduct(product.id)}
                                                            className="gap-2 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Удалить
                                                        </Button>
                                                    </div>

                                                    <div className="flex gap-4 items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <Label className="block mb-2">Товар *</Label>
                                                            <SearchableSelect
                                                                options={productOptions}
                                                                value={product.selected_product?.nomenclature}
                                                                onValueChange={(value) => {
                                                                    updateProduct(product.id, 'selected_product', value);
                                                                }}
                                                                placeholder="Выберите товар"
                                                                searchPlaceholder="Поиск товара..."
                                                            />
                                                        </div>

                                                        <div className="w-24">
                                                            <Label className="block mb-2">Ед.изм.</Label>
                                                            <Input
                                                                value={product.measure}
                                                                readOnly
                                                                className="bg-muted h-10"
                                                                placeholder="шт"
                                                            />
                                                        </div>

                                                        <div className="w-32">
                                                            <Label className="block mb-2">Количество *</Label>
                                                            <div className="space-y-1">
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    max={product.max_quantity > 0 ? product.max_quantity : undefined}
                                                                    value={product.quantity}
                                                                    onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                                                                    placeholder="1"
                                                                    className={`h-10 ${product.max_quantity > 0 && product.quantity > product.max_quantity ? 'border-red-500' : ''}`}
                                                                />
                                                                {product.max_quantity > 0 && (
                                                                    <div className="text-xs text-green-600 whitespace-nowrap">
                                                                        Макс: {product.max_quantity}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="w-40">
                                                            <Label className="block mb-2">Сумма</Label>
                                                            <Input
                                                                value={formatAmount(product.amount)}
                                                                readOnly
                                                                className="bg-muted font-mono h-10"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Hidden nomenclature field */}
                                                    <input
                                                        type="hidden"
                                                        name={`products[${index}][nomenclature]`}
                                                        value={product.nomenclature}
                                                    />
                                                </div>
                                            ))}

                                            {products.length > 0 && (
                                                <div className="border-t pt-4">
                                                    <div className="flex justify-end">
                                                        <div className="text-right">
                                                            <div className="text-sm text-muted-foreground">Итого:</div>
                                                            <div className="text-2xl font-bold">{formatAmount(totalAmount)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Hidden fields */}
                            <input type="hidden" name="type" value={selectedDocumentType?.id || ''} />
                            <input type="hidden" name="date_order" value={new Date().toISOString().split('T')[0]} />
                            <input type="hidden" name="total_amount" value={totalAmount} />

                            {/* Product fields */}
                            {products.map((product, index) => (
                                <div key={product.id} style={{ display: 'none' }}>
                                    <input name={`products[${index}][title]`} value={product.product_name} readOnly />
                                    <input name={`products[${index}][measure]`} value={product.measure} readOnly />
                                    <input name={`products[${index}][quantity]`} value={product.quantity} readOnly />
                                    <input name={`products[${index}][amount]`} value={product.amount} readOnly />
                                    <input name={`products[${index}][nomenclature]`} value={product.nomenclature} readOnly />
                                </div>
                            ))}

                            <div className="flex gap-4 pt-4 max-w-6xl">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/documents')}
                                >
                                    Отменить
                                </Button>
                                <Button type="submit" disabled={processing || products.length === 0 || !selectedDocumentType}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Сохранить документ
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}

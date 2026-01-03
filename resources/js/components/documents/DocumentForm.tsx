import SmsConfirmationModal from '@/components/SmsConfirmationModal';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, LoaderCircle, Plus, Save, Send, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Interfaces
interface DocumentType {
    id: number;
    code: string;
    title: string;
    workflow_type: number; // 1 = ketma-ket, 2 = to'g'ridan-to'g'ri
}
interface User {
    id: number;
    name: string;
    type: string;
}
interface Product {
    name: string;
    warehouse: string;
    measure: string;
    price: number;
    count: string;
    nomenclature: string;
}
interface Service {
    name: string;
    basic_resource_code: string;
}
export interface ProductItem {
    id: string | number;
    selected_product: Product | null;
    product_name: string;
    measure: string;
    quantity: number;
    amount: number;
    nomenclature: string;
    max_quantity: number;
    note: string;
}
export interface DocumentData {
    id?: number;
    document_type_id: string | null;
    assigned_user_id?: string | undefined;
    number: string;
    products: ProductItem[];
    main_tool: string;
    date_order: string;
    total_amount?: number;
    is_draft?: boolean;
    is_returned?: boolean;
    status?: number;
    note?: string;
}

interface DocumentFormProps {
    data: DocumentData;
    setData: (key: keyof DocumentData, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    documentTypes: DocumentType[];
    allProducts: Product[];
    services: Service[];
    users?: User[];
    isEditMode?: boolean;
    documentNotes?: any[];
}

export default function DocumentForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    documentTypes,
    allProducts,
    services,
    users = [],
    isEditMode = false,
    documentNotes = [],
}: DocumentFormProps) {
    const currentYear = new Date().getFullYear();
    const [isMainToolFromService, setIsMainToolFromService] = useState(!!data.main_tool);
    const [composition, setComposition] = useState<any[]>([]);
    const [showSmsModal, setShowSmsModal] = useState(false);
    const [sendingToNext, setSendingToNext] = useState(false);
    const today = new Date(data.date_order).toLocaleDateString('ru-RU');

    // Document status logic
    const canEdit = !isEditMode || data.is_draft || data.is_returned;
    const canSendToNext = data.is_draft && !processing && data.products.length > 0;
    const isReturned = data.is_returned;

    // User role types for display
    const userRoles = {
        frp: 'МОЛ',
        header_frp: 'Руководители МОЛ',
        director: 'Технический директор',
        buxgalter: 'Бухгалтерия',
        admin: 'Администратор',
    };

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
            note: '',
        };
        setData('products', [...data.products, newProduct]);
    };

    const removeProduct = (id: string | number) => {
        setData(
            'products',
            data.products.filter((p) => p.id !== id),
        );
    };

    const updateProduct = (id: string | number, field: keyof ProductItem, value: any) => {
        const updatedProducts = data.products.map((p) => {
            if (p.id === id) {
                const updated = { ...p, [field]: value };
                if (field === 'selected_product' && value) {
                    const selectedProduct = allProducts.find((fp) => fp.nomenclature === value);
                    if (selectedProduct) {
                        updated.selected_product = selectedProduct;
                        updated.product_name = selectedProduct.name;
                        updated.measure = selectedProduct.measure;
                        updated.quantity = 1;
                        updated.amount = parseNumericValue(selectedProduct.price) * updated.quantity;
                        updated.nomenclature = selectedProduct.nomenclature;
                        updated.max_quantity = parseInt(selectedProduct.count);
                    }
                }
                if (field === 'quantity' && p.selected_product) {
                    const maxQty = p.max_quantity;
                    const validatedQuantity = Math.max(1, Math.min(value, maxQty));
                    updated.quantity = validatedQuantity;
                    updated.amount = parseNumericValue(p.selected_product.price) * validatedQuantity;
                }
                return updated;
            }
            return p;
        });
        setData('products', updatedProducts);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const prefix = `${currentYear}/`;
        setData('number', value.startsWith(prefix) ? value : prefix + value.replace(prefix, ''));
    };

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    // Helper function to safely parse numeric values
    const parseNumericValue = (value: any): number => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    const totalAmount = data.products.reduce((sum, product) => sum + parseNumericValue(product.amount), 0);
    const selectedDocumentType = documentTypes.find((d) => d.id.toString() === data.document_type_id);
    // To'g'ridan-to'g'ri workflow uchun xodim tanlash ko'rsatish
    const showAssignedUserSelect = selectedDocumentType && selectedDocumentType.workflow_type === 2;
    const showMainToolInput = selectedDocumentType && selectedDocumentType.id === 1 && !isMainToolFromService;
    const showMainToolSelect =
        selectedDocumentType &&
        (selectedDocumentType.id === 4 || (selectedDocumentType.id === 1 && isMainToolFromService) || selectedDocumentType.id === 2);
    const showProductNotes = selectedDocumentType && selectedDocumentType.id === 3;
    const showPlaceInstallation = selectedDocumentType && selectedDocumentType.id === 1;
    const showCompositionInterface = selectedDocumentType && selectedDocumentType.id === 2;
    const showRegularProducts = selectedDocumentType && selectedDocumentType.id !== 2;

    useEffect(() => {
        if (data.main_tool && showCompositionInterface) {
            loadComposition(data.main_tool);
        }
    }, [data.main_tool, showCompositionInterface]);

    const loadComposition = async (osCode: string) => {
        try {
            const response = await axios.post('/documents/get-composition', { os_code: osCode });
            if (response.data.success) {
                setComposition(response.data.composition);
                if (selectedDocumentType?.id === 2) {
                    const compositionProducts: ProductItem[] = [
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            selected_product: null,
                            product_name: '',
                            measure: '',
                            quantity: 1,
                            amount: 0,
                            nomenclature: '',
                            max_quantity: 0,
                            note: '',
                        },
                    ];
                    setData('products', compositionProducts);
                }
            }
        } catch (error) {
            console.error('Error loading composition:', error);
        }
    };

    const documentTypeOptions = documentTypes.map((docType) => ({ value: docType.id.toString(), label: docType.title }));
    const serviceOptions = services.map((service) => ({ value: service.basic_resource_code, label: service.name }));
    const userOptions = users.map((user) => ({ value: user.id.toString(), label: `${user.name} (${userRoles[user.type as keyof typeof userRoles] || user.type})` }));
    const productOptions = allProducts.map((product) => ({
        value: product.nomenclature,
        label: `${product.name.substring(0, 50)}... | ${product.measure} | ${formatAmount(product.price)} | Склад: ${product.count}`,
    }));

    const handleSendToNext = async () => {
        if (!data.id) return;

        setSendingToNext(true);
        try {
            // Check if SMS confirmation is required
            const smsCheck = await axios.get(`/documents/${data.id}/check-sms`);

            if (smsCheck.data.sms_required) {
                setShowSmsModal(true);
            } else {
                // Send directly without SMS
                await sendToNextLevel();
            }
        } catch (error) {
            console.error('Error checking SMS requirement:', error);
        } finally {
            setSendingToNext(false);
        }
    };

    const sendToNextLevel = async () => {
        if (!data.id) return;

        try {
            const response = await axios.post(`/documents/${data.id}/send-to-next`);
            if (response.data.success) {
                router.visit('/documents', {
                    preserveState: false,
                    onSuccess: () => {
                        // Show success message
                    },
                });
            }
        } catch (error) {
            console.error('Error sending to next level:', error);
        }
    };

    const handleSmsSuccess = () => {
        setShowSmsModal(false);
        setSendingToNext(false);
        router.visit('/documents', {
            preserveState: false,
            replace: true,
            onSuccess: () => {
                // Show success message
            },
        });
    };

    return (
        <form
            onSubmit={(e) => {
                // Prevent submission if SMS modal is open or sending to next
                if (showSmsModal || sendingToNext) {
                    e.preventDefault();
                    return;
                }
                onSubmit(e);
            }}
            className="flex flex-col gap-6"
        >
            <Card className="max-w-full">
                {errors.general && <div className="p-4 text-red-600">{errors.general}</div>}
                <CardHeader>
                    <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Тип документа *</Label>
                            <SearchableSelect
                                options={documentTypeOptions}
                                value={data.document_type_id ?? undefined}
                                onValueChange={(value) => {
                                    setData('document_type_id', value);
                                    // Reset assigned_user_id when document type changes
                                    setData('assigned_user_id', undefined);
                                }}
                                placeholder="Выберите тип документа"
                                searchPlaceholder="Поиск типа документа..."
                            />
                            <InputError message={errors.document_type_id} />
                        </div>
                        {showAssignedUserSelect && (
                            <div className="grid gap-2">
                                <Label>Назначить сотруднику *</Label>
                                <SearchableSelect
                                    options={userOptions}
                                    value={data.assigned_user_id}
                                    onValueChange={(value) => setData('assigned_user_id', value)}
                                    placeholder="Выберите сотрудника"
                                    searchPlaceholder="Поиск сотрудника..."
                                />
                                <InputError message={errors.assigned_user_id} />
                                <div className="text-xs text-muted-foreground">
                                    Документ будет отправлен выбранному сотруднику для подтверждения
                                </div>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="number">Номер документа *</Label>
                            <Input
                                id="number"
                                name="number"
                                type="text"
                                value={data.number}
                                onChange={handleNumberChange}
                                required
                                className="font-mono"
                            />
                            <InputError message={errors.number} />
                            <div className="text-xs text-muted-foreground">Префикс "{currentYear}/" нельзя удалить</div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="order_date">Дата заказа</Label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <Input id="order_date" name="order_date" type="text" value={today} readOnly className="bg-muted" />
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
                        {showMainToolInput && (
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="main_tool_input">Наименование ОС *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="main_tool_input"
                                        type="text"
                                        value={data.main_tool}
                                        onChange={(e) => setData('main_tool', e.target.value)}
                                        placeholder="Введите наименование ОС"
                                        className="flex-1"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsMainToolFromService(!isMainToolFromService)}
                                        className="gap-2 whitespace-nowrap"
                                    >
                                        {isMainToolFromService ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                        Из списка
                                    </Button>
                                </div>
                            </div>
                        )}
                        {showMainToolSelect && (
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Наименование ОС *</Label>
                                <div className="flex gap-2">
                                    <SearchableSelect
                                        options={serviceOptions}
                                        value={data.main_tool}
                                        onValueChange={(value) => setData('main_tool', value)}
                                        placeholder="Выберите основное средство"
                                        searchPlaceholder="Поиск основного средства..."
                                        className="flex-1"
                                    />
                                    {selectedDocumentType?.id === 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsMainToolFromService(!isMainToolFromService);
                                                setData('main_tool', '');
                                            }}
                                            className="gap-2 whitespace-nowrap"
                                        >
                                            {isMainToolFromService ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                            Вручную
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {showRegularProducts && (
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
                        {data.products.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">Нажмите "Добавить товар" чтобы начать</div>
                        ) : (
                            <div className="space-y-4">
                                {data.products.map((product, index) => (
                                    <div key={product.id} className="rounded-lg border p-4">
                                        <div className="mb-4 flex items-center justify-between">
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
                                        <div className="flex items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <Label className="mb-2 block">Товар *</Label>
                                                <SearchableSelect
                                                    options={productOptions}
                                                    value={product.selected_product?.nomenclature}
                                                    onValueChange={(value) => updateProduct(product.id, 'selected_product', value)}
                                                    placeholder="Выберите товар"
                                                    searchPlaceholder="Поиск товара..."
                                                />
                                            </div>
                                            <div className="w-24">
                                                <Label className="mb-2 block">Ед.изм.</Label>
                                                <Input value={product.measure} readOnly className="h-10 bg-muted" />
                                            </div>
                                            <div className="w-32">
                                                <Label className="mb-2 block">Количество *</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max={product.max_quantity > 0 ? product.max_quantity : undefined}
                                                    value={product.quantity}
                                                    onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                                                    className={`h-10 ${product.max_quantity > 0 && product.quantity > product.max_quantity ? 'border-red-500' : ''}`}
                                                />
                                                {product.max_quantity > 0 && (
                                                    <div className="text-xs whitespace-nowrap text-green-600">Макс: {product.max_quantity}</div>
                                                )}
                                            </div>
                                            <div className="w-40">
                                                <Label className="mb-2 block">Сумма</Label>
                                                <Input value={formatAmount(product.amount)} readOnly className="h-10 bg-muted font-mono" />
                                            </div>
                                        </div>
                                        {showProductNotes && (
                                            <div className="mt-4">
                                                <Label htmlFor={`note_${product.id}`}>Списания *</Label>
                                                <Input
                                                    id={`note_${product.id}`}
                                                    type="text"
                                                    value={product.note}
                                                    onChange={(e) => updateProduct(product.id, 'note', e.target.value)}
                                                    required={showProductNotes}
                                                    className="mt-2"
                                                />
                                            </div>
                                        )}
                                        {showPlaceInstallation && (
                                            <div className="mt-4">
                                                <Label htmlFor={`note_${product.id}`}>Место установки *</Label>
                                                <Input
                                                    id={`note_${product.id}`}
                                                    type="text"
                                                    value={product.note}
                                                    onChange={(e) => updateProduct(product.id, 'note', e.target.value)}
                                                    required={showPlaceInstallation}
                                                    className="mt-2"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {data.products.length > 0 && (
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
            )}

            {showCompositionInterface && (
                <Card className="max-w-6xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Инструменты для демонтажа</CardTitle>
                            <Button type="button" onClick={addProduct} className="gap-2" disabled={data.products.length >= composition.length}>
                                <Plus className="h-4 w-4" />
                                Добавить инструмент
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.products.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                {composition.length === 0 ? 'Выберите ОС для загрузки состава' : 'Нажмите "Добавить инструмент"'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.products.map((product, index) => (
                                    <div key={product.id} className="rounded-lg border p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="font-medium">Инструмент #{index + 1}</h4>
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
                                        <div className="flex items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <Label className="mb-2 block">Инструмент *</Label>
                                                <SearchableSelect
                                                    options={composition.map((comp) => ({
                                                        value: comp.subconto_kt1,
                                                        label: comp.subconto_kt1,
                                                        disabled: data.products.some(
                                                            (p) => p.product_name === comp.subconto_kt1 && p.id !== product.id,
                                                        ),
                                                    }))}
                                                    value={product.product_name}
                                                    onValueChange={(value) => {
                                                        const selectedComp = composition.find((c) => c.subconto_kt1 === value);
                                                        if (selectedComp) {
                                                            updateProduct(product.id, 'product_name', selectedComp.subconto_kt1);
                                                            updateProduct(product.id, 'measure', selectedComp.quantity_turnover_kt);
                                                            updateProduct(product.id, 'max_quantity', parseInt(selectedComp.quantity_turnover_kt));
                                                        }
                                                    }}
                                                    placeholder="Выберите инструмент"
                                                    searchPlaceholder="Поиск инструмента..."
                                                />
                                            </div>
                                            <div className="w-32">
                                                <Label className="mb-2 block">Количество *</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max={product.max_quantity}
                                                    value={product.quantity}
                                                    onChange={(e) =>
                                                        updateProduct(
                                                            product.id,
                                                            'quantity',
                                                            Math.min(parseInt(e.target.value) || 1, product.max_quantity),
                                                        )
                                                    }
                                                    placeholder="1"
                                                    className="h-10"
                                                    disabled={!product.product_name}
                                                />
                                                {product.max_quantity > 0 && (
                                                    <div className="mt-1 text-xs text-green-600">Макс: {product.max_quantity}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Notes section for returned documents */}
            {isEditMode && (
                <Card className="max-w-6xl">
                    <CardHeader>
                        <CardTitle>Дополнительная информация</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="note">Причина списания</Label>
                                <textarea
                                    id="note"
                                    value={data.note || ''}
                                    onChange={(e) => setData('note', e.target.value)}
                                    className="min-h-[100px] w-full resize-none rounded-md border border-input p-3"
                                    placeholder="Введите причину списания..."
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Return notification banner */}
            {isReturned && documentNotes.length > 0 && (
                <Card className="max-w-6xl border-red-500 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="rounded-md bg-red-600 p-4 text-white">
                            <h4 className="mb-2 font-semibold">Документ возвращен</h4>
                            {documentNotes.map((note, index) => (
                                <div key={index} className="mb-4 last:mb-0">
                                    {index > 0 && <hr className="my-2 border-red-300" />}
                                    <div className="mb-1">
                                        <strong>Позиция:</strong> {userRoles[note.from_info?.type as keyof typeof userRoles] || note.from_info?.type}
                                    </div>
                                    <div className="mb-1">
                                        <strong>Имя:</strong> {note.from_info?.name}
                                    </div>
                                    <div>
                                        <strong>Причина возврата документа:</strong> {note.note}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex max-w-6xl gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.visit('/documents')}>
                    Отменить
                </Button>

                {/* Save button - show if can edit */}
                {canEdit && (
                    <Button type="submit" disabled={processing || data.products.length === 0 || !data.document_type_id}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить
                    </Button>
                )}

                {/* Send to next button - show if draft and can send */}
                {isEditMode && canSendToNext && (
                    <Button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSendToNext();
                        }}
                        disabled={sendingToNext || processing}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {sendingToNext && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="mr-2 h-4 w-4" />
                        Отправить следующему
                    </Button>
                )}
            </div>

            {/* SMS Confirmation Modal */}
            {isEditMode && data.id && (
                <SmsConfirmationModal
                    isOpen={showSmsModal}
                    onClose={() => setShowSmsModal(false)}
                    documentId={data.id}
                    onSuccess={handleSmsSuccess}
                />
            )}
        </form>
    );
}

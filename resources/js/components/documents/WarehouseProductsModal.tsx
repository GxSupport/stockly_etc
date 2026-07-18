import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface Product {
    name: string;
    warehouse: string;
    measure: string;
    price: number;
    count: string;
    nomenclature: string;
}

interface WarehouseProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    warehouseTitle: string;
    products: Product[];
    loading: boolean;
}

export default function WarehouseProductsModal({ isOpen, onClose, warehouseTitle, products, loading }: WarehouseProductsModalProps) {
    const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Товары на складе</DialogTitle>
                    <DialogDescription>{warehouseTitle}</DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span className="text-sm text-muted-foreground">Загрузка товаров из 1С...</span>
                    </div>
                )}

                {!loading && products.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">На складе нет товаров</div>}

                {!loading && products.length > 0 && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Номенклатура</TableHead>
                                    <TableHead>Ед.Изм</TableHead>
                                    <TableHead className="text-right">Цена</TableHead>
                                    <TableHead className="text-right">Количество</TableHead>
                                    <TableHead>Код</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.measure}</TableCell>
                                        <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                                        <TableCell className="text-right">{product.count}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{product.nomenclature}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CompositionItem {
    account_dt: string;
    account_kt: string;
    subconto_dt1: string;
    subconto_kt1: string;
    subconto_kt3: string;
    sum_turnover: number;
    quantity_turnover_kt: number | string;
}

interface OsCompositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    osCode: string;
    osName?: string;
}

export default function OsCompositionModal({ isOpen, onClose, osCode, osName }: OsCompositionModalProps) {
    const [composition, setComposition] = useState<CompositionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !osCode) return;

        let cancelled = false;
        setLoading(true);
        setError(null);
        setComposition([]);

        axios
            .post('/documents/get-composition', { os_code: osCode })
            .then((response) => {
                if (cancelled) return;
                if (response.data.success) {
                    setComposition(response.data.composition);
                } else {
                    setError(response.data.message || 'Ошибка при получении состава');
                }
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.response?.data?.message || 'Ошибка при получении состава основного средства');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, osCode]);

    const formatAmount = (amount: number) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Товары в составе ОС</DialogTitle>
                    <DialogDescription>{osName || osCode}</DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span className="text-sm text-muted-foreground">Загрузка состава из 1С...</span>
                    </div>
                )}

                {error && !loading && <div className="py-4 text-sm font-medium text-destructive">{error}</div>}

                {!loading && !error && composition.length === 0 && (
                    <div className="py-10 text-center text-sm text-muted-foreground">Товары в составе не найдены</div>
                )}

                {!loading && !error && composition.length > 0 && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Товар</TableHead>
                                    <TableHead className="text-right">Количество</TableHead>
                                    <TableHead className="text-right">Сумма</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {composition.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.subconto_kt1}</TableCell>
                                        <TableCell className="text-right">{item.quantity_turnover_kt}</TableCell>
                                        <TableCell className="text-right">{formatAmount(item.sum_turnover)}</TableCell>
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

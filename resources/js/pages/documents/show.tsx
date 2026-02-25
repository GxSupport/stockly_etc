import SmsConfirmationModal from '@/components/SmsConfirmationModal';
import SmsRejectionModal from '@/components/SmsRejectionModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronDownIcon, ChevronUpIcon, Printer } from 'lucide-react';
import { useRef, useState } from 'react';

// Interfaces
interface DocumentType {
    id: number;
    code: string;
    title: string;
}

interface UserInfo {
    id: number;
    name: string;
    type: string;
}

interface Priority {
    id: number;
    user_role: string;
    user_info: UserInfo;
    ordering: number;
    is_success: number;
    created_at: string;
    updated_at: string;
}

interface DocumentProduct {
    id: number;
    title: string;
    measure: string;
    quantity: number;
    amount: number;
    nomenclature: string;
    note: string;
}

interface HistoryItem {
    id: number;
    user_info: UserInfo;
    is_success: number;
    created_at: string;
    return_info?: Array<{ id: number; note: string }>;
}

interface Document {
    id: number;
    number: string;
    type: number;
    main_tool: string;
    date_order: string;
    total_amount: number;
    is_draft: boolean;
    is_returned: boolean;
    is_finished: boolean;
    status: number;
    products: DocumentProduct[];
    priority?: Priority[];
    document_type: DocumentType;
    user_info: UserInfo;
    notes?: any[];
    created_at: string;
    updated_at: string;
}

interface StaffList {
    director?: {
        name: string;
    };
}

interface ShowDocumentProps {
    document: Document;
    history?: HistoryItem[];
    staff?: StaffList;
    user: UserInfo;
}

const workerTypeLabels: Record<string, string> = {
    admin: 'Администратор',
    frp: 'МОЛ',
    header_frp: 'Старший МОЛ',
    dep_head: 'Начальник отдела',
    deputy_director: 'Заместитель директора',
    director: 'Директор',
    buxgalter: 'Бухгалтер',
    assigned: 'Назначенный сотрудник',
};

export default function ShowDocument({ document, history = [], staff, user }: ShowDocumentProps) {
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const [showSmsModal, setShowSmsModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'АКТ', href: '/documents' },
        { title: `АКТ №${document.number}`, href: '#' },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getWorkerType = (type: string) => {
        return workerTypeLabels[type] || type;
    };

    const checkOrder = () => {
        const priority = document.priority?.find((el) => el?.ordering === document.status);
        if (!priority) return false;

        // deputy_director uchun - user_id tekshirish va is_success = 0 bo'lishi kerak
        if (priority.user_role === 'deputy_director') {
            const userPriority = document.priority?.find(
                (el) => el?.ordering === document.status && el?.user_role === 'deputy_director' && el?.user_info?.id === user?.id,
            );
            return userPriority && userPriority.is_success === 0;
        }

        // assigned (tayinlangan xodim) uchun - user_id tekshirish
        if (priority.user_role === 'assigned') {
            const userPriority = document.priority?.find(
                (el) => el?.ordering === document.status && el?.user_role === 'assigned' && el?.user_info?.id === user?.id,
            );
            return userPriority && userPriority.is_success === 0;
        }

        // Boshqa rollar (director, buxgalter, header_frp, frp) uchun
        // user_role mos kelishi VA is_success = 0 bo'lishi kerak
        return priority.user_role === user?.type && priority.is_success === 0;
    };

    const handleConfirm = (type: 'confirm' | 'cancel') => {
        if (type === 'cancel') {
            setShowRejectModal(true);
        } else {
            setShowSmsModal(true);
        }
    };

    const handleSmsSuccess = () => {
        window.location.reload();
    };

    const getDocumentTypeTitle = () => {
        return `Акт ${document.document_type.title} №${document.number} от ${new Date(document.date_order).toLocaleDateString('ru-RU')}`;
    };

    const getResponsiblePerson = () => {
        return document.priority?.find((el) => el.user_role === 'frp')?.user_info?.name || '';
    };

    const getDocumentDescription = () => {
        const responsiblePerson = getResponsiblePerson();
        const typeCode = document.document_type?.code;

        switch (typeCode) {
            case 'mounted':
                return (
                    <>
                        Мы нижеподписавшиеся составили настоящий акт о том, что нижеуказанные материалы были получены и
                        смонтированы на указанных объектах. Материалы переданы под ответственность Материально ответственного лица{' '}
                        <span className="font-semibold">{responsiblePerson}</span>
                    </>
                );
            case 'dismantling':
                return (
                    <>
                        Мы нижеподписавшиеся составили настоящий акт о том, что нижеуказанные материалы были демонтированы
                        с объектов и возвращены на склад. Материалы сняты с ответственности Материально ответственного лица{' '}
                        <span className="font-semibold">{responsiblePerson}</span>
                    </>
                );
            case 'write_offs':
                return (
                    <>
                        Мы нижеподписавшиеся составили настоящий акт о том, что нижеуказанные материалы действительно пришли
                        в непригодное состояние и их дальнейшее использование нецелесообразно. Подлежат к списанию с Материально
                        ответственного лица <span className="font-semibold">{responsiblePerson}</span>
                    </>
                );
            case 'modernization':
                return (
                    <>
                        Мы нижеподписавшиеся составили настоящий акт о том, что нижеуказанные материалы были заменены в рамках
                        модернизации оборудования. Старые материалы подлежат возврату на склад, новые материалы переданы под
                        ответственность Материально ответственного лица <span className="font-semibold">{responsiblePerson}</span>
                    </>
                );
            default:
                return (
                    <>
                        Мы нижеподписавшиеся составили настоящий акт о том, что нижеуказанные материалы были обработаны.
                        Материально ответственное лицо <span className="font-semibold">{responsiblePerson}</span>
                    </>
                );
        }
    };

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`АКТ №${document.number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Print Button */}
                <div className="print:hidden mx-auto flex w-full max-w-4xl justify-end">
                    {document.is_finished && (
                        <Button onClick={handlePrint} variant="default" className="gap-2">
                            <Printer className="h-4 w-4" />
                            Сохранить
                        </Button>
                    )}
                </div>

                {/* Document View Container */}
                <Card className="print-area card-print mx-auto w-full max-w-4xl" ref={printRef}>
                    <CardContent className="p-8" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                        {/* Header with Approval Section */}
                        <div className="mb-8 flex justify-end">
                            <div className="text-center">
                                <div className="font-bold">Утверждаю</div>
                                <div>Заместитель Генерального директора</div>
                                <div>ООО «Ist Telekom»</div>
                                <div className="mt-2">{staff?.director?.name || ''}</div>
                            </div>
                        </div>

                        {/* Document Title and Description */}
                        <div className="mb-8 text-center">
                            <div className="mb-4 text-lg font-semibold">{getDocumentTypeTitle()}</div>
                            <div className="text-justify">{getDocumentDescription()}</div>
                        </div>

                        {/* Products Table */}
                        <div className="mb-8">
                            <table className="w-full border-collapse border dark:border-white">
                                <thead>
                                    <tr>
                                        <th className="border p-2 text-center dark:border-white">№</th>
                                        <th className="border p-2 text-center dark:border-white">Наименование</th>
                                        <th className="border p-2 text-center dark:border-white">Ед.изм.</th>
                                        <th className="border p-2 text-center dark:border-white">Кол-во</th>
                                        <th className="border p-2 text-center dark:border-white">
                                            {document.type === 1 ? 'Место установки' : 'Причина списания'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {document.products.map((product, index) => (
                                        <tr key={`product-${index}`}>
                                            <td className="border p-2 text-center dark:border-white">{index + 1}</td>
                                            <td className="border p-2 text-center dark:border-white">{product.title}</td>
                                            <td className="border p-2 text-center dark:border-white">{product.measure}.</td>
                                            <td className="border p-2 text-center dark:border-white">{product.quantity}</td>
                                            <td className="border p-2 text-center dark:border-white">
                                                {document.type === 3 || document.type === 1 ? product.note : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* History Section */}
                        <div className="print:hidden mb-8">
                            <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded}>
                                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg p-4">
                                    <span className="font-medium">История документа</span>
                                    {historyExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Card className="mt-2">
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                {history.map((item, index) => (
                                                    <div
                                                        key={`history-${item.id}-${index}`}
                                                        className="flex items-start gap-4 border-b pb-4 last:border-b-0"
                                                    >
                                                        <div
                                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-sm dark:text-white ${
                                                                index === 0 ? 'bg-blue-500' : item.is_success === 1 ? 'bg-green-500' : 'bg-red-500'
                                                            }`}
                                                        >
                                                            {index === 0 ? '+' : item.is_success === 1 ? '✓' : '✗'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="mb-1 text-sm text-gray-500">
                                                                {index === 0 ? formatDate(document.created_at) : item.created_at}
                                                            </div>
                                                            <div className="mb-1 font-medium">
                                                                Имя: {item.user_info.name} ({getWorkerType(item.user_info.type)})
                                                            </div>
                                                            <div className="text-sm">
                                                                Положение дел:{' '}
                                                                {index === 0 ? 'СОЗДАННЫЙ' : item.is_success === 1 ? 'ПОДТВЕРЖДЕН' : 'Отменено'}
                                                            </div>
                                                            {item.is_success === 0 && item.return_info && (
                                                                <div className="mt-2 text-sm text-red-600">
                                                                    {item.return_info.map((info) => (
                                                                        <p key={info.id}>- {info.note}</p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>

                        {/* Signature Blocks */}
                        <div className="mb-8 flex justify-between">
                            {/* ОТПРАВЛЕНО Block */}
                            {document.priority && document.priority.length > 0 && (
                                <div>
                                    {document.priority.map(
                                        (priority, index) =>
                                            index === 0 &&
                                            priority.is_success === 1 && (
                                                <div
                                                    key={`sent-${index}`}
                                                    className="rounded-lg border-4 border-gray-400 p-4"
                                                    style={{ width: '300px' }}
                                                >
                                                    <div>{formatDate(priority.updated_at)}</div>
                                                    <div className="my-2 text-center font-bold">ОТПРАВЛЕНО</div>
                                                    <div>{priority.user_info?.name}</div>
                                                </div>
                                            ),
                                    )}
                                </div>
                            )}

                            {/* ПОДТВЕРЖДЕН Block */}
                            {document.priority && document.priority.length > 0 && (
                                <div>
                                    {document.priority.map(
                                        (priority, index) =>
                                            index > 0 &&
                                            priority.is_success === 1 && (
                                                <div
                                                    key={`confirmed-${index}`}
                                                    className="rounded-lg border-4 border-teal-500 p-4"
                                                    style={{ width: '300px' }}
                                                >
                                                    <div>{formatDate(priority.updated_at)}</div>
                                                    <div className="my-2 text-center font-bold">ПОДТВЕРЖДЕН</div>
                                                    <div>{priority.user_info.name}</div>
                                                </div>
                                            ),
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                {!document.is_finished && checkOrder() && (
                    <div className="print:hidden mx-auto flex max-w-4xl gap-4">
                        <Button onClick={() => handleConfirm('confirm')} className="min-w-[200px]" size="lg">
                            Подтвердить
                        </Button>
                        <Button onClick={() => handleConfirm('cancel')} variant="destructive" className="min-w-[200px]" size="lg">
                            Отказать
                        </Button>
                    </div>
                )}
            </div>

            {/* SMS Confirmation Modal */}
            <SmsConfirmationModal
                isOpen={showSmsModal}
                onClose={() => setShowSmsModal(false)}
                documentId={document.id}
                onSuccess={handleSmsSuccess}
            />

            {/* SMS Rejection Modal */}
            <SmsRejectionModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                documentId={document.id}
                onSuccess={handleSmsSuccess}
            />
        </AppLayout>
    );
}

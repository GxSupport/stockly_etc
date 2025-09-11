import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import SmsConfirmationModal from '@/components/SmsConfirmationModal';
import SmsRejectionModal from '@/components/SmsRejectionModal';

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
    'admin': 'Администратор',
    'frp': 'МОЛ',
    'dep_head': 'Начальник отдела',
    'director': 'Директор',
    'buxgalter': 'Бухгалтер'
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
            second: '2-digit'
        });
    };

    const getWorkerType = (type: string) => {
        return workerTypeLabels[type] || type;
    };

    const checkOrder = () => {
        const priority = document.priority?.find((el) => el?.ordering === document.status);
        return priority && priority.user_role === user?.type;
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
        console.log(document.priority)
        console.log(document.priority?.find((el) => el.user_role === 'frp')?.user_info);
        return document.priority?.find((el) => el.user_role === 'frp')?.user_info?.name || '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`АКТ №${document.number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Document View Container */}
                <Card className="w-full max-w-4xl mx-auto">
                    <CardContent className="p-8" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                        {/* Header with Approval Section */}
                        <div className="flex justify-end mb-8">
                            <div className="text-center">
                                <div className="font-bold">Утверждаю</div>
                                <div>Заместитель Генерального директора</div>
                                <div>ООО «Ist Telekom»</div>
                                <div className="mt-2">{staff?.director?.name || ''}</div>
                            </div>
                        </div>

                        {/* Document Title and Description */}
                        <div className="text-center mb-8">
                            <div className="text-lg font-semibold mb-4">
                                {getDocumentTypeTitle()}
                            </div>
                            <div className="text-justify">
                                Мы нижеподписавщиеся соcтавили настоящий акт о том, что нижеуказанные
                                материалы действительно пришли в непригодное состояние и их дальнейшее
                                использование не целесообразно. Подлежат к списанию с Материального
                                ответственного лица <span className="font-semibold">{getResponsiblePerson()}</span>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="mb-8">
                            <table className="w-full border-collapse border dark:border-white">
                                <thead>
                                    <tr>
                                        <th className="border dark:border-white p-2 text-center">№</th>
                                        <th className="border dark:border-white p-2 text-center">Наименование</th>
                                        <th className="border dark:border-white p-2 text-center">Ед.изм.</th>
                                        <th className="border dark:border-white p-2 text-center">Кол-во</th>
                                        <th className="border dark:border-white p-2 text-center">
                                            {document.type === 1 ? 'Место установки' : 'Причина списания'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {document.products.map((product, index) => (
                                        <tr key={`product-${index}`}>
                                            <td className="border dark:border-white p-2 text-center">{index + 1}</td>
                                            <td className="border dark:border-white p-2 text-center">{product.title}</td>
                                            <td className="border dark:border-white p-2 text-center">{product.measure}.</td>
                                            <td className="border dark:border-white p-2 text-center">{product.quantity}</td>
                                            <td className="border dark:border-white p-2 text-center">
                                                {(document.type === 3 || document.type === 1) ? product.note : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* History Section */}
                        <div className="mb-8">
                            <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded}>
                                <CollapsibleTrigger className="flex items-center gap-2 p-4  w-full rounded-lg ">
                                    <span className="font-medium">История документа</span>
                                    {historyExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Card className="mt-2">
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                {history.map((item, index) => (
                                                    <div key={`history-${item.id}-${index}`} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center dark:text-white text-sm ${
                                                            index === 0 ? 'bg-blue-500' :
                                                            item.is_success === 1 ? 'bg-green-500' : 'bg-red-500'
                                                        }`}>
                                                            {index === 0 ? '+' : item.is_success === 1 ? '✓' : '✗'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm text-gray-500 mb-1">
                                                                {index===0 ? formatDate(document.created_at) : item.created_at}

                                                            </div>
                                                            <div className="font-medium mb-1">
                                                                Имя: {item.user_info.name} ({getWorkerType(item.user_info.type)})
                                                            </div>
                                                            <div className="text-sm">
                                                                Положение дел: {
                                                                    index === 0 ? 'СОЗДАННЫЙ' :
                                                                    item.is_success === 1 ? 'ПОДТВЕРЖДЕН' : 'Отменено'
                                                                }
                                                            </div>
                                                            {item.is_success === 0 && item.return_info && (
                                                                <div className="mt-2 text-red-600 text-sm">
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
                        <div className="flex justify-between mb-8">
                            {/* ОТПРАВЛЕНО Block */}
                            {document.priority && document.priority.length > 0 && (
                                <div>
                                    {document.priority.map((priority, index) => (
                                        index === 0 && priority.is_success === 1 && (
                                            <div key={`sent-${index}`} className="p-4 border-4 border-gray-400  rounded-lg" style={{ width: '300px' }}>
                                                <div>{formatDate(priority.updated_at)}</div>
                                                <div className="text-center font-bold my-2">ОТПРАВЛЕНО</div>
                                                <div>{priority.user_info?.name}</div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {/* ПОДТВЕРЖДЕН Block */}
                            {document.priority && document.priority.length > 0 && (
                                <div>
                                    {document.priority.map((priority, index) => (
                                        index > 0 && priority.is_success === 1 && (
                                            <div key={`confirmed-${index}`} className="p-4 border-4 border-teal-500  rounded-lg" style={{ width: '300px' }}>
                                                <div>{formatDate(priority.updated_at)}</div>
                                                <div className="text-center font-bold my-2">ПОДТВЕРЖДЕН</div>
                                                <div>{priority.user_info.name}</div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                {!document.is_finished && checkOrder() && (
                    <div className="flex gap-4 max-w-4xl mx-auto">
                        <Button
                            onClick={() => handleConfirm('confirm')}
                            className="min-w-[200px]"
                            size="lg"
                        >
                            Подтвердить
                        </Button>
                        <Button
                            onClick={() => handleConfirm('cancel')}
                            variant="destructive"
                            className="min-w-[200px]"
                            size="lg"
                        >
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

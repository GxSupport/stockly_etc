import DocumentForm, { type DocumentData } from '@/components/documents/DocumentForm';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

// Interfaces
interface DocumentType {
    id: number;
    code: string;
    title: string;
    workflow_type: number;
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

interface CreateDocumentProps {
    documentTypes: DocumentType[];
    products: Product[];
    services: Service[];
    nextNumber: string;
    users: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'АКТ', href: '/documents' },
    { title: 'Добавить АКТ', href: '/documents/create' },
];

export default function CreateDocument({ documentTypes, products, services, nextNumber, users }: CreateDocumentProps) {
    const { data, setData, post, processing, errors } = useForm<DocumentData>({
        document_type_id: '',
        assigned_user_id: undefined,
        number: nextNumber,
        products: [],
        main_tool: '',
        date_order: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalAmount = data.products.reduce((sum, product) => sum + product.amount, 0);
        const submissionData = {
            ...data,
            total_amount: totalAmount,
            products: data.document_type_id === '2' ? data.products.map((p) => ({ ...p, measure: '' })) : data.products,
        };
        post('/documents/create', { data: submissionData } as any);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Добавить АКТ" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Добавить АКТ</h1>
                </div>
                <DocumentForm
                    data={data}
                    setData={setData}
                    onSubmit={handleSubmit}
                    errors={errors}
                    processing={processing}
                    documentTypes={documentTypes}
                    allProducts={products}
                    services={services}
                    users={users}
                />
            </div>
        </AppLayout>
    );
}

import DocumentForm, { type DocumentData, type ProductItem } from '@/components/documents/DocumentForm';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

// Interfaces
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
interface Service {
    name: string;
    basic_resource_code: string;
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
interface Document {
    id: number;
    number: string;
    type: number;
    main_tool: string;
    date_order: string;
    total_amount: number;
    is_draft: boolean;
    is_returned: boolean;
    status: number;
    products: DocumentProduct[];
    notes?: never[];
}

interface EditDocumentProps {
    document: Document;
    documentTypes: DocumentType[];
    products: Product[];
    services: Service[];
}

export default function EditDocument({ document, documentTypes, products, services }: EditDocumentProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'АКТ', href: '/documents' },
        { title: `Редактировать АКТ №${document.number}`, href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm<DocumentData>({
        id: document.id,
        document_type_id: document.type.toString(),
        number: document.number,
        main_tool: document.main_tool,
        date_order: document.date_order,
        is_draft: document.is_draft,
        is_returned: document.is_returned,
        status: document.status,
        note: '',
        products: document.products.map(
            (p): ProductItem => ({
                id: p.id,
                product_name: p.title,
                measure: p.measure,
                quantity: p.quantity,
                amount: p.amount,
                nomenclature: p.nomenclature,
                note: p.note,
                selected_product: products.find((ap) => ap.nomenclature === p.nomenclature) || null,
                max_quantity: products.find((ap) => ap.nomenclature === p.nomenclature)
                    ? parseInt(products.find((ap) => ap.nomenclature === p.nomenclature)!.count)
                    : 999,
            }),
        ),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalAmount = data.products.reduce((sum, product) => sum + product.amount, 0);
        const submissionData = {
            ...data,
            total_amount: totalAmount,
            products: data.document_type_id === '2' ? data.products.map((p) => ({ ...p, measure: '' })) : data.products,
        };
        put(`/documents/${document.id}`, { data: submissionData } as never);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактировать АКТ №${document.number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Редактировать АКТ №{document.number}</h1>
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
                    isEditMode={true}
                    documentNotes={document.notes || []}
                />
            </div>
        </AppLayout>
    );
}

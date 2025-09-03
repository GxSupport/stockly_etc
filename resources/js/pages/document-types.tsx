import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem } from '@/types';
import { Plus, FileText } from 'lucide-react';

interface DocumentType {
    id: number;
    code: string;
    title: string;
}

interface PaginatedData {
    document_types: DocumentType[];
    total: number;
    page: number;
    perPage: number;
    search: string | null;
}

type DocumentTypesPageProps = PaginatedData;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Типы документов',
        href: '/document-types',
    },
];

export default function DocumentTypes({ document_types, total, page = 1, perPage = 10, search }: DocumentTypesPageProps) {
    
    const [localDocumentTypes, setLocalDocumentTypes] = useState<DocumentType[]>(document_types);
    const [searchQuery, setSearchQuery] = useState(search || '');
    
    // Update local document types when props change
    useEffect(() => {
        setLocalDocumentTypes(document_types);
    }, [document_types]);

    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/document-types', { search: value, page: 1 }, { preserveState: false });
    };

    const handlePageChange = (newPage: number) => {
        router.get('/document-types', { search: searchQuery || undefined, page: newPage }, { preserveState: false });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Типы документов" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Типы документов</h1>
                    <Button onClick={() => router.visit('/document-types/create')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить тип документа
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Поиск по коду или названию типа документа..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Код
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Название
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {localDocumentTypes.length > 0 ? (
                                    localDocumentTypes.map((documentType) => (
                                        <tr key={documentType.id} className="border-b">
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-medium font-mono text-sm">
                                                    {documentType.code}
                                                </div>
                                            </td>
                                            <td className="h-12 px-4 align-middle">
                                                <div className="font-medium">{documentType.title}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="h-24 text-center">
                                            <div className="text-muted-foreground">
                                                Типы документов не найдены
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Показано {startIndex + 1}-{Math.min(startIndex + perPage, total)} из {total} записей
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.max(page - 1, 1))}
                                disabled={page === 1}
                            >
                                Предыдущая
                            </Button>

                            <div className="flex gap-1">
                                {(() => {
                                    const maxVisiblePages = 5;
                                    const halfVisible = Math.floor(maxVisiblePages / 2);
                                    
                                    let startPage = Math.max(1, page - halfVisible);
                                    let endPage = Math.min(totalPages, page + halfVisible);
                                    
                                    // Adjust if we're near the beginning or end
                                    if (endPage - startPage + 1 < maxVisiblePages) {
                                        if (startPage === 1) {
                                            endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                        } else {
                                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                        }
                                    }
                                    
                                    const pages = [];
                                    
                                    // First page + ellipsis if needed
                                    if (startPage > 1) {
                                        pages.push(
                                            <Button
                                                key={1}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(1)}
                                                className="w-8"
                                            >
                                                1
                                            </Button>
                                        );
                                        
                                        if (startPage > 2) {
                                            pages.push(
                                                <span key="start-ellipsis" className="px-2 text-muted-foreground">
                                                    ...
                                                </span>
                                            );
                                        }
                                    }
                                    
                                    // Visible pages
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <Button
                                                key={i}
                                                variant={page === i ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(i)}
                                                className="w-8"
                                            >
                                                {i}
                                            </Button>
                                        );
                                    }
                                    
                                    // Last page + ellipsis if needed
                                    if (endPage < totalPages) {
                                        if (endPage < totalPages - 1) {
                                            pages.push(
                                                <span key="end-ellipsis" className="px-2 text-muted-foreground">
                                                    ...
                                                </span>
                                            );
                                        }
                                        
                                        pages.push(
                                            <Button
                                                key={totalPages}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(totalPages)}
                                                className="w-8"
                                            >
                                                {totalPages}
                                            </Button>
                                        );
                                    }
                                    
                                    return pages;
                                })()}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                                disabled={page === totalPages}
                            >
                                Следующая
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
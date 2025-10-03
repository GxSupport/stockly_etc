import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { FlashHandler } from '@/components/flash-handler';
import { ToastContainer } from '@/components/ui/toast';
import { ToastProvider, useToast } from '@/hooks/use-toast';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

function AppSidebarLayoutContent({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { toasts, removeToast } = useToast();

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <FlashHandler />
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </AppShell>
    );
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <ToastProvider>
            <AppSidebarLayoutContent breadcrumbs={breadcrumbs}>{children}</AppSidebarLayoutContent>
        </ToastProvider>
    );
}

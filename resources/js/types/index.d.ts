import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    type: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Dashboard types

export interface DashboardDocument {
    id: number;
    number: string;
    type_title: string;
    total_amount: number;
    is_finished: number;
    is_draft: number;
    is_returned: number;
    user_name: string;
    created_at: string;
    updated_at: string;
}

export interface AdminStats {
    users: {
        total: number;
        active: number;
        inactive: number;
    };
    users_by_role: Array<{
        type: string;
        name: string;
        count: number;
    }>;
    documents: {
        total: number;
        draft: number;
        sent: number;
        returned: number;
        finished: number;
    };
    recent_users: Array<{
        id: number;
        name: string;
        phone: string;
        type: string;
        created_at: string;
        role?: { id: number; title: string; name: string } | null;
    }>;
    system: {
        warehouses: number;
        departments: number;
        document_types: number;
    };
}

export interface DirectorStats {
    awaiting_approval: {
        count: number;
        documents: DashboardDocument[];
    };
    documents_total: {
        total: number;
        finished: number;
        in_progress: number;
    };
    documents_by_type: Array<{
        type: number;
        title: string;
        count: number;
    }>;
    recently_finished: DashboardDocument[];
    returned_count: number;
}

export interface DeputyDirectorStats {
    awaiting_approval: {
        count: number;
        documents: DashboardDocument[];
    };
    total_approved: number;
    recently_processed: DashboardDocument[];
    returned_count: number;
}

export interface BuxgalterStats {
    awaiting_approval: {
        count: number;
        documents: DashboardDocument[];
    };
    total_processed: number;
    documents_by_type: Array<{
        type: number;
        title: string;
        count: number;
    }>;
    financial_summary: {
        finished_amount: number;
        in_progress_amount: number;
    };
    recently_finished: DashboardDocument[];
}

export interface HeaderFrpStats {
    team_documents: {
        total: number;
        draft: number;
        sent: number;
        returned: number;
        finished: number;
    };
    awaiting_approval: {
        count: number;
        documents: DashboardDocument[];
    };
    own_documents: {
        total: number;
        draft: number;
        finished: number;
    };
    team_members: Array<{
        id: number;
        name: string;
        phone: string;
        type: string;
        documents_count: number;
    }>;
}

export interface FrpStats {
    own_documents: {
        total: number;
        draft: number;
        sent: number;
        returned: number;
        finished: number;
    };
    warehouse: {
        user_id: number;
        warehouse_id: number;
        warehouse?: {
            id: number;
            code: string;
            title: string;
        } | null;
    } | null;
    recent_documents: DashboardDocument[];
    pending_returns: DashboardDocument[];
}

export type DashboardStats = AdminStats | DirectorStats | DeputyDirectorStats | BuxgalterStats | HeaderFrpStats | FrpStats;

export interface DashboardPageProps {
    stats: DashboardStats;
    userRole: string;
}

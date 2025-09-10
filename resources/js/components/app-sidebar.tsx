import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Building2, Warehouse, Archive, FileText, ClipboardList, HelpCircle } from 'lucide-react';
import AppLogo from './app-logo';

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Сотрудники',
        href: '/employees',
        icon: Users,
    },
    {
        title: 'Отделы',
        href: '/departments',
        icon: Building2,
    },
    {
        title: 'Склады',
        href: '/warehouses',
        icon: Warehouse,
    },
    {
        title: 'Типы складов',
        href: '/warehouse-types',
        icon: Archive,
    },
    {
        title: 'Типы документов',
        href: '/document-types',
        icon: FileText,
    },
    {
        title: 'АКТ',
        href: '/documents',
        icon: ClipboardList,
    },
];

const managementRoutes = ['/employees', '/departments', '/warehouses', '/warehouse-types', '/document-types'];

function hasManagementAccess(userType: string): boolean {
    return ['admin', 'director', 'buxgalter'].includes(userType);
}

const footerNavItems: NavItem[] = [
    {
        title: 'Руководства',
        href: '/user-guides',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    
    const filteredNavItems = allNavItems.filter(item => {
        if (managementRoutes.includes(item.href as string)) {
            return hasManagementAccess(auth.user.type);
        }
        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

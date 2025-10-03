import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Lock, Palette, Settings, User } from 'lucide-react';
import { type ReactNode } from 'react';

interface SettingsLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
}

const settingsNavItems = [
    {
        title: 'Профиль',
        description: 'Управление профилем пользователя',
        href: '/settings/profile',
        icon: User,
        segment: 'profile',
    },
    {
        title: 'Пароль',
        description: 'Изменение пароля',
        href: '/settings/password',
        icon: Lock,
        segment: 'password',
    },
    {
        title: 'Оформление',
        description: 'Настройка темы интерфейса',
        href: '/settings/appearance',
        icon: Palette,
        segment: 'appearance',
    },
];

export default function SettingsLayout({
    children,
    title,
    description,
    breadcrumbs = [{ title: 'Дашборд', href: '/dashboard' }, { title: 'Настройки' }],
}: SettingsLayoutProps) {
    const { url } = usePage();
    const currentPath = url;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="container mx-auto space-y-8 p-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <Settings className="h-4 w-4" />
                        <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
                    </div>
                    <p className="text-muted-foreground">Управление настройками аккаунта и предпочтений</p>
                </div>

                <Separator />

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Settings Navigation */}
                    <aside className="lg:w-1/4">
                        <div className="space-y-2">
                            <h2 className="mb-4 text-lg font-semibold">Разделы</h2>
                            <nav className="space-y-1">
                                {settingsNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = currentPath.includes(item.segment);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center space-x-3 rounded-lg px-4 py-3 text-sm transition-colors duration-200',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            <Icon className="h-4 w-4 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium">{item.title}</div>
                                                <div
                                                    className={cn(
                                                        'truncate text-xs',
                                                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {item.description}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>{title}</CardTitle>
                                {description && <CardDescription>{description}</CardDescription>}
                            </CardHeader>
                            <CardContent>{children}</CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Warehouse,
    Package,
    Truck,
    ArrowRight,
    BarChart3,
    Shield,
    Users,
    Clock,
    CheckCircle,
    ArrowUpDown,
    FileText,
    TrendingUp,
    Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Добро пожаловать">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header Navigation */}
                <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 dark:border-gray-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Warehouse className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                <span className="text-xl font-semibold text-gray-900 dark:text-white">Stockly</span>
                            </div>

                            <nav className="flex items-center gap-4">
                                {auth.user ? (
                                    <div className="flex items-center gap-3">
                                        <AppearanceToggleDropdown />
                                        <Button asChild>
                                            <Link href={dashboard()}>
                                                Дашборд
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <AppearanceToggleDropdown />
                                        <Button variant="ghost" asChild>
                                            <Link href={login()}>
                                                Войти
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="relative">
                    {/* Hero Section */}
                    <section className="relative py-20 sm:py-32">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <div className="mb-8 flex justify-center">
                                    <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                                        Система управления товарно-материальными ценностями
                                    </Badge>
                                </div>

                                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                                    Добро пожаловать в{' '}
                                    <span className="text-blue-600 dark:text-blue-400">Stockly</span>
                                </h1>

                                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
                                    Профессиональная система учёта и контроля движения товарно-материальных ценностей для современного бизнеса
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                                    {!auth.user && (
                                        <>
                                            <Button size="lg" asChild className="px-8 py-4 text-lg">
                                                <Link href={login()}>
                                                    Войти в систему
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Link>
                                            </Button>

                                        </>
                                    )}
                                </div>

                                {/* Central Illustration */}
                                <div className="relative mx-auto max-w-4xl">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                        {/* Left side - Warehouse */}
                                        <div className="flex flex-col items-center space-y-4 opacity-0 animate-fade-in-up">
                                            <div className="relative">
                                                <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-2xl">
                                                    <Warehouse className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="absolute -top-2 -right-2">
                                                    <Badge className="bg-green-500 text-white">Активен</Badge>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-gray-900 dark:text-white">Склады</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Управление складами</p>
                                            </div>
                                        </div>

                                        {/* Center - Flow */}
                                        <div className="flex flex-col items-center space-y-6">
                                            <div className="flex items-center justify-center space-x-4">
                                                <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-xl animate-bounce">
                                                    <Package className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <ArrowUpDown className="h-6 w-6 text-gray-400 animate-pulse" />
                                                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl animate-bounce delay-200">
                                                    <Boxes className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            </div>
                                            <div className="bg-blue-600 dark:bg-blue-500 p-4 rounded-xl text-white animate-pulse">
                                                <Truck className="h-8 w-8" />
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Движение ТМЦ</p>
                                        </div>

                                        {/* Right side - Analytics */}
                                        <div className="flex flex-col items-center space-y-4 opacity-0 animate-fade-in-up delay-300">
                                            <div className="relative">
                                                <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-2xl">
                                                    <BarChart3 className="h-12 w-12 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div className="absolute -top-1 -right-1">
                                                    <div className="bg-red-500 h-3 w-3 rounded-full animate-ping"></div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-gray-900 dark:text-white">Аналитика</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Отчёты и статистика</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="py-20 bg-white dark:bg-gray-900">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Ключевые возможности
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                    Всё необходимое для эффективного управления товарно-материальными ценностями
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit">
                                            <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <CardTitle>Управление складами</CardTitle>
                                        <CardDescription>
                                            Полный контроль над складскими помещениями и зонами хранения
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit">
                                            <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <CardTitle>Учёт товаров</CardTitle>
                                        <CardDescription>
                                            Детальный учёт поступления, перемещения и списания товаров
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg w-fit">
                                            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <CardTitle>Управление персоналом</CardTitle>
                                        <CardDescription>
                                            Контроль доступа сотрудников и их ответственности
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg w-fit">
                                            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <CardTitle>Документооборот</CardTitle>
                                        <CardDescription>
                                            Автоматизация создания и обработки складских документов
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg w-fit">
                                            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <CardTitle>Безопасность</CardTitle>
                                        <CardDescription>
                                            Многоуровневая система защиты и аудит операций
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg w-fit">
                                            <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <CardTitle>Аналитика</CardTitle>
                                        <CardDescription>
                                            Подробные отчёты и аналитика движения ТМЦ
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Analytics Preview Section */}
                    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center text-white mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                    Аналитика в реальном времени
                                </h2>
                                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                                    Получайте актуальную информацию о состоянии ваших складов
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <Warehouse className="h-8 w-8" />
                                        <Badge className="bg-green-500">+12%</Badge>
                                    </div>
                                    <div className="text-2xl font-bold mb-1">15</div>
                                    <div className="text-blue-100 text-sm">Активных складов</div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <Package className="h-8 w-8" />
                                        <Badge className="bg-blue-500">+8%</Badge>
                                    </div>
                                    <div className="text-2xl font-bold mb-1">2,847</div>
                                    <div className="text-blue-100 text-sm">Позиций товаров</div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <Truck className="h-8 w-8" />
                                        <Badge className="bg-orange-500">24</Badge>
                                    </div>
                                    <div className="text-2xl font-bold mb-1">156</div>
                                    <div className="text-blue-100 text-sm">Операций сегодня</div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <Users className="h-8 w-8" />
                                        <Badge className="bg-green-500">
                                            <CheckCircle className="h-3 w-3" />
                                        </Badge>
                                    </div>
                                    <div className="text-2xl font-bold mb-1">48</div>
                                    <div className="text-blue-100 text-sm">Активных сотрудников</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-20 bg-gray-50 dark:bg-gray-800">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                    Готовы начать?
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
                                    Присоединяйтесь к тысячам компаний, которые уже оптимизировали свои складские процессы с помощью Stockly
                                </p>

                                {!auth.user ? (
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">

                                        <Button size="lg" variant="outline" asChild className="px-8 py-4 text-lg">
                                            <Link href={login()}>
                                                Войти в систему
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="lg" asChild className="px-8 py-4 text-lg">
                                        <Link href={dashboard()}>
                                            Перейти к дашборду
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                                <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold text-gray-900 dark:text-white">Stockly</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                © 2025 Stockly. Разработано в Roo Support Technology
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }

                .delay-300 {
                    animation-delay: 0.3s;
                }
            `}</style>
        </>
    );
}

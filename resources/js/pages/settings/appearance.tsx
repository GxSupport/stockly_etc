import SettingsLayout from '@/layouts/settings-layout';
import { Head } from '@inertiajs/react';
import { Palette, Sun, Moon, Monitor, CheckCircle } from 'lucide-react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { useAppearance } from '@/hooks/use-appearance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Appearance() {
    const { appearance } = useAppearance();

    const getCurrentThemeInfo = () => {
        switch (appearance) {
            case 'light':
                return {
                    title: 'Светлая тема',
                    description: 'Классический светлый интерфейс с белым фоном',
                    icon: Sun,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                };
            case 'dark':
                return {
                    title: 'Темная тема',
                    description: 'Современный темный интерфейс, удобный для глаз',
                    icon: Moon,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50 dark:bg-blue-950',
                };
            case 'system':
                return {
                    title: 'Системная тема',
                    description: 'Автоматическое переключение в зависимости от системных настроек',
                    icon: Monitor,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 dark:bg-gray-950',
                };
            default:
                return {
                    title: 'Системная тема',
                    description: 'Автоматическое переключение в зависимости от системных настроек',
                    icon: Monitor,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 dark:bg-gray-950',
                };
        }
    };

    const currentTheme = getCurrentThemeInfo();
    const CurrentIcon = currentTheme.icon;

    return (
        <SettingsLayout
            title="Оформление"
            description="Настройка внешнего вида интерфейса приложения"
        >
            <Head title="Настройки оформления" />

            <div className="space-y-8">
                {/* Current Theme Display */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Текущая тема</h3>
                    </div>

                    <Card className={`border-0 ${currentTheme.bgColor}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-full ${currentTheme.bgColor}`}>
                                    <CurrentIcon className={`h-6 w-6 ${currentTheme.color}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-semibold">{currentTheme.title}</h4>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {currentTheme.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Theme Selector */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">Выбрать тему</h3>

                    <div className="flex flex-col items-start space-y-4">
                        <AppearanceToggleTab />
                        <p className="text-sm text-muted-foreground">
                            Выберите тему интерфейса или используйте системные настройки для автоматического переключения
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Theme Preview Cards */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">Предварительный просмотр тем</h3>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Light Theme Preview */}
                        <Card className="relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center space-x-2">
                                    <Sun className="h-4 w-4 text-yellow-600" />
                                    <CardTitle className="text-sm">Светлая</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-32 bg-gradient-to-br from-white to-gray-50 border-t">
                                    <div className="p-4 space-y-2">
                                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                                        <div className="h-6 bg-blue-500 rounded w-20 mt-3"></div>
                                    </div>
                                </div>
                            </CardContent>
                            {appearance === 'light' && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                            )}
                        </Card>

                        {/* Dark Theme Preview */}
                        <Card className="relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center space-x-2">
                                    <Moon className="h-4 w-4 text-blue-600" />
                                    <CardTitle className="text-sm">Темная</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-32 bg-gradient-to-br from-gray-900 to-gray-800 border-t">
                                    <div className="p-4 space-y-2">
                                        <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                                        <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                                        <div className="h-6 bg-blue-500 rounded w-20 mt-3"></div>
                                    </div>
                                </div>
                            </CardContent>
                            {appearance === 'dark' && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                            )}
                        </Card>

                        {/* System Theme Preview */}
                        <Card className="relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center space-x-2">
                                    <Monitor className="h-4 w-4 text-gray-600" />
                                    <CardTitle className="text-sm">Системная</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-32 bg-gradient-to-r from-white via-gray-100 to-gray-900 border-t">
                                    <div className="p-4 space-y-2">
                                        <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-600 rounded w-3/4"></div>
                                        <div className="h-2 bg-gradient-to-r from-gray-100 to-gray-700 rounded w-1/2"></div>
                                        <div className="h-6 bg-blue-500 rounded w-20 mt-3"></div>
                                    </div>
                                </div>
                            </CardContent>
                            {appearance === 'system' && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="rounded-lg bg-muted/50 p-6">
                    <h4 className="font-medium mb-3 flex items-center">
                        <Palette className="h-4 w-4 mr-2" />
                        О темах оформления
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            <strong>Светлая тема:</strong> Классический светлый интерфейс с высоким контрастом, 
                            идеальный для работы в хорошо освещенных помещениях.
                        </p>
                        <p>
                            <strong>Темная тема:</strong> Современный темный интерфейс, который снижает нагрузку на глаза 
                            и экономит заряд батареи на устройствах с OLED экранами.
                        </p>
                        <p>
                            <strong>Системная тема:</strong> Автоматически переключается между светлой и темной темой 
                            в зависимости от настроек вашей операционной системы.
                        </p>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
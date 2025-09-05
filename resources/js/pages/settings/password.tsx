import SettingsLayout from '@/layouts/settings-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import { useForm, Head } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Password() {
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const { data, setData, put, processing, errors, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                alert('Пароль успешно изменен');
            },
            onError: () => {
                setData('current_password', '');
                setData('password', '');
                setData('password_confirmation', '');
            },
        });
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <SettingsLayout
            title="Пароль"
            description="Обновление пароля для обеспечения безопасности аккаунта"
        >
            <Head title="Изменить пароль" />

            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Изменение пароля</h3>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <div className="ml-2">
                        <p className="text-sm">
                            Убедитесь, что ваш аккаунт использует длинный, случайный пароль, чтобы оставаться в безопасности.
                        </p>
                    </div>
                </Alert>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Current Password */}
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Текущий пароль</Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    placeholder="Введите текущий пароль"
                                    className={errors.current_password ? 'border-destructive pr-10' : 'pr-10'}
                                    disabled={processing}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => togglePasswordVisibility('current')}
                                    disabled={processing}
                                >
                                    {showPasswords.current ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.current_password && (
                                <p className="text-sm text-destructive">{errors.current_password}</p>
                            )}
                        </div>

                        <Separator />

                        {/* New Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Новый пароль</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Введите новый пароль"
                                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                                    disabled={processing}
                                    required
                                    minLength={8}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => togglePasswordVisibility('new')}
                                    disabled={processing}
                                >
                                    {showPasswords.new ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Пароль должен содержать минимум 8 символов
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Подтверждение пароля</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Повторите новый пароль"
                                    className={errors.password_confirmation ? 'border-destructive pr-10' : 'pr-10'}
                                    disabled={processing}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    disabled={processing}
                                >
                                    {showPasswords.confirm ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Сохранение...' : 'Изменить пароль'}
                        </Button>

                        {recentlySuccessful && (
                            <div className="flex items-center text-sm text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Пароль изменен
                            </div>
                        )}
                    </div>
                </form>

                {/* Password Requirements */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Требования к паролю:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Минимум 8 символов</li>
                        <li>• Рекомендуется использовать буквы, цифры и специальные символы</li>
                        <li>• Не используйте простые или повторяющиеся пароли</li>
                        <li>• Не используйте личную информацию в пароле</li>
                    </ul>
                </div>
            </div>
        </SettingsLayout>
    );
}

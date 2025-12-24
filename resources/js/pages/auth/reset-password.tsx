import NewPasswordController from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
}

export default function ResetPassword({ token }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <AuthLayout title="Новый пароль" description="Введите новый пароль">
            <Head title="Новый пароль" />

            <Form {...NewPasswordController.store.form()} transform={(data) => ({ ...data, token })} resetOnSuccess={['password', 'password_confirmation']}>
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Новый пароль</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="new-password"
                                    className="pr-10"
                                    autoFocus
                                    placeholder="Минимум 8 символов"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Подтвердите пароль</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    className="pr-10"
                                    placeholder="Введите пароль ещё раз"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button type="submit" className="mt-4 w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Сохранить пароль
                        </Button>
                    </div>
                )}
            </Form>

            <div className="mt-6 space-x-1 text-center text-sm text-muted-foreground">
                <span>Или</span>
                <TextLink href={login()}>войти в систему</TextLink>
            </div>
        </AuthLayout>
    );
}

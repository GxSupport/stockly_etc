
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [phone, setPhone] = useState('+998 ');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value.length < 3) {
            value = '998';
        }
        value = value.substring(3);

        let formattedValue = '+998 ';
        if (value.length > 0) {
            formattedValue += value.substring(0, 2);
        }
        if (value.length > 2) {
            formattedValue += ' ' + value.substring(2, 5);
        }
        if (value.length > 5) {
            formattedValue += ' ' + value.substring(5, 7);
        }
        if (value.length > 7) {
            formattedValue += ' ' + value.substring(7, 9);
        }

        setPhone(formattedValue);
    };
    return (
        <AuthLayout title="
        Войти в аккаунт
        " description="Введите свои учетные данные для входа в систему.">
            <Head title="
        Войти в аккаунт
            " />

            <Form method="post" resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    Номер телефона
                                </Label>
                                <Input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="phone"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">
                                        Пароль
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
                                            Забыли пароль?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Введите пароль"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember">
                                    Запомнить меня
                                </Label>
                            </div>

                            <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Войти
                            </Button>
                        </div>

                    </>
                )}
            </Form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}

import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const [phoneValue, setPhoneValue] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');

        // Handle 998 prefix
        if (value.startsWith('998')) {
            value = value.slice(3);
        }

        // Limit to 9 digits after 998
        value = value.slice(0, 9);

        // Format the phone number
        let formatted = '+998';
        if (value.length > 0) {
            formatted += ' ' + value.slice(0, 2);
        }
        if (value.length > 2) {
            formatted += ' ' + value.slice(2, 5);
        }
        if (value.length > 5) {
            formatted += ' ' + value.slice(5, 7);
        }
        if (value.length > 7) {
            formatted += ' ' + value.slice(7, 9);
        }

        setPhoneValue(formatted);
    };

    return (
        <AuthLayout title="Восстановление пароля" description="Код подтверждения будет отправлен через Telegram">
            <Head title="Восстановление пароля" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <Form {...PasswordResetLinkController.store.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Номер телефона</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={phoneValue}
                                    onChange={handlePhoneChange}
                                    autoComplete="tel"
                                    autoFocus
                                    placeholder="+998 90 123 45 67"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button className="w-full" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Отправить код
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Или</span>
                    <TextLink href={login()}>войти в систему</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}

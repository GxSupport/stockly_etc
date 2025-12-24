import VerifyOtpController from '@/actions/App/Http/Controllers/Auth/VerifyOtpController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface VerifyOtpProps {
    token: string;
}

export default function VerifyOtp({ token }: VerifyOtpProps) {
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCode(value);
    };

    return (
        <AuthLayout title="Подтверждение кода" description="Введите код, отправленный через Telegram">
            <Head title="Подтверждение кода" />

            <div className="space-y-6">
                <Form {...VerifyOtpController.store.form()} transform={(data) => ({ ...data, token })}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Код подтверждения</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    name="code"
                                    value={code}
                                    onChange={handleCodeChange}
                                    autoComplete="one-time-code"
                                    autoFocus
                                    placeholder="000000"
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest"
                                />
                                <InputError message={errors.code} />

                                <div className="mt-2 text-center text-sm text-muted-foreground">
                                    {timeLeft > 0 ? (
                                        <span>Код действителен ещё: {formatTime(timeLeft)}</span>
                                    ) : (
                                        <span className="text-red-500">Срок действия кода истёк</span>
                                    )}
                                </div>
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button className="w-full" disabled={processing || code.length !== 6 || timeLeft <= 0}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Подтвердить
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

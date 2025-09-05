import SettingsLayout from '@/layouts/settings-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import { useForm, Head, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import { User, Mail, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Profile({ mustVerifyEmail, status }: Props) {
    const user = useForm().data;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: user?.name || '',
        email: user?.email || '',
    });

    const { delete: destroy, processing: processingDelete } = useForm();

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        patch('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => {
                alert('Профиль успешно обновлен!');
            },
            onError: () => {
                alert('Ошибка: Не удалось обновить профиль');
            },
        });
    };

    const deleteAccount = () => {
        if (confirm('Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.')) {
            destroy('/settings/profile', {
                onSuccess: () => {
                    alert('Аккаунт успешно удален');
                },
                onError: () => {
                    alert('Ошибка: Не удалось удалить аккаунт');
                },
            });
        }
    };

    return (
        <SettingsLayout
            title="Профиль"
            description="Управление личной информацией профиля"
        >
            <Head title="Настройки профиля" />

            <div className="space-y-8">
                {/* Profile Information Form */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Информация профиля</h3>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Имя</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Введите ваше имя"
                                    className={errors.name ? 'border-destructive' : ''}
                                    disabled={processing}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Введите ваш email"
                                    className={errors.email ? 'border-destructive' : ''}
                                    disabled={processing}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {mustVerifyEmail && user?.email_verified_at === null && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <div className="ml-2">
                                    <p>
                                        Ваш email адрес не подтвержден.{' '}
                                        <Link
                                            href="/email/verification-notification"
                                            method="post"
                                            as="button"
                                            className="underline text-sm text-primary hover:no-underline"
                                        >
                                            Нажмите здесь, чтобы отправить письмо для подтверждения.
                                        </Link>
                                    </p>
                                </div>
                            </Alert>
                        )}

                        {status === 'verification-link-sent' && (
                            <Alert>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <p className="ml-2 text-green-600">
                                    Новая ссылка для подтверждения была отправлена на ваш email адрес.
                                </p>
                            </Alert>
                        )}

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                            
                            {recentlySuccessful && (
                                <div className="flex items-center text-sm text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Сохранено
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <Separator />

                {/* Delete Account Section */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        <h3 className="text-lg font-medium text-destructive">Опасная зона</h3>
                    </div>

                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-destructive">Удалить аккаунт</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    После удаления вашего аккаунта все его ресурсы и данные будут безвозвратно удалены.
                                    Прежде чем удалить свой аккаунт, пожалуйста, загрузите любые данные или информацию,
                                    которые вы хотите сохранить.
                                </p>
                            </div>

                            <Button
                                variant="destructive"
                                onClick={deleteAccount}
                                disabled={processingDelete}
                            >
                                {processingDelete ? 'Удаление...' : 'Удалить аккаунт'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
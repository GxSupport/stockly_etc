import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings-layout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, User } from 'lucide-react';
import { FormEvent } from 'react';

interface User {
    id: number;
    name: string;
    chat_id: string;
}

interface Props {
    user: User;
    status?: string;
}

export default function Profile({ user }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: user?.name || '',
        chat_id: user?.chat_id || '',
    });
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

    return (
        <SettingsLayout title="Профиль" description="Управление личной информацией профиля">
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
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="chat_id">Telegram Chat ID</Label>
                                <Input
                                    id="chat_id"
                                    type="text"
                                    value={data.chat_id}
                                    onChange={(e) => setData('chat_id', e.target.value)}
                                    placeholder="Введите ваш id"
                                    className={errors.chat_id ? 'border-destructive' : ''}
                                    disabled={processing}
                                    required
                                />
                                {errors.chat_id && <p className="text-sm text-destructive">{errors.chat_id}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Сохранение...' : 'Сохранить'}
                            </Button>

                            {recentlySuccessful && (
                                <div className="flex items-center text-sm text-green-600">
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Сохранено
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </SettingsLayout>
    );
}

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
const TelegramIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const showModal = !auth.user.chat_id;

    const { data, setData, put, processing, errors } = useForm({
        chat_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/user/chat-id');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <Dialog open={showModal}>
                <DialogContent
                    className="sm:max-w-md [&>button]:hidden"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Telegram ID talab qilinadi</DialogTitle>
                        <DialogDescription>
                            Tizimdan foydalanish uchun Telegram ID raqamingizni kiriting.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                        1
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        Telegram botiga o'ting va <strong>/start</strong> bosing
                                    </p>
                                </div>

                                <div className="ml-9">
                                    <Button variant="outline" asChild>
                                        <a
                                            href="https://t.me/userinfobot"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <TelegramIcon className="h-4 w-4" />
                                            Telegramga o'tish
                                        </a>
                                    </Button>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                        2
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        Bot sizga ID raqamingizni ko'rsatadi. Uni nusxalab, quyidagi maydonga kiriting.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="chat_id">Telegram ID</Label>
                                <Input
                                    id="chat_id"
                                    type="text"
                                    placeholder="Masalan: 123456789"
                                    value={data.chat_id}
                                    onChange={(e) => setData('chat_id', e.target.value)}
                                />
                                {errors.chat_id && (
                                    <p className="text-sm text-destructive">{errors.chat_id}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="submit" disabled={processing || !data.chat_id.trim()}>
                                {processing ? 'Saqlanmoqda...' : 'Saqlash'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}

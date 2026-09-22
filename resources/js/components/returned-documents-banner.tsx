import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';

/**
 * Foydalanuvchiga qaytarilgan, hali ochilmagan aktlar bo'lsa — saytning istalgan sahifasida ogohlantirish (issue #32).
 * «Возврат» bo'limining o'zida ko'rsatilmaydi.
 */
export function ReturnedDocumentsBanner() {
    const { unreadReturnedCount = 0 } = usePage<SharedData>().props;
    const onReturnPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/documents/return');

    if (!unreadReturnedCount || onReturnPage) return null;

    const word = unreadReturnedCount === 1 ? 'возвращённый документ' : unreadReturnedCount < 5 ? 'возвращённых документа' : 'возвращённых документов';

    return (
        <div className="print:hidden mx-4 mt-4 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>
                У вас {unreadReturnedCount} непрочитанных {word}.
            </span>
            <Link href="/documents/return" className="ml-auto font-medium underline underline-offset-2">
                Открыть «Возврат»
            </Link>
        </div>
    );
}

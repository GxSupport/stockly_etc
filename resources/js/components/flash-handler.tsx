import { useToast } from '@/hooks/use-toast';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

interface PageProps {
    flash: FlashMessages;
    [key: string]: unknown;
}

export function FlashHandler() {
    const { flash } = usePage<PageProps>().props;
    const { toast } = useToast();
    const processedFlash = useRef<string | null>(null);

    useEffect(() => {
        // Create a unique key for this flash message set
        const flashKey = JSON.stringify(flash);

        // Skip if we've already processed these exact flash messages
        if (processedFlash.current === flashKey) {
            return;
        }

        // Handle success messages
        if (flash.success) {
            toast.success(flash.success, 'Успешно');
        }

        // Handle error messages
        if (flash.error) {
            toast.error(flash.error, 'Ошибка');
        }

        // Handle warning messages
        if (flash.warning) {
            toast.warning(flash.warning, 'Предупреждение');
        }

        // Handle info messages
        if (flash.info) {
            toast.info(flash.info, 'Информация');
        }

        // Mark these flash messages as processed
        processedFlash.current = flashKey;
    }, [flash, toast]);

    return null; // This component doesn't render anything
}

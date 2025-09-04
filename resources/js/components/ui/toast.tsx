import * as React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
    id?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    onClose?: () => void;
}

const toastVariants = {
    success: {
        icon: CheckCircle,
        className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-300",
        iconClassName: "text-green-500",
    },
    error: {
        icon: XCircle,
        className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-300",
        iconClassName: "text-red-500",
    },
    warning: {
        icon: AlertTriangle,
        className: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        iconClassName: "text-yellow-500",
    },
    info: {
        icon: Info,
        className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300",
        iconClassName: "text-blue-500",
    },
};

export function Toast({ type = 'info', title, message, duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = React.useState(true);
    const variant = toastVariants[type];
    const Icon = variant.icon;

    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => {
                    onClose?.();
                }, 150); // Animation duration
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose?.();
        }, 150);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={cn(
                "flex items-start space-x-3 p-4 border rounded-lg shadow-lg transition-all duration-150 ease-in-out",
                variant.className,
                isVisible ? "animate-in slide-in-from-right-full" : "animate-out slide-out-to-right-full"
            )}
        >
            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", variant.iconClassName)} />
            
            <div className="flex-1 min-w-0">
                {title && (
                    <h4 className="text-sm font-medium mb-1">{title}</h4>
                )}
                <p className="text-sm">{message}</p>
            </div>
            
            {onClose && (
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

export interface ToastManagerProps {
    toasts: (ToastProps & { id: string })[];
    onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastManagerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => onRemoveToast(toast.id)}
                />
            ))}
        </div>
    );
}
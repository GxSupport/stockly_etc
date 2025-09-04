import * as React from "react";
import { ToastProps } from "@/components/ui/toast";

type ToastWithId = ToastProps & { id: string };

interface ToastContextType {
    toasts: ToastWithId[];
    addToast: (toast: Omit<ToastProps, 'onClose'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastWithId[]>([]);

    const addToast = React.useCallback((toast: Omit<ToastProps, 'onClose'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastWithId = { ...toast, id };
        
        setToasts((current) => [...current, newToast]);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const clearToasts = React.useCallback(() => {
        setToasts([]);
    }, []);

    const contextValue = React.useMemo(() => ({
        toasts,
        addToast,
        removeToast,
        clearToasts,
    }), [toasts, addToast, removeToast, clearToasts]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    const toast = React.useMemo(() => ({
        success: (message: string, title?: string) => 
            context.addToast({ type: 'success', message, title }),
        error: (message: string, title?: string) => 
            context.addToast({ type: 'error', message, title }),
        warning: (message: string, title?: string) => 
            context.addToast({ type: 'warning', message, title }),
        info: (message: string, title?: string) => 
            context.addToast({ type: 'info', message, title }),
    }), [context.addToast]);

    return {
        toast,
        toasts: context.toasts,
        removeToast: context.removeToast,
        clearToasts: context.clearToasts,
    };
}
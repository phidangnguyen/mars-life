'use client';

import { createContext, useContext, useState } from 'react';

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

interface ToastContextType {
    toasts: Toast[];
    toast: (props: Omit<Toast, 'id'>) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = (props: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { id, ...props };
        setToasts((prevToasts) => [...prevToasts, newToast]);

        // Auto dismiss after 3 seconds
        setTimeout(() => {
            dismissToast(id);
        }, 3000);
    };

    const dismissToast = (id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
            {children}
            <div className="fixed bottom-0 right-0 p-4 w-full max-w-sm">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`mb-2 p-4 rounded-lg shadow-lg text-white ${toast.variant === 'destructive' ? 'bg-red-600' : 'bg-blue-600'
                            }`}
                    >
                        <h3 className="font-medium">{toast.title}</h3>
                        {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

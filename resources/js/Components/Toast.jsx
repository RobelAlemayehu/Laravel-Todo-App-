import { useState, useCallback } from 'react';
import { CheckIcon, UndoIcon } from './Icons';

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, options = {}) => {
        const id = Date.now() + Math.random();
        const duration = options.duration || 3000;
        const onUndo = options.onUndo || null;

        setToasts((prev) => [...prev, { id, message, onUndo }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, showToast, dismissToast };
}

export function ToastContainer({ toasts = [], onDismiss }) {
    if (!toasts.length) return null;

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map((toast) => (
                <div key={toast.id} className="toast" role="status">
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <CheckIcon size={14} style={{ color: 'var(--success)' }} />
                    </span>
                    <span>{toast.message}</span>
                    {toast.onUndo && (
                        <button
                            type="button"
                            className="toast-undo-btn"
                            onClick={() => {
                                toast.onUndo();
                                onDismiss?.(toast.id);
                            }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <UndoIcon size={12} />
                                <span>Undo</span>
                            </span>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ToastContainer;

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = false,
    loading = false,
    onConfirm,
    onCancel,
}) {
    const dialogRef = useRef(null);
    const cancelBtnRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);

    // Save active element on open and restore on close
    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElementRef.current = document.activeElement;
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            const timer = setTimeout(() => {
                cancelBtnRef.current?.focus();
            }, 50);

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = originalOverflow;
                if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
                    previouslyFocusedElementRef.current.focus();
                }
            };
        }
    }, [isOpen]);

    // Handle Esc key and Focus Trap
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (!loading) {
                    e.preventDefault();
                    onCancel();
                }
                return;
            }

            if (e.key === 'Tab') {
                if (!dialogRef.current) return;
                const focusableElements = dialogRef.current.querySelectorAll(
                    'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length === 0) return;

                const firstEl = focusableElements[0];
                const lastEl = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    }
                } else {
                    if (document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, loading, onCancel]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="modal-backdrop"
            style={{ zIndex: 'var(--z-dialog)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    onCancel();
                }
            }}
            aria-hidden="false"
        >
            <div
                ref={dialogRef}
                className="modal-content"
                style={{
                    maxWidth: '420px',
                    borderRadius: 'var(--radius-modal)',
                    padding: '24px',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-modal)',
                }}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    id="confirm-dialog-title"
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--choc-900)',
                        marginBottom: '8px',
                    }}
                >
                    {title}
                </h2>
                <div
                    id="confirm-dialog-description"
                    style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: 'var(--choc-500)',
                        lineHeight: 1.5,
                        marginBottom: '24px',
                        wordBreak: 'break-word',
                    }}
                >
                    {message}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button
                        ref={cancelBtnRef}
                        variant="secondary"
                        size="md"
                        disabled={loading}
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={isDestructive ? 'danger' : 'primary'}
                        size="md"
                        loading={loading}
                        disabled={loading}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export function useConfirm() {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        isDestructive: false,
        loading: false,
        onConfirmAction: null,
    });

    const resolverRef = useRef(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setDialogState({
                isOpen: true,
                title: options.title || 'Are you sure?',
                message: options.message || '',
                confirmLabel: options.confirmLabel || 'Confirm',
                cancelLabel: options.cancelLabel || 'Cancel',
                isDestructive: Boolean(options.isDestructive),
                loading: false,
                onConfirmAction: options.onConfirm || null,
            });
        });
    }, []);

    const handleConfirm = useCallback(async () => {
        if (dialogState.onConfirmAction) {
            setDialogState((prev) => ({ ...prev, loading: true }));
            try {
                await dialogState.onConfirmAction();
                setDialogState((prev) => ({ ...prev, isOpen: false, loading: false }));
                if (resolverRef.current) resolverRef.current(true);
            } catch {
                setDialogState((prev) => ({ ...prev, loading: false }));
            }
        } else {
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            if (resolverRef.current) resolverRef.current(true);
        }
    }, [dialogState.onConfirmAction]);

    const handleCancel = useCallback(() => {
        setDialogState((prev) => ({ ...prev, isOpen: false, loading: false }));
        if (resolverRef.current) resolverRef.current(false);
    }, []);

    const ConfirmDialogComponent = (
        <ConfirmDialog
            isOpen={dialogState.isOpen}
            title={dialogState.title}
            message={dialogState.message}
            confirmLabel={dialogState.confirmLabel}
            cancelLabel={dialogState.cancelLabel}
            isDestructive={dialogState.isDestructive}
            loading={dialogState.loading}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return {
        confirm,
        ConfirmDialogComponent,
    };
}

export default ConfirmDialog;

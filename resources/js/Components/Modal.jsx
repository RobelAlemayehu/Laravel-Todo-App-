import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './Icons';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = '540px',
}) {
    const modalRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElementRef.current = document.activeElement;
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            const timer = setTimeout(() => {
                const focusable = modalRef.current?.querySelector(
                    'input:not([disabled]), textarea:not([disabled]), button:not([disabled])'
                );
                focusable?.focus();
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

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose?.();
                return;
            }

            if (e.key === 'Tab') {
                if (!modalRef.current) return;
                const focusableElements = modalRef.current.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="modal-backdrop"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose?.();
                }
            }}
            aria-hidden="false"
        >
            <div
                ref={modalRef}
                className="modal-content"
                style={{ maxWidth }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-dialog-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 id="modal-dialog-title" className="modal-title">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-icon-only"
                        aria-label="Close dialog"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                <div className="modal-body">{children}</div>

                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>,
        document.body
    );
}

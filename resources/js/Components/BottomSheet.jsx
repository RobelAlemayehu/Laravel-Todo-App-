import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './Icons';

export default function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    footer,
}) {
    const sheetRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="bottom-sheet-backdrop"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose?.();
                }
            }}
            aria-hidden="false"
        >
            <div
                ref={sheetRef}
                className="bottom-sheet-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sheet-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bottom-sheet-drag-handle" />

                <div className="modal-header" style={{ padding: '14px 20px' }}>
                    <h2 id="sheet-title" className="modal-title" style={{ fontSize: '18px' }}>
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-icon-only"
                        aria-label="Close sheet"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '20px' }}>
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer" style={{ padding: '14px 20px' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

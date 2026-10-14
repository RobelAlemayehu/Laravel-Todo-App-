import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon, AlertCircleIcon } from './Icons';

export default function Select({
    label,
    value = '',
    onChange,
    options = [], // [{ value: '', label: 'None' }]
    placeholder = 'None',
    error,
    optional = false,
    id,
    disabled = false,
    className = '',
    containerClassName = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            triggerRef.current?.focus();
            return;
        }

        const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % options.length;
            onChange?.(options[nextIndex].value);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + options.length) % options.length;
            onChange?.(options[prevIndex].value);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(false);
            triggerRef.current?.focus();
        }
    };

    return (
        <div className={`form-group ${containerClassName}`.trim()} ref={wrapperRef}>
            {label && (
                <label htmlFor={inputId} className="form-label">
                    <span>{label}</span>
                    {optional && <span className="form-label-optional">Optional</span>}
                </label>
            )}

            <div className="custom-listbox-wrapper">
                <button
                    ref={triggerRef}
                    id={inputId}
                    type="button"
                    disabled={disabled}
                    className={`custom-listbox-trigger ${isOpen ? 'open' : ''} ${error ? 'has-error' : ''} ${className}`.trim()}
                    onClick={() => setIsOpen((prev) => !prev)}
                    onKeyDown={handleKeyDown}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span style={{ color: selectedOption && selectedOption.value !== '' ? 'var(--choc-900)' : 'var(--muted)' }}>
                        {displayLabel}
                    </span>
                    <ChevronDownIcon size={14} style={{ color: 'var(--muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                </button>

                {isOpen && (
                    <div className="custom-listbox-menu" role="listbox" tabIndex={-1}>
                        {options.map((opt) => {
                            const isSelected = String(opt.value) === String(value);
                            return (
                                <div
                                    key={opt.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`custom-listbox-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        onChange?.(opt.value);
                                        setIsOpen(false);
                                        triggerRef.current?.focus();
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <CheckIcon size={14} style={{ color: 'var(--choc-700)' }} />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {error && (
                <div className="form-error">
                    <AlertCircleIcon size={13} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

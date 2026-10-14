import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, AlertCircleIcon } from './Icons';

// Helper: parse local YYYY-MM-DD to local Date object (avoids timezone shifts)
function parseLocalDate(str) {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month, day);
}

// Helper: format local Date object to YYYY-MM-DD
function formatToYMD(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Helper: format for display (e.g., "Oct 20, 2026")
function formatDisplayDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function DatePicker({
    label,
    value = '',
    onChange,
    error,
    optional = false,
    placeholder = 'Pick a date',
    id,
    disabled = false,
    className = '',
    containerClassName = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, flip: false });

    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const focusedDayRef = useRef(null);

    const selectedDate = useMemo(() => parseLocalDate(value), [value]);
    const today = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, []);

    // Active calendar view (year and month)
    const [viewYear, setViewYear] = useState(() => (selectedDate ? selectedDate.getFullYear() : today.getFullYear()));
    const [viewMonth, setViewMonth] = useState(() => (selectedDate ? selectedDate.getMonth() : today.getMonth()));
    const [focusedDate, setFocusedDate] = useState(() => selectedDate || today);

    // Sync view when selectedDate changes
    useEffect(() => {
        if (selectedDate) {
            setViewYear(selectedDate.getFullYear());
            setViewMonth(selectedDate.getMonth());
            setFocusedDate(selectedDate);
        }
    }, [selectedDate]);

    // Check mobile breakpoint
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate popover coordinates on open
    const updatePosition = useCallback(() => {
        if (!triggerRef.current || isMobile) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const popoverHeight = 350;
        const popoverWidth = 300;

        const spaceBelow = window.innerHeight - rect.bottom;
        const shouldFlip = spaceBelow < popoverHeight && rect.top > popoverHeight;

        let top = shouldFlip
            ? rect.top + window.scrollY - popoverHeight - 6
            : rect.bottom + window.scrollY + 6;

        let left = rect.left + window.scrollX;
        if (left + popoverWidth > window.innerWidth - 16) {
            left = window.innerWidth - popoverWidth - 16;
        }
        if (left < 16) left = 16;

        setCoords({ top, left, flip: shouldFlip });
    }, [isMobile]);

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, updatePosition]);

    // Close when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target) &&
                popoverRef.current &&
                !popoverRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Handle Month Navigation
    const prevMonth = (e) => {
        e?.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const nextMonth = (e) => {
        e?.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    // Build days matrix for the month (Monday start)
    const calendarDays = useMemo(() => {
        const days = [];
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const startingWeekday = (firstDayOfMonth.getDay() + 6) % 7;

        const prevMonthDaysCount = new Date(viewYear, viewMonth, 0).getDate();
        for (let i = startingWeekday - 1; i >= 0; i--) {
            const date = new Date(viewYear, viewMonth - 1, prevMonthDaysCount - i);
            days.push({
                date,
                isCurrentMonth: false,
                dayNumber: date.getDate(),
            });
        }

        const currentMonthDaysCount = new Date(viewYear, viewMonth + 1, 0).getDate();
        for (let i = 1; i <= currentMonthDaysCount; i++) {
            const date = new Date(viewYear, viewMonth, i);
            days.push({
                date,
                isCurrentMonth: true,
                dayNumber: i,
            });
        }

        const remainingCells = (7 - (days.length % 7)) % 7;
        for (let i = 1; i <= remainingCells; i++) {
            const date = new Date(viewYear, viewMonth + 1, i);
            days.push({
                date,
                isCurrentMonth: false,
                dayNumber: i,
            });
        }

        return days;
    }, [viewYear, viewMonth]);

    const selectDate = (date) => {
        const ymd = date ? formatToYMD(date) : '';
        onChange?.(ymd);
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const clearDate = (e) => {
        e.stopPropagation();
        onChange?.('');
        triggerRef.current?.focus();
    };

    const pickToday = () => selectDate(today);
    const pickTomorrow = () => {
        const tom = new Date(today);
        tom.setDate(tom.getDate() + 1);
        selectDate(tom);
    };
    const pickNextWeek = () => {
        const nw = new Date(today);
        nw.setDate(nw.getDate() + 7);
        selectDate(nw);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
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

        const curr = new Date(focusedDate);
        let handled = false;

        if (e.key === 'ArrowLeft') {
            curr.setDate(curr.getDate() - 1);
            handled = true;
        } else if (e.key === 'ArrowRight') {
            curr.setDate(curr.getDate() + 1);
            handled = true;
        } else if (e.key === 'ArrowUp') {
            curr.setDate(curr.getDate() - 7);
            handled = true;
        } else if (e.key === 'ArrowDown') {
            curr.setDate(curr.getDate() + 7);
            handled = true;
        } else if (e.key === 'PageUp') {
            prevMonth();
            curr.setMonth(curr.getMonth() - 1);
            handled = true;
        } else if (e.key === 'PageDown') {
            nextMonth();
            curr.setMonth(curr.getMonth() + 1);
            handled = true;
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectDate(focusedDate);
            return;
        }

        if (handled) {
            e.preventDefault();
            setFocusedDate(curr);
            setViewYear(curr.getFullYear());
            setViewMonth(curr.getMonth());
        }
    };

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const calendarContent = (
        <div>
            {/* Header with Month/Year and navigation arrows */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--choc-900)',
                    }}
                >
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        type="button"
                        className="btn btn-ghost btn-icon-only"
                        onClick={prevMonth}
                        aria-label="Previous month"
                    >
                        <ChevronLeftIcon size={14} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-ghost btn-icon-only"
                        onClick={nextMonth}
                        aria-label="Next month"
                    >
                        <ChevronRightIcon size={14} />
                    </button>
                </div>
            </div>

            {/* Weekdays row */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    marginBottom: '6px',
                    textAlign: 'center',
                }}
            >
                {WEEKDAY_NAMES.map((w) => (
                    <div
                        key={w}
                        style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                        }}
                    >
                        {w}
                    </div>
                ))}
            </div>

            {/* Grid of days */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 36px)',
                    gap: '2px',
                    justifyContent: 'space-between',
                }}
                role="grid"
            >
                {calendarDays.map((item, idx) => {
                    const isSelected = selectedDate && formatToYMD(item.date) === formatToYMD(selectedDate);
                    const isToday = formatToYMD(item.date) === formatToYMD(today);
                    const isFocused = formatToYMD(item.date) === formatToYMD(focusedDate);

                    const fullDateStr = item.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    });

                    return (
                        <button
                            key={idx}
                            type="button"
                            ref={isFocused ? focusedDayRef : null}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: isSelected ? 600 : 400,
                                background: isSelected
                                    ? 'var(--choc-700)'
                                    : 'transparent',
                                border: 'none',
                                color: isSelected
                                    ? 'var(--surface)'
                                    : !item.isCurrentMonth
                                    ? 'var(--muted)'
                                    : 'var(--choc-900)',
                                boxShadow: isToday && !isSelected ? 'inset 0 0 0 1px var(--caramel)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 150ms ease-out',
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={() => selectDate(item.date)}
                            aria-label={fullDateStr}
                            aria-selected={isSelected ? 'true' : 'false'}
                            tabIndex={isFocused ? 0 : -1}
                        >
                            {item.dayNumber}
                        </button>
                    );
                })}
            </div>

            {/* Quick chips at bottom */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '14px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border)',
                    flexWrap: 'wrap',
                }}
            >
                <button
                    type="button"
                    className="badge"
                    style={{ cursor: 'pointer', backgroundColor: 'var(--surface-2)' }}
                    onClick={pickToday}
                >
                    Today
                </button>
                <button
                    type="button"
                    className="badge"
                    style={{ cursor: 'pointer', backgroundColor: 'var(--surface-2)' }}
                    onClick={pickTomorrow}
                >
                    Tomorrow
                </button>
                <button
                    type="button"
                    className="badge"
                    style={{ cursor: 'pointer', backgroundColor: 'var(--surface-2)' }}
                    onClick={pickNextWeek}
                >
                    Next week
                </button>
                {value && (
                    <button
                        type="button"
                        className="badge"
                        style={{ cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--muted)' }}
                        onClick={() => selectDate(null)}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className={`form-group ${containerClassName}`.trim()}>
            {label && (
                <label htmlFor={inputId} className="form-label">
                    <span>{label}</span>
                    {optional && <span className="form-label-optional">Optional</span>}
                </label>
            )}

            <div style={{ position: 'relative', width: '100%' }}>
                <button
                    ref={triggerRef}
                    id={inputId}
                    type="button"
                    disabled={disabled}
                    className={`custom-listbox-trigger ${error ? 'has-error' : ''} ${className}`.trim()}
                    onClick={() => setIsOpen((prev) => !prev)}
                    onKeyDown={handleKeyDown}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarIcon size={14} style={{ color: 'var(--choc-500)' }} />
                        {selectedDate ? (
                            <span style={{ color: 'var(--choc-900)', fontWeight: 500 }}>
                                {formatDisplayDate(selectedDate)}
                            </span>
                        ) : (
                            <span style={{ color: 'var(--muted)' }}>{placeholder}</span>
                        )}
                    </span>

                    {value && !disabled && (
                        <span
                            role="button"
                            onClick={clearDate}
                            title="Clear date"
                            aria-label="Clear date"
                            style={{
                                color: 'var(--muted)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px',
                                cursor: 'pointer',
                            }}
                        >
                            <XIcon size={13} />
                        </span>
                    )}
                </button>
            </div>

            {error && (
                <div className="form-error">
                    <AlertCircleIcon size={13} />
                    <span>{error}</span>
                </div>
            )}

            {/* Portal Popover or Bottom Sheet */}
            {isOpen &&
                createPortal(
                    isMobile ? (
                        <div
                            className="bottom-sheet-backdrop"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setIsOpen(false);
                            }}
                        >
                            <div
                                ref={popoverRef}
                                className="bottom-sheet-content"
                                style={{ padding: '20px 16px 28px' }}
                            >
                                <div className="bottom-sheet-drag-handle" />
                                {calendarContent}
                            </div>
                        </div>
                    ) : (
                        <div
                            ref={popoverRef}
                            style={{
                                position: 'absolute',
                                top: `${coords.top}px`,
                                left: `${coords.left}px`,
                                width: '300px',
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-card)',
                                boxShadow: 'var(--shadow-popover)',
                                padding: '16px',
                                zIndex: 'var(--z-popover)',
                                animation: 'modal-fade-in 150ms ease-out forwards',
                            }}
                            onKeyDown={handleKeyDown}
                        >
                            {calendarContent}
                        </div>
                    ),
                    document.body
                )}
        </div>
    );
}

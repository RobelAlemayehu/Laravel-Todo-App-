import React from 'react';
import { router } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

export default function Pagination({
    links = [],
    meta = null,
    className = '',
}) {
    const paginationLinks = links.length > 0 ? links : meta?.links || [];

    // Only render if more than 3 items (meaning at least 2 pages)
    if (!paginationLinks || paginationLinks.length <= 3) {
        return null;
    }

    const handleNavigate = (url, active) => {
        if (!url || active) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className={`pagination-container ${className}`.trim()}>
            <nav className="pagination-wrapper" aria-label="Pagination">
                {paginationLinks.map((link, idx) => {
                    const rawLabel = link.label || '';
                    const isPrev = rawLabel.includes('Previous') || rawLabel.includes('&laquo;') || rawLabel.includes('‹');
                    const isNext = rawLabel.includes('Next') || rawLabel.includes('&raquo;') || rawLabel.includes('›');
                    const isEllipsis = rawLabel === '...' || rawLabel.includes('&hellip;');

                    if (isEllipsis) {
                        return (
                            <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                                …
                            </span>
                        );
                    }

                    const isDisabled = !link.url || link.active;

                    if (isPrev) {
                        return (
                            <button
                                key={`prev-${idx}`}
                                type="button"
                                className={`pagination-item nav-btn ${link.active ? 'active' : ''}`}
                                disabled={isDisabled}
                                onClick={() => handleNavigate(link.url, link.active)}
                                aria-label="Previous page"
                            >
                                <ChevronLeftIcon size={14} />
                                <span>Prev</span>
                            </button>
                        );
                    }

                    if (isNext) {
                        return (
                            <button
                                key={`next-${idx}`}
                                type="button"
                                className={`pagination-item nav-btn ${link.active ? 'active' : ''}`}
                                disabled={isDisabled}
                                onClick={() => handleNavigate(link.url, link.active)}
                                aria-label="Next page"
                            >
                                <span>Next</span>
                                <ChevronRightIcon size={14} />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={`page-${idx}`}
                            type="button"
                            className={`pagination-item ${link.active ? 'active' : ''}`}
                            disabled={isDisabled}
                            onClick={() => handleNavigate(link.url, link.active)}
                            aria-current={link.active ? 'page' : undefined}
                            aria-label={`Page ${rawLabel}`}
                        >
                            {rawLabel}
                        </button>
                    );
                })}
            </nav>

            {meta && meta.total > 0 && (
                <div className="pagination-caption">
                    Showing <span style={{ fontWeight: 600, color: 'var(--choc-700)' }}>{meta.from ?? 1}</span> to{' '}
                    <span style={{ fontWeight: 600, color: 'var(--choc-700)' }}>{meta.to ?? meta.total}</span> of{' '}
                    <span style={{ fontWeight: 600, color: 'var(--choc-700)' }}>{meta.total}</span> tasks
                </div>
            )}
        </div>
    );
}

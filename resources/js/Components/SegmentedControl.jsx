export default function SegmentedControl({
    items = [], // [{ key: 'all', label: 'All', count: 5 }]
    activeKey = 'all',
    onChange,
    className = '',
}) {
    return (
        <div className={`segmented-control ${className}`.trim()} role="tablist" aria-label="Status filter">
            {items.map((item) => {
                const isActive = item.key === activeKey;
                return (
                    <button
                        key={item.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`segmented-tab ${isActive ? 'active' : ''}`}
                        onClick={() => onChange?.(item.key)}
                    >
                        <span>{item.label}</span>
                        {item.count !== undefined && item.count !== null && (
                            <span className="segmented-count-badge">
                                {item.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

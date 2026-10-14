export default function Avatar({
    name = '',
    size = 32,
    className = '',
}) {
    const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';

    return (
        <div
            className={className}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '999px',
                backgroundColor: 'var(--choc-700)',
                color: 'var(--surface)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: `${Math.round(size * 0.45)}px`,
                boxShadow: '0 2px 6px rgba(75, 46, 30, 0.15)',
                userSelect: 'none',
                flexShrink: 0,
            }}
            title={name}
            aria-label={name}
        >
            {initial}
        </div>
    );
}

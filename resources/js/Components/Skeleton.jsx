export default function Skeleton({
    height = 20,
    width = '100%',
    borderRadius = '8px',
    className = '',
}) {
    return (
        <div
            className={className}
            style={{
                height: typeof height === 'number' ? `${height}px` : height,
                width: typeof width === 'number' ? `${width}px` : width,
                borderRadius,
                backgroundColor: 'var(--surface-2)',
                opacity: 0.7,
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
        />
    );
}

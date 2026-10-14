export default function Badge({
    children,
    variant = 'default', // 'default' | 'tag' | 'due-soon' | 'overdue' | 'done'
    dotColor = null,
    icon = null,
    className = '',
    ...props
}) {
    const variantClass = {
        default: '',
        tag: '',
        'due-soon': 'due-soon',
        overdue: 'overdue',
        done: 'done-badge',
    }[variant] || '';

    return (
        <span className={`badge ${variantClass} ${className}`.trim()} {...props}>
            {dotColor && (
                <span
                    className="badge-dot"
                    style={{ backgroundColor: dotColor }}
                />
            )}
            {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
            <span>{children}</span>
        </span>
    );
}

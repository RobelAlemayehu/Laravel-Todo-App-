export default function Button({
    children,
    type = 'button',
    variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost'
    size = 'md',        // 'sm' | 'md' | 'lg'
    icon = null,
    iconRight = null,
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) {
    const variantClass = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        'danger-ghost': 'btn-danger-ghost',
    }[variant] || 'btn-primary';

    const sizeClass = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
    }[size] || '';

    const widthClass = fullWidth ? 'btn-block' : '';

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`btn ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
            {...props}
        >
            {loading ? (
                <span className="spinner" />
            ) : (
                icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
            )}
            {children}
            {!loading && iconRight && (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>{iconRight}</span>
            )}
        </button>
    );
}

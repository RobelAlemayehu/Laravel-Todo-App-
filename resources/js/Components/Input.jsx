import { useState, useRef, useEffect } from 'react';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from './Icons';

export function Input({
    label,
    error,
    optional = false,
    type = 'text',
    className = '',
    containerClassName = '',
    id,
    allowTogglePassword = false,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const computedType = isPassword && showPassword ? 'text' : type;

    return (
        <div className={`form-group ${containerClassName}`.trim()}>
            {label && (
                <label htmlFor={inputId} className="form-label">
                    <span>{label}</span>
                    {optional && <span className="form-label-optional">Optional</span>}
                </label>
            )}
            <div style={{ position: 'relative', width: '100%' }}>
                <input
                    id={inputId}
                    type={computedType}
                    className={`form-input ${error ? 'has-error' : ''} ${className}`.trim()}
                    style={isPassword && allowTogglePassword ? { paddingRight: '40px' } : undefined}
                    {...props}
                />
                {isPassword && allowTogglePassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px',
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
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

export function Textarea({
    label,
    error,
    optional = false,
    rows = 2,
    className = '',
    containerClassName = '',
    id,
    value,
    onChange,
    ...props
}) {
    const textareaRef = useRef(null);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    // Auto-grow textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(76, textareaRef.current.scrollHeight)}px`;
        }
    }, [value]);

    return (
        <div className={`form-group ${containerClassName}`.trim()}>
            {label && (
                <label htmlFor={inputId} className="form-label">
                    <span>{label}</span>
                    {optional && <span className="form-label-optional">Optional</span>}
                </label>
            )}
            <textarea
                ref={textareaRef}
                id={inputId}
                rows={rows}
                value={value}
                onChange={onChange}
                className={`form-textarea ${error ? 'has-error' : ''} ${className}`.trim()}
                {...props}
            />
            {error && (
                <div className="form-error">
                    <AlertCircleIcon size={13} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

export default Input;

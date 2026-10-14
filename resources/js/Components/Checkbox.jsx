import { CheckIcon } from './Icons';

export default function Checkbox({
    checked = false,
    onChange,
    id,
    name,
    disabled = false,
    className = '',
    'aria-label': ariaLabel,
    ...props
}) {
    return (
        <label className={`custom-checkbox-wrapper ${className}`.trim()}>
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                className="custom-checkbox-input"
                aria-label={ariaLabel}
                {...props}
            />
            <span className="custom-checkbox-box">
                {checked && <CheckIcon className="custom-checkbox-icon" />}
            </span>
        </label>
    );
}

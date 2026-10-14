export default function ProgressBar({
    value = 0, // 0 to 100
    className = '',
}) {
    const clamped = Math.min(100, Math.max(0, Math.round(value)));

    return (
        <div
            className={`progress-track ${className}`.trim()}
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`${clamped}% tasks completed`}
        >
            <div
                className="progress-fill"
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}

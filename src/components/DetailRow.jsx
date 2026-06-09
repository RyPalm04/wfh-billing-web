export function DetailRow({ label, value, className }) {
    return (
        <div className={`detail-row${className ? ` ${className}` : ''}`}>
            <span className="detail-label">{label}</span>
            <span className="detail-value">{value}</span>
        </div>
    )
}
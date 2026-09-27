function Spinner({ size = 'md', label }) {
    return (
        <div className="spinner-wrap" role="status" aria-live="polite">
            <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
            {label && <span className="spinner-label">{label}</span>}
        </div>
    );
}

export default Spinner;

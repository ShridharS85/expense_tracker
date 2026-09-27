import './Card.css';

function Card({ title, value, type, icon, subtitle }) {
    return (
        <div className={`stat-card stat-card-${type}`}>
            <div className="stat-card-top">
                <div className="stat-card-title">{title}</div>
                <div className={`stat-card-icon stat-card-icon-${type}`}>{icon}</div>
            </div>
            <div className="stat-card-value">{value}</div>
            {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
            <span className={`stat-card-accent stat-card-accent-${type}`} aria-hidden="true" />
        </div>
    );
}

export default Card;

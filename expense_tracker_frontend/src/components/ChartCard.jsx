import './ChartCard.css';

function ChartCard({ title, icon, children, headerActions }) {
    return (
        <div className="chart-card">
            <div className="chart-card-header">
                <div className="chart-card-title">
                    {icon && <span className="chart-card-icon">{icon}</span>}
                    <span>{title}</span>
                </div>
                {headerActions && <div className="chart-card-actions">{headerActions}</div>}
            </div>
            <div className="chart-card-content">{children}</div>
        </div>
    );
}

export default ChartCard;

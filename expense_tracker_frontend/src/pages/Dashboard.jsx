import { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import ChartCard from '../components/ChartCard';
import EmptyState from '../components/EmptyState';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
} from 'chart.js';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    BarChart3,
    ChartPie,
    Activity,
    ReceiptText,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatDate';
import { useTheme, cssVar } from '../utils/theme';
import api from '../api/api';
import './Dashboard.css';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler
);

const CATEGORY_COLORS = {
    FOOD: '#f97316',
    TRAVEL: '#3b82f6',
    SHOPPING: '#ec4899',
    BILLS: '#8b5cf6',
    OTHER: '#64748b'
};

function Dashboard() {
    const theme = useTheme();
    const [dashboard, setDashboard] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [monthlyExpenses, setMonthlyExpenses] = useState([]);
    const [categoryDistribution, setCategoryDistribution] = useState([]);
    const [dailySpending, setDailySpending] = useState([]);
    const [chartMonths, setChartMonths] = useState(6);
    const [chartDays, setChartDays] = useState(30);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchChartDatas();
    }, [chartMonths, chartDays]);

    const fetchData = async () => {
        try {
            const [dashRes, expRes, incRes] = await Promise.all([
                api.get('/api/dashboard'),
                api.get('/api/expenses'),
                api.get('/api/income')
            ]);

            setDashboard(dashRes.data);

            const expenses = expRes.data.map((e) => ({ ...e, type: 'expense' }));
            const incomes = incRes.data.map((i) => ({ ...i, type: 'income' }));

            const combined = [...expenses, ...incomes]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);

            setRecentTransactions(combined);
        } catch (err) {
            console.error('Failed to load dashboard', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchChartDatas = async () => {
        try {
            const [monthlyRes, categoryRes, dailyRes] = await Promise.all([
                api.get(`/api/dashboard/charts/monthly-expenses?months=${chartMonths}`),
                api.get('/api/dashboard/charts/category-distribution'),
                api.get(`/api/dashboard/charts/daily-spending?days=${chartDays}`)
            ]);

            setMonthlyExpenses(monthlyRes.data);
            setCategoryDistribution(categoryRes.data);
            setDailySpending(dailyRes.data);
        } catch (err) {
            console.error('Failed to load charts', err);
        }
    };

    /* Chart theming — recomputed whenever the theme flips */
    const chartPalette = useMemo(() => {
        const grid = cssVar('--chart-grid') || '#e8ecf4';
        const tick = cssVar('--chart-tick') || '#94a3b8';
        const tooltipBg = cssVar('--chart-tooltip-bg') || '#0f172a';
        return { grid, tick, tooltipBg };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme]);

    const tooltipStyle = useMemo(() => ({
        backgroundColor: chartPalette.tooltipBg,
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 12 },
        displayColors: false,
    }), [chartPalette]);

    if (loading) {
        return (
            <div className="dashboard">
                <div className="page-header">
                    <div>
                        <h1 className="page-heading">Dashboard</h1>
                        <p className="page-subheading">Your financial overview at a glance</p>
                    </div>
                </div>
                <div className="dashboard-cards">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="skeleton skeleton-stat" />
                    ))}
                </div>
                <div className="chart-grid">
                    <div className="skeleton skeleton-chart" />
                    <div className="skeleton skeleton-chart" />
                </div>
                <div className="skeleton skeleton-table" />
            </div>
        );
    }

    const barGradient = (context) => {
        const { ctx, chartArea } = context.chart;
        if (!chartArea) return '#6366f1';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#818cf8');
        return gradient;
    };

    const monthlyChartData = {
        labels: monthlyExpenses.map(m => m.label),
        datasets: [{
            label: 'Expenses',
            data: monthlyExpenses.map(m => m.amount),
            backgroundColor: barGradient,
            hoverBackgroundColor: '#4f46e5',
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 52,
        }]
    };

    const categoryChartData = {
        labels: categoryDistribution.map(c => c.category),
        datasets: [{
            data: categoryDistribution.map(c => c.amount),
            backgroundColor: categoryDistribution.map(c => CATEGORY_COLORS[c.category] || '#64748b'),
            borderWidth: 3,
            borderColor: cssVar('--surface') || '#ffffff',
            hoverOffset: 8,
        }]
    };

    const dailyChartData = {
        labels: dailySpending.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
            label: 'Daily Spending',
            data: dailySpending.map(d => d.amount),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            fill: true,
            tension: 0.45,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    const axisChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                ...tooltipStyle,
                callbacks: {
                    label: (context) => ` ${formatCurrency(context.raw)}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: chartPalette.tick, font: { size: 11 } },
            },
            y: {
                beginAtZero: true,
                grid: { color: chartPalette.grid },
                border: { display: false },
                ticks: {
                    color: chartPalette.tick,
                    font: { size: 11 },
                    maxTicksLimit: 6,
                    callback: (value) => formatCurrency(value)
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: chartPalette.tick,
                    font: { size: 12, weight: '500' },
                }
            },
            tooltip: {
                ...tooltipStyle,
                callbacks: {
                    label: (context) => ` ${context.label}: ${formatCurrency(context.raw)}`
                }
            }
        }
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h1 className="page-heading">Dashboard</h1>
                    <p className="page-subheading">Your financial overview at a glance</p>
                </div>
            </div>

            <div className="dashboard-cards">
                <Card
                    title="Total Income"
                    value={formatCurrency(dashboard?.totalIncome || 0)}
                    type="income"
                    icon={<TrendingUp size={22} />}
                />
                <Card
                    title="Total Expenses"
                    value={formatCurrency(dashboard?.totalExpenses || 0)}
                    type="expense"
                    icon={<TrendingDown size={22} />}
                />
                <Card
                    title="Balance"
                    value={formatCurrency(dashboard?.balance || 0)}
                    type="balance"
                    icon={<Wallet size={22} />}
                />
            </div>

            <div className="dashboard-charts">
                <div className="chart-grid">
                    <ChartCard
                        title="Monthly Expenses"
                        icon={<BarChart3 size={17} />}
                        headerActions={
                            <select
                                value={chartMonths}
                                onChange={(e) => setChartMonths(Number(e.target.value))}
                                className="chart-select"
                                aria-label="Monthly expenses range"
                            >
                                <option value={3}>Last 3 months</option>
                                <option value={6}>Last 6 months</option>
                                <option value={12}>Last 12 months</option>
                            </select>
                        }
                    >
                        <div className="chart-container">
                            <Bar data={monthlyChartData} options={axisChartOptions} />
                        </div>
                    </ChartCard>

                    <ChartCard
                        title="Category Distribution"
                        icon={<ChartPie size={17} />}
                    >
                        <div className="chart-container">
                            <Doughnut data={categoryChartData} options={doughnutOptions} />
                        </div>
                    </ChartCard>
                </div>

                <ChartCard
                    title="Daily Spending"
                    icon={<Activity size={17} />}
                    headerActions={
                        <select
                            value={chartDays}
                            onChange={(e) => setChartDays(Number(e.target.value))}
                            className="chart-select"
                            aria-label="Daily spending range"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    }
                >
                    <div className="chart-container">
                        <Line data={dailyChartData} options={axisChartOptions} />
                    </div>
                </ChartCard>
            </div>

            <div className="dashboard-recent">
                <h2 className="section-heading">Recent Transactions</h2>
                {recentTransactions.length === 0 ? (
                    <EmptyState
                        icon={<ReceiptText size={28} />}
                        title="No transactions yet"
                        description="Add some income or expenses to see your recent activity here."
                    />
                ) : (
                    <div className="table-card">
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th>Type</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((t) => (
                                        <tr key={`${t.type}-${t.id}`}>
                                            <td className="td-date">{formatDate(t.date)}</td>
                                            <td className="td-desc">{t.description}</td>
                                            <td>
                                                {t.category ? (
                                                    <span className={`category-badge cat-${t.category.toLowerCase()}`}>
                                                        {t.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`type-badge type-${t.type}`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className={`text-right amount-${t.type}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

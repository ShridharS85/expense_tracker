import { useState, useEffect } from 'react';
import { Calendar, FileText, Table2, File, Check, FileSearch, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '../utils/formatDate';
import { downloadFile } from '../utils/downloadFile';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import api from '../api/api';
import './Reports.css';

function buildExportBlob(format, reportType, records, startDate, endDate) {
    const fileTitle = `${reportType === 'income' ? 'Income' : 'Expense'} Report`;
    const fileName = `${reportType}_${startDate}_to_${endDate}.${format === 'excel' ? 'xlsx' : format}`;

    if (format === 'csv') {
        const headers = ['Date', 'Description', reportType === 'income' ? 'Amount' : 'Category', 'Amount'];
        const rows = records.map((record) => [
            formatDate(record.date),
            record.description || '',
            reportType === 'income' ? '' : (record.category || ''),
            Number(record.amount ?? 0).toFixed(2)
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        return { blob: new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }), fileName };
    }

    if (format === 'excel') {
        const worksheetRows = records.map((record) => ({
            Date: formatDate(record.date),
            Description: record.description || '',
            ...(reportType !== 'income' ? { Category: record.category || '' } : {}),
            Amount: Number(record.amount ?? 0).toFixed(2)
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetRows, {
            header: ['Date', 'Description', ...(reportType !== 'income' ? ['Category'] : []), 'Amount']
        });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        const workbookBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        return {
            blob: new Blob([workbookBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
            fileName
        };
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(fileTitle, 40, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 40, 72);
    doc.text(`Date range: ${formatDate(startDate)} to ${formatDate(endDate)}`, 40, 86);

    const rows = records.map((record) => [
        formatDate(record.date),
        record.description || '',
        reportType === 'income' ? 'Income' : (record.category || 'Other'),
        formatCurrency(Number(record.amount ?? 0))
    ]);

    autoTable(doc, {
        head: [['Date', 'Description', reportType === 'income' ? 'Type' : 'Category', 'Amount']],
        body: rows,
        startY: 110,
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 40, right: 40 }
    });

    const total = records.reduce((sum, record) => sum + Number(record.amount ?? 0), 0);
    const tableEndY = doc.lastAutoTable.finalY + 18;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total ${reportType === 'income' ? 'Income' : 'Expenses'}: ${formatCurrency(total)}`, 40, tableEndY);

    return { blob: doc.output('blob'), fileName };
}

function Reports() {
    const [reportType, setReportType] = useState('expense');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloaded, setDownloaded] = useState(null);
    const [downloadError, setDownloadError] = useState('');
    const [downloadingFormat, setDownloadingFormat] = useState(null);

    useEffect(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchRecords();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, reportType]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const endpoint = reportType === 'income' ? '/api/reports/income' : '/api/reports/expenses';
            const res = await api.get(endpoint, {
                params: { startDate, endDate }
            });
            setRecords(res.data);
        } catch (err) {
            console.error('Failed to fetch report data', err);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const setQuickDate = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleDownload = async (format) => {
        if (downloadingFormat) return;
        setDownloadError('');
        setDownloadingFormat(format);
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/reports/export/${format}?startDate=${startDate}&endDate=${endDate}&type=${reportType}`;
        const fallbackFilename = `${reportType}_${startDate}_to_${endDate}.${format === 'excel' ? 'xlsx' : format}`;

        try {
            await downloadFile(apiUrl, fallbackFilename);
            setDownloaded(format);
            window.setTimeout(() => setDownloaded(null), 2000);
        } catch (error) {
            try {
                const { blob, fileName } = buildExportBlob(format, reportType, records, startDate, endDate);
                const objectUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = objectUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(objectUrl);
                setDownloaded(format);
                window.setTimeout(() => setDownloaded(null), 2000);
            } catch (fallbackError) {
                console.error('Export fallback failed:', fallbackError);
                setDownloadError('Failed to download file. Please try again.');
            }
        } finally {
            setDownloadingFormat(null);
        }
    };

    const total = records.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
    const isIncome = reportType === 'income';

    const downloadButtons = [
        { format: 'csv', label: 'CSV', hint: 'Spreadsheet-ready', icon: <FileText size={20} />, className: 'btn-dl-csv' },
        { format: 'excel', label: 'Excel', hint: '.xlsx workbook', icon: <Table2 size={20} />, className: 'btn-dl-excel' },
        { format: 'pdf', label: 'PDF', hint: 'Printable report', icon: <File size={20} />, className: 'btn-dl-pdf' },
    ];

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h1 className="page-heading">Reports</h1>
                    <p className="page-subheading">Generate and export your financial reports</p>
                </div>
            </div>

            <div className="reports-grid">
                <div className="reports-controls surface-card">
                    <div className="reports-controls-title">
                        <Calendar size={17} />
                        Report parameters
                    </div>

                    <div className="segmented-control" role="group" aria-label="Report type">
                        <button
                            className={`segmented-btn ${reportType === 'expense' ? 'segmented-btn-active' : ''}`}
                            onClick={() => setReportType('expense')}
                        >
                            Expenses
                        </button>
                        <button
                            className={`segmented-btn ${reportType === 'income' ? 'segmented-btn-active' : ''}`}
                            onClick={() => setReportType('income')}
                        >
                            Income
                        </button>
                    </div>

                    <div className="quick-dates">
                        <button onClick={() => setQuickDate(7)} className="btn-quick">Last 7 days</button>
                        <button onClick={() => setQuickDate(30)} className="btn-quick">Last 30 days</button>
                        <button onClick={() => setQuickDate(90)} className="btn-quick">Last 90 days</button>
                        <button onClick={() => setQuickDate(365)} className="btn-quick">Last year</button>
                    </div>

                    <div className="date-inputs">
                        <div className="date-input-group">
                            <label htmlFor="report-start">From</label>
                            <input
                                id="report-start"
                                type="date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="report-end">To</label>
                            <input
                                id="report-end"
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="download-section surface-card">
                    <div className="reports-controls-title">
                        <Download size={17} />
                        Export report
                    </div>
                    {downloadError && <div className="alert alert-error" role="alert">{downloadError}</div>}
                    <div className="download-buttons">
                        {downloadButtons.map((btn) => (
                            <button
                                key={btn.format}
                                onClick={() => handleDownload(btn.format)}
                                className={`btn-download ${btn.className}`}
                                disabled={downloadingFormat !== null || records.length === 0}
                            >
                                <span className="btn-download-icon">{btn.icon}</span>
                                <span className="btn-download-text">
                                    <span className="btn-download-label">{btn.label}</span>
                                    <span className="btn-download-hint">{btn.hint}</span>
                                </span>
                                {downloadingFormat === btn.format ? (
                                    <Loader2 size={16} className="spin" />
                                ) : downloaded === btn.format ? (
                                    <Check size={16} className="check-icon" />
                                ) : null}
                            </button>
                        ))}
                    </div>
                    <p className="download-note">
                        {records.length} record{records.length !== 1 ? 's' : ''} in the selected range
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="page-loading">
                    <Spinner label="Loading report..." />
                </div>
            ) : (
                <div className="reports-content">
                    <div className="reports-summary">
                        <div className="summary-card">
                            <span className="summary-icon"><FileText size={20} /></span>
                            <div className="summary-meta">
                                <span className="summary-label">Total Records</span>
                                <span className="summary-value">{records.length}</span>
                            </div>
                        </div>
                        <div className={`summary-card summary-highlight ${isIncome ? 'summary-income' : 'summary-expense'}`}>
                            <span className="summary-icon"><File size={20} /></span>
                            <div className="summary-meta">
                                <span className="summary-label">
                                    Total {isIncome ? 'Income' : 'Expenses'}
                                </span>
                                <span className="summary-value">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {records.length === 0 ? (
                        <EmptyState
                            icon={<FileSearch size={28} />}
                            title="No records found"
                            description={`No ${isIncome ? 'income' : 'expenses'} found for the selected date range. Try widening the range.`}
                        />
                    ) : (
                        <div className="table-card">
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            {!isIncome && <th>Category</th>}
                                            <th className="text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((r) => (
                                            <tr key={r.id}>
                                                <td className="td-date">{formatDate(r.date)}</td>
                                                <td className="td-desc">{r.description}</td>
                                                {!isIncome && (
                                                    <td>
                                                        <span className={`category-badge cat-${(r.category || 'other').toLowerCase()}`}>
                                                            {r.category}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className={`text-right ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                                                    {formatCurrency(r.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Reports;

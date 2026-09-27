import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

/* Reusable confirmation modal. Replaces window.confirm with a nicer UX
   while preserving the same confirm/cancel flow in the callers. */
function ConfirmDialog({
    open,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    busy = false,
    danger = true,
    onConfirm,
    onCancel
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel} role="presentation">
            <div
                className="confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="confirm-close" onClick={onCancel} aria-label="Close dialog">
                    <X size={18} />
                </button>
                <div className={`confirm-icon ${danger ? 'confirm-icon-danger' : ''}`}>
                    <AlertTriangle size={26} />
                </div>
                <h2 id="confirm-dialog-title" className="confirm-title">{title}</h2>
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                        disabled={busy}
                    >
                        {busy ? 'Working...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;

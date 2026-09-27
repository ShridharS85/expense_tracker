import { useState } from 'react';
import { Settings as SettingsIcon, Palette, LayoutDashboard, Bell, CheckCircle2, Moon, Sun } from 'lucide-react';
import { setTheme, getTheme } from '../utils/theme';
import './Settings.css';

const defaultSettings = {
    currency: 'USD',
    theme: getTheme(),
    compactMode: false,
    emailAlerts: true,
    defaultReport: 'expense',
};

function Settings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [saved, setSaved] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const nextValue = type === 'checkbox' ? checked : value;
        setSettings((prev) => ({
            ...prev,
            [name]: nextValue,
        }));

        /* Apply the theme immediately so the preview is live */
        if (name === 'theme') {
            setTheme(nextValue);
        }
    };

    const handleSave = (event) => {
        event.preventDefault();
        setTheme(settings.theme);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1 className="page-heading">Settings</h1>
                    <p className="page-subheading">Customize your experience</p>
                </div>
            </div>

            <form className="settings-card" onSubmit={handleSave}>
                <div className="settings-section">
                    <div className="settings-section-title">
                        <span className="settings-section-icon"><Palette size={17} /></span>
                        Preferences
                    </div>
                    <div className="settings-grid">
                        <div className="form-group">
                            <label htmlFor="settings-currency">Currency</label>
                            <select
                                id="settings-currency"
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="settings-theme">Theme</label>
                            <div className="theme-picker" role="group" aria-label="Theme">
                                <button
                                    type="button"
                                    className={`theme-option ${settings.theme === 'light' ? 'theme-option-active' : ''}`}
                                    onClick={() => handleChange({ target: { name: 'theme', value: 'light', type: 'select-one' } })}
                                >
                                    <Sun size={16} /> Light
                                </button>
                                <button
                                    type="button"
                                    className={`theme-option ${settings.theme === 'dark' ? 'theme-option-active' : ''}`}
                                    onClick={() => handleChange({ target: { name: 'theme', value: 'dark', type: 'select-one' } })}
                                >
                                    <Moon size={16} /> Dark
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <div className="settings-section-title">
                        <span className="settings-section-icon"><LayoutDashboard size={17} /></span>
                        Dashboard
                    </div>

                    <label className="toggle-row">
                        <div className="toggle-text">
                            <strong>Compact mode</strong>
                            <small>Use denser cards and tighter spacing.</small>
                        </div>
                        <span className="switch">
                            <input
                                type="checkbox"
                                name="compactMode"
                                checked={settings.compactMode}
                                onChange={handleChange}
                                aria-label="Compact mode"
                            />
                            <span className="switch-track" aria-hidden="true">
                                <span className="switch-thumb" />
                            </span>
                        </span>
                    </label>

                    <label className="toggle-row">
                        <div className="toggle-text">
                            <strong>
                                <Bell size={15} className="inline-icon" />
                                Enable email alerts
                            </strong>
                            <small>Get notifications for budget thresholds.</small>
                        </div>
                        <span className="switch">
                            <input
                                type="checkbox"
                                name="emailAlerts"
                                checked={settings.emailAlerts}
                                onChange={handleChange}
                                aria-label="Enable email alerts"
                            />
                            <span className="switch-track" aria-hidden="true">
                                <span className="switch-thumb" />
                            </span>
                        </span>
                    </label>

                    <div className="form-group settings-default-report">
                        <label htmlFor="settings-default-report">Default report type</label>
                        <select
                            id="settings-default-report"
                            name="defaultReport"
                            value={settings.defaultReport}
                            onChange={handleChange}
                        >
                            <option value="expense">Expense report</option>
                            <option value="income">Income report</option>
                        </select>
                    </div>
                </div>

                <div className="settings-actions">
                    <button type="submit" className="btn btn-primary">
                        <SettingsIcon size={16} /> Save changes
                    </button>
                    {saved && (
                        <span className="settings-success" role="status">
                            <CheckCircle2 size={16} /> Settings saved
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Settings;

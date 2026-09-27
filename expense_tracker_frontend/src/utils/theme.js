/* Theme helpers — single source of truth for light/dark mode.
   Settings writes through setTheme(); main.jsx initialises it on boot;
   useTheme() lets components react to runtime theme changes. */

const STORAGE_KEY = 'expense-tracker-theme';
const EVENT_NAME = 'expense-tracker-theme-change';

export function getTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
        /* storage unavailable */
    }
    return 'light';
}

export function setTheme(theme) {
    const value = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = value;
    try {
        localStorage.setItem(STORAGE_KEY, value);
    } catch {
        /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
}

export function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* React hook that re-renders when the theme changes (for charts etc.) */
import { useSyncExternalStore } from 'react';

function subscribe(callback) {
    window.addEventListener(EVENT_NAME, callback);
    return () => window.removeEventListener(EVENT_NAME, callback);
}

function getSnapshot() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

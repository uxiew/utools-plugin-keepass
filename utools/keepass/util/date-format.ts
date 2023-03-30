import { StringFormat } from './string-format';

const SettingsManager = {
    activeLocale: 'cn'
}
const DateFormat = {
    months() {
        const format = new Intl.DateTimeFormat(SettingsManager.activeLocale, { month: 'long' });
        const months = [];
        for (let month = 0; month < 12; month++) {
            months.push(format.format(new Date(2008, month)));
        }
        return months;
    },

    weekDays() {
        const format = new Intl.DateTimeFormat(SettingsManager.activeLocale, { weekday: 'long' });
        const weekdays = [];
        for (let day = 1; day < 8; day++) {
            weekdays.push(format.format(new Date(2007, 9, 6 + day)));
        }
        return weekdays;
    },

    shortWeekDays() {
        const format = new Intl.DateTimeFormat(SettingsManager.activeLocale, { weekday: 'short' });
        const weekdays = [];
        for (let day = 1; day < 8; day++) {
            weekdays.push(format.format(new Date(2007, 9, 6 + day)));
        }
        return weekdays;
    },


    dtStr(dt?: number | Date): string {
        if (typeof dt === 'number') {
            dt = new Date(dt);
        }
        return dt
            ? new Intl.DateTimeFormat(SettingsManager.activeLocale, {
                dateStyle: 'medium',
                timeStyle: 'medium'
            }).format(dt)
            : '';
    },

    dStr(dt: number | Date) {
        if (typeof dt === 'number') {
            dt = new Date(dt);
        }
        return dt
            ? new Intl.DateTimeFormat(SettingsManager.activeLocale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(dt)
            : '';
    },

    dtStrFs(dt: number | Date) {
        if (typeof dt === 'number') {
            dt = new Date(dt);
        }
        return dt
            ? dt.getFullYear() +
            '-' +
            StringFormat.pad(dt.getMonth() + 1, 2) +
            '-' +
            StringFormat.pad(dt.getDate(), 2) +
            'T' +
            StringFormat.pad(dt.getHours(), 2) +
            '-' +
            StringFormat.pad(dt.getMinutes(), 2) +
            '-' +
            StringFormat.pad(dt.getSeconds(), 2)
            : '';
    }
};

export { DateFormat };
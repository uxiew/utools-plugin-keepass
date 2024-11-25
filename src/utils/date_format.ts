import { StringFormat } from './string_format';

const activeLocale = `zh-Hans-CN`

const DateFormat = {
  months() {
    const format = new Intl.DateTimeFormat(activeLocale, { month: 'long' });
    const months = [];
    for (let month = 0; month < 12; month++) {
      months.push(format.format(new Date(2008, month)));
    }
    return months;
  },

  weekDays() {
    const format = new Intl.DateTimeFormat(activeLocale, { weekday: 'long' });
    const weekdays = [];
    for (let day = 1; day < 8; day++) {
      weekdays.push(format.format(new Date(2007, 9, 6 + day)));
    }
    return weekdays;
  },

  shortWeekDays() {
    const format = new Intl.DateTimeFormat(activeLocale, { weekday: 'short' });
    const weekdays = [];
    for (let day = 1; day < 8; day++) {
      weekdays.push(format.format(new Date(2007, 9, 6 + day)));
    }
    return weekdays;
  },

  dtStr(dt: Date) {
    if (typeof dt === 'number') {
      dt = new Date(dt);
    }
    return dt
      ? new Intl.DateTimeFormat(activeLocale, {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }).format(dt)
      : '';
  },

  dStr(dt: Date) {
    if (typeof dt === 'number') {
      dt = new Date(dt);
    }
    return dt
      ? new Intl.DateTimeFormat(activeLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dt)
      : '';
  },

  dtStrFs(dt: Date) {
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

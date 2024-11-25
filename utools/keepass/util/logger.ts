enum Level {
  Off,
  Error,
  Warn,
  Info,
  Debug,
  All
};

const MaxLogsToSave: number = 100;
const lastLogs: { level: string, args: string[] }[] = [];

export class Logger {

  static saveLast(level: string, args: any[]) {
    lastLogs.push({ level, args: Array.prototype.slice.call(args) });
    if (lastLogs.length > MaxLogsToSave) {
      lastLogs.shift();
    }
  };

  static getLast() {
    return lastLogs;
  };

  static level: typeof Level = Level
  level: Level = 0
  prefix: string = '';

  constructor(name: string, id?: string, level = Level.All) {
    this.prefix = name ? name + (id ? ':' + id : '') : 'default';
    this.level = level;
  }

  ts(): number;
  ts(ts: number): string;
  ts(ts?: number): number | string {
    if (ts) {
      return Math.round(performance.now() - ts) + 'ms';
    } else {
      return performance.now();
    }
  };

  getPrefix() {
    return new Date().toISOString() + ' [' + this.prefix + '] ';
  };

  debug(...args: any[]) {
    args[0] = this.getPrefix() + args[0];
    if (this.level >= Level.Debug) {
      Logger.saveLast('debug', args);
      console.log(...args);
    }
  };

  info(...args: any[]) {
    args[0] = this.getPrefix() + args[0];
    if (this.level >= Level.Info) {
      Logger.saveLast('info', args);
      console.info(...args);
    }
  };



  warn(...args: any[]) {
    args[0] = this.getPrefix() + args[0];
    if (this.level >= Level.Warn) {
      Logger.saveLast('warn', args);
      console.warn(...args);
    }
  };

  error(...args: any[]) {
    args[0] = this.getPrefix() + args[0];
    if (this.level >= Level.Error) {
      Logger.saveLast('error', args);
      console.error(...args);
    }
  };


  setLevel(level: Level) {
    this.level = level;
  };

  getLevel() {
    return this.level;
  };

}

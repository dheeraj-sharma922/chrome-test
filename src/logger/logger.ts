export interface Logger
{
  error(...args: any[]): void;

  warn(...args: any[]): void;

  log(...args: any[]): void;

  info(...args: any[]): void;

  debug(...args: any[]): void;
}

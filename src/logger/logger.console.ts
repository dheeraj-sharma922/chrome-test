import { Logger } from './logger'

export class LoggerConsole implements Logger {
  debug(...args: any[]): void {
    console.debug(...args)
  }

  error(...args: any[]): void {
    console.error(...args)
  }

  info(...args: any[]): void {
    console.info(...args)
  }

  log(...args: any[]): void {
    console.log(...args)
  }

  warn(...args: any[]): void {
    console.warn(...args)
  }
}

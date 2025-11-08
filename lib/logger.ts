/**
 * Production-safe logger utility
 * Replaces console.log with environment-aware logging
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix: string
}

class Logger {
  private config: LoggerConfig

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: process.env.NODE_ENV === "development",
      level: "info",
      prefix: "[v0]",
      ...config,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false

    const levels: LogLevel[] = ["debug", "info", "warn", "error"]
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const emoji = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    }[level]

    return `${emoji} ${this.config.prefix} [${level.toUpperCase()}] ${timestamp} - ${message}`
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog("debug")) {
      console.log(this.formatMessage("debug", message), ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("info", message), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message), ...args)
    }
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message), error, ...args)

      // TODO: Send to error tracking service (Sentry)
      // if (typeof window !== 'undefined' && window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     extra: { message, args },
      //   })
      // }
    }
  }

  // Performance logging
  time(label: string): void {
    if (this.config.enabled) {
      console.time(`${this.config.prefix} ${label}`)
    }
  }

  timeEnd(label: string): void {
    if (this.config.enabled) {
      console.timeEnd(`${this.config.prefix} ${label}`)
    }
  }

  // Group logging
  group(label: string): void {
    if (this.config.enabled) {
      console.group(`${this.config.prefix} ${label}`)
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd()
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export factory for custom loggers
export const createLogger = (config?: Partial<LoggerConfig>) => new Logger(config)

// Export types
export type { LogLevel, LoggerConfig }

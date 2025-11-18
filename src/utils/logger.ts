/**
 * Расширенная система логирования для всех операций
 * Поддерживает разные уровни логирования и форматирование
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Максимум логов в памяти
  private isDevelopment = import.meta.env.DEV;

  /**
   * Логирование с уровнем DEBUG
   */
  debug(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, module, message, data);
  }

  /**
   * Логирование с уровнем INFO
   */
  info(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, module, message, data);
  }

  /**
   * Логирование с уровнем WARN
   */
  warn(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, module, message, data);
  }

  /**
   * Логирование с уровнем ERROR
   */
  error(module: string, message: string, error?: Error, data?: unknown): void {
    this.log(LogLevel.ERROR, module, message, data, error);
  }

  /**
   * Логирование успешных операций
   */
  success(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.SUCCESS, module, message, data);
  }

  /**
   * Основной метод логирования
   */
  private log(
    level: LogLevel,
    module: string,
    message: string,
    data?: unknown,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      error
    };

    // Сохраняем в память
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Удаляем старые логи
    }

    // Выводим в консоль
    if (this.isDevelopment || level === LogLevel.ERROR || level === LogLevel.WARN) {
      const style = this.getStyle(level);
      const prefix = `[${entry.timestamp}] [${level}] [${module}]`;
      
      if (error) {
        console.error(`%c${prefix} ${message}`, style, error, data || '');
      } else if (data) {
        console.log(`%c${prefix} ${message}`, style, data);
      } else {
        console.log(`%c${prefix} ${message}`, style);
      }
    }
  }

  /**
   * Получить стиль для консоли
   */
  private getStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: #888; font-weight: normal',
      [LogLevel.INFO]: 'color: #2196F3; font-weight: normal',
      [LogLevel.WARN]: 'color: #FF9800; font-weight: bold',
      [LogLevel.ERROR]: 'color: #F44336; font-weight: bold',
      [LogLevel.SUCCESS]: 'color: #4CAF50; font-weight: bold'
    };
    return styles[level] || '';
  }

  /**
   * Получить все логи
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Получить логи по модулю
   */
  getLogsByModule(module: string): LogEntry[] {
    return this.logs.filter(log => log.module === module);
  }

  /**
   * Получить логи по уровню
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Очистить логи
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Экспорт логов в JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Создаем единственный экземпляр логгера
export const logger = new Logger();

// Экспортируем удобные функции для использования
export const logDebug = (module: string, message: string, data?: unknown) => 
  logger.debug(module, message, data);

export const logInfo = (module: string, message: string, data?: unknown) => 
  logger.info(module, message, data);

export const logWarn = (module: string, message: string, data?: unknown) => 
  logger.warn(module, message, data);

export const logError = (module: string, message: string, error?: Error, data?: unknown) => 
  logger.error(module, message, error, data);

export const logSuccess = (module: string, message: string, data?: unknown) => 
  logger.success(module, message, data);

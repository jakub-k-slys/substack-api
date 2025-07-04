/**
 * Common service infrastructure types and interfaces
 */

import type { SubstackHttpClient } from '../http-client'

/**
 * Configuration for service dependencies
 */
export interface ServiceConfig {
  httpClient: SubstackHttpClient
  cache?: Cache
  logger?: Logger
}

/**
 * Basic cache interface for services
 */
export interface Cache {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
}

/**
 * Basic logger interface for services  
 */
export interface Logger {
  debug(message: string, meta?: object): void
  info(message: string, meta?: object): void
  warn(message: string, meta?: object): void
  error(message: string, meta?: object): void
}

/**
 * Slug resolution function type
 */
export type SlugResolver = (userId: number, fallbackHandle?: string) => Promise<string | undefined>
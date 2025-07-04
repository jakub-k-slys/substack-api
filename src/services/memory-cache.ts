/**
 * Simple in-memory cache implementation for services
 */

import type { Cache } from './types'

export class MemoryCache implements Cache {
  private store = new Map<string, { value: unknown; expires: number }>()

  async get<T>(key: string): Promise<T | undefined> {
    const item = this.store.get(key)
    if (!item) {
      return undefined
    }

    if (Date.now() > item.expires) {
      this.store.delete(key)
      return undefined
    }

    return item.value as T
  }

  async set<T>(key: string, value: T, ttl = 300000): Promise<void> {
    // 5 minutes default TTL
    if (ttl <= 0) {
      // Don't store items with zero or negative TTL
      return
    }

    this.store.set(key, {
      value,
      expires: Date.now() + ttl
    })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  /**
   * Clear all cached items
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get the number of cached items
   */
  size(): number {
    return this.store.size
  }
}

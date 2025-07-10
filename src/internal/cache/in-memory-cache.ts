import type { Cache } from './cache'

/**
 * Simple in-memory cache implementation using Map
 */
export class InMemoryCache<K, V> implements Cache<K, V> {
  private readonly storage = new Map<K, V>()

  has(key: K): boolean {
    return this.storage.has(key)
  }

  get(key: K): V | undefined {
    return this.storage.get(key)
  }

  set(key: K, value: V): void {
    this.storage.set(key, value)
  }

  clear(): void {
    this.storage.clear()
  }

  size(): number {
    return this.storage.size
  }
}

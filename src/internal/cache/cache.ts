/**
 * Generic cache interface for storing key-value pairs
 */
export interface Cache<K, V> {
  /**
   * Check if the cache contains a key
   * @param key - The key to check
   * @returns true if the key exists in the cache
   */
  has(key: K): boolean

  /**
   * Get a value from the cache
   * @param key - The key to get
   * @returns The value if found, undefined otherwise
   */
  get(key: K): V | undefined

  /**
   * Set a value in the cache
   * @param key - The key to set
   * @param value - The value to store
   */
  set(key: K, value: V): void

  /**
   * Clear all entries from the cache
   */
  clear(): void

  /**
   * Get the number of entries in the cache
   * @returns The size of the cache
   */
  size(): number
}

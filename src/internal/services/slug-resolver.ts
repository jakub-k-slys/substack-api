/**
 * Interface for slug resolution services
 */
export interface SlugResolver {
  /**
   * Get slug for a user ID, with fallback to handle from profile data
   * @param userId - The user ID to resolve slug for
   * @param fallbackHandle - Optional fallback handle to use if slug not found
   * @returns Promise<string | undefined> - Resolved slug or undefined if not found
   */
  getSlugForUserId(userId: number, fallbackHandle?: string): Promise<string | undefined>
}

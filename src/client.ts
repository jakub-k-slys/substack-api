import {
  SubstackPublication,
  SubstackPost,
  SubstackComment,
  SubstackConfig,
  SubstackSearchResult,
  PaginationParams,
  SearchParams
} from './types';

export class SubstackError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: Response
  ) {
    super(message);
    this.name = 'SubstackError';
  }
}

export class Substack {
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor(config: SubstackConfig = {}) {
    this.baseUrl = `https://${config.hostname || 'substack.com'}`;
    this.apiVersion = config.apiVersion || 'v1';
  }

  private buildUrl<T extends Record<string, any>>(path: string, params?: T): string {
    const url = `${this.baseUrl}/api/${this.apiVersion}${path}`;
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new SubstackError(
        `Request failed: ${response.statusText}`,
        response.status,
        response
      );
    }

    return response.json();
  }

  /**
   * Get publication details
   * @param hostname Optional hostname override
   */
  async getPublication(hostname?: string): Promise<SubstackPublication> {
    const url = hostname ? `https://${hostname}` : this.baseUrl;
    const response = await fetch(`${url}/api/${this.apiVersion}/publication`);
    
    if (!response.ok) {
      throw new SubstackError(
        `Failed to fetch publication: ${response.statusText}`,
        response.status,
        response
      );
    }

    return response.json();
  }

  /**
   * Get posts for the publication
   * @param params Pagination parameters
   */
  async getPosts(params: PaginationParams = {}): Promise<SubstackPost[]> {
    const url = this.buildUrl('/posts', params);
    return this.request<SubstackPost[]>(url);
  }

  /**
   * Get a specific post by its slug
   * @param slug The post's slug
   */
  async getPost(slug: string): Promise<SubstackPost> {
    const url = this.buildUrl(`/posts/${slug}`);
    return this.request<SubstackPost>(url);
  }

  /**
   * Search posts in the publication
   * @param params Search parameters
   */
  async searchPosts(params: SearchParams): Promise<SubstackSearchResult> {
    const url = this.buildUrl('/search', params);
    return this.request<SubstackSearchResult>(url);
  }

  /**
   * Get comments for a specific post
   * @param postId The post ID
   * @param params Pagination parameters
   */
  async getComments(postId: number, params: PaginationParams = {}): Promise<SubstackComment[]> {
    const url = this.buildUrl(`/posts/${postId}/comments`, params);
    return this.request<SubstackComment[]>(url);
  }

  /**
   * Get a specific comment by its ID
   * @param commentId The comment ID
   */
  async getComment(commentId: number): Promise<SubstackComment> {
    const url = this.buildUrl(`/comments/${commentId}`);
    return this.request<SubstackComment>(url);
  }
}

export * from './types';

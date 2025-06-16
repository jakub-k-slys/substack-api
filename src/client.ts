export interface SubstackPublication {
  name: string;
  hostname: string;
  subdomain: string;
}

export interface SubstackClientConfig {
  hostname?: string;
}

export class SubstackClient {
  private readonly baseUrl: string;

  constructor(config: SubstackClientConfig = {}) {
    this.baseUrl = `https://${config.hostname || 'substack.com'}`;
  }

  /**
   * Get publication details
   * @param hostname The hostname of the publication (e.g., 'example.substack.com')
   * @returns Promise<SubstackPublication>
   */
  async getPublication(hostname: string): Promise<SubstackPublication> {
    const response = await fetch(`https://${hostname}/api/v1/publication`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch publication: ${response.statusText}`);
    }

    return response.json();
  }
}

import { SubstackClient, SubstackPublication } from './client';

describe('SubstackClient', () => {
  let globalFetch: typeof global.fetch;

  beforeAll(() => {
    globalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = globalFetch;
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  describe('constructor', () => {
    it('should use default hostname when no config provided', () => {
      const client = new SubstackClient();
      expect((client as any).baseUrl).toBe('https://substack.com');
    });

    it('should use custom hostname when provided', () => {
      const client = new SubstackClient({ hostname: 'example.substack.com' });
      expect((client as any).baseUrl).toBe('https://example.substack.com');
    });
  });

  describe('getPublication', () => {
    const mockPublication: SubstackPublication = {
      name: 'Test Publication',
      hostname: 'test.substack.com',
      subdomain: 'test'
    };

    it('should fetch publication details successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPublication)
      });

      const client = new SubstackClient();
      const result = await client.getPublication('test.substack.com');

      expect(result).toEqual(mockPublication);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.substack.com/api/v1/publication'
      );
    });

    it('should throw error when fetch fails', async () => {
      const errorMessage = 'Not Found';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: errorMessage
      });

      const client = new SubstackClient();
      await expect(client.getPublication('test.substack.com'))
        .rejects
        .toThrow(`Failed to fetch publication: ${errorMessage}`);
    });
  });
});

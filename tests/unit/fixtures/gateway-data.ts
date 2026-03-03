export const makeGatewayProfile = (id: number, handle: string, name: string) => ({
  id,
  handle,
  name,
  url: `https://substack.com/@${handle}`,
  avatar_url: `https://example.com/${handle}.jpg`,
  bio: `Bio for ${name}`
})

export const makeGatewayNote = (id: number, body: string, likesCount = 0) => ({
  id,
  body,
  likes_count: likesCount,
  author: {
    id: 123,
    name: 'Test User',
    handle: 'testuser',
    avatar_url: 'https://example.com/photo.jpg'
  },
  published_at: '2023-01-01T00:00:00Z'
})

export const makeGatewayPost = (id: number, title: string) => ({
  id,
  title,
  subtitle: 'Test subtitle',
  truncated_body: 'Truncated...',
  published_at: '2023-01-01T00:00:00Z'
})

export const makeGatewayFullPost = (id: number, title: string) => ({
  id,
  title,
  slug: `post-${id}`,
  subtitle: 'Test subtitle',
  url: `https://example.com/post-${id}`,
  published_at: '2023-01-01T00:00:00Z',
  html_body: '<p>Full HTML content with <strong>formatting</strong></p>',
  truncated_body: 'Truncated content',
  reactions: { '❤️': 5 },
  restacks: 2,
  tags: ['tag1'],
  cover_image: 'https://example.com/cover.jpg'
})

export const makeGatewayComment = (id: number, body: string, isAdmin = false) => ({
  id,
  body,
  is_admin: isAdmin
})

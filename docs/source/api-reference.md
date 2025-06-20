# API Reference

This section provides comprehensive documentation for all classes, methods, and types available in the Substack API client, including detailed descriptions and practical code examples.

## Substack Class

The main class for interacting with the Substack API. This client provides access to publications, posts, comments, notes, and user profiles.

### Constructor

```typescript
new Substack(config: SubstackConfig)
```

Creates a new Substack API client instance. The client requires an API key for authentication.

**Parameters:**
- `config`: Configuration object (required)
  - `hostname` (optional): The publication's hostname (e.g., 'example.substack.com', default: 'substack.com')
  - `apiVersion` (optional): API version to use (default: 'v1')
  - `apiKey`: Your Substack API key (required)

**Example:**
```typescript
import { Substack } from 'substack-api';

const client = new Substack({
  hostname: 'example.substack.com',
  apiKey: 'your-api-key-here'
});
```

## Post Methods

### getPosts

```typescript
getPosts(params?: PaginationParams): Promise<SubstackPost[]>
```

Retrieves a list of posts from the publication, with support for pagination to fetch large datasets efficiently.

**Parameters:**
- `params` (optional): Pagination parameters
  - `offset`: Number of items to skip (for pagination)
  - `limit`: Maximum number of items to return
  - `cursor`: Cursor for cursor-based pagination

**Returns:**
- Promise resolving to an array of `SubstackPost` objects

**Example:**
```typescript
// Get the latest 10 posts
const recentPosts = await client.getPosts({ limit: 10 });
console.log(`Found ${recentPosts.length} posts`);

// Paginate through posts
const firstPage = await client.getPosts({ limit: 5, offset: 0 });
const secondPage = await client.getPosts({ limit: 5, offset: 5 });

// Display post titles
recentPosts.forEach(post => {
  console.log(`${post.title} (${post.type})`);
  console.log(`Published: ${new Date(post.post_date).toLocaleDateString()}`);
});
```

### getPost

```typescript
getPost(slug: string): Promise<SubstackPost>
```

Retrieves detailed information about a specific post using its URL slug.

**Parameters:**
- `slug`: The post's URL slug (the part after the publication URL)

**Returns:**
- Promise resolving to a `SubstackPost` object with full post details

**Example:**
```typescript
// Get a specific post by its slug
const post = await client.getPost('my-awesome-post');
console.log(`Title: ${post.title}`);
console.log(`Subtitle: ${post.subtitle}`);
console.log(`Published: ${new Date(post.post_date).toLocaleDateString()}`);
console.log(`Paywalled: ${post.paywalled ? 'Yes' : 'No'}`);

if (post.cover_image) {
  console.log(`Cover image: ${post.cover_image}`);
}
```

### searchPosts

```typescript
searchPosts(params: SearchParams): Promise<SubstackSearchResult>
```

Searches for posts within the publication using various filters and criteria.

**Parameters:**
- `params`: Search parameters
  - `query`: Search query string (searches title, subtitle, and content)
  - `type` (optional): Filter by post type ('newsletter' | 'podcast' | 'thread')
  - `published_before` (optional): ISO date string to find posts published before this date
  - `published_after` (optional): ISO date string to find posts published after this date
  - `offset` (optional): Number of items to skip
  - `limit` (optional): Maximum number of items to return

**Returns:**
- Promise resolving to a `SubstackSearchResult` object containing total count and results

**Example:**
```typescript
// Search for posts about TypeScript
const results = await client.searchPosts({
  query: 'TypeScript',
  limit: 10
});

console.log(`Found ${results.total} posts matching "TypeScript"`);
results.results.forEach(post => {
  console.log(`- ${post.title} (${post.post_date})`);
});

// Search for newsletters published in the last month
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

const recentNewsletters = await client.searchPosts({
  query: '',
  type: 'newsletter',
  published_after: oneMonthAgo.toISOString(),
  limit: 20
});
```

## Comment Methods

### getComments

```typescript
getComments(postId: number, params?: PaginationParams): Promise<SubstackComment[]>
```

Retrieves comments for a specific post, with pagination support for posts with many comments.

**Parameters:**
- `postId`: The numeric ID of the post
- `params` (optional): Pagination parameters
  - `offset`: Number of items to skip
  - `limit`: Maximum number of items to return

**Returns:**
- Promise resolving to an array of `SubstackComment` objects

**Example:**
```typescript
// Get comments for a post
const comments = await client.getComments(12345, { limit: 50 });
console.log(`Found ${comments.length} comments`);

comments.forEach(comment => {
  console.log(`${comment.author.name}: ${comment.body.substring(0, 100)}...`);
  console.log(`Posted: ${new Date(comment.created_at).toLocaleDateString()}`);
  if (comment.author.is_admin) {
    console.log('⭐ Admin comment');
  }
});
```

### getComment

```typescript
getComment(commentId: number): Promise<SubstackComment>
```

Retrieves a specific comment by its unique ID.

**Parameters:**
- `commentId`: The numeric ID of the comment

**Returns:**
- Promise resolving to a `SubstackComment` object

**Example:**
```typescript
// Get a specific comment
const comment = await client.getComment(67890);
console.log(`Comment by ${comment.author.name}:`);
console.log(comment.body);
console.log(`Posted on: ${new Date(comment.created_at).toLocaleDateString()}`);
```

## Notes Methods

Notes are short-form posts that appear on users' feeds, similar to social media posts.

### getNotes

```typescript
getNotes(params?: PaginationParams): Promise<SubstackNotes>
```

Retrieves notes from the authenticated user's feed with cursor-based pagination.

**Parameters:**
- `params` (optional): Pagination parameters
  - `cursor`: Cursor for pagination (use the nextCursor from previous response)
  - `limit`: Maximum number of items to return

**Returns:**
- Promise resolving to a `SubstackNotes` object with pagination support

**Example:**
```typescript
// Get recent notes
const notes = await client.getNotes({ limit: 10 });
console.log(`Found ${notes.items.length} notes`);

notes.items.forEach(note => {
  if (note.comment) {
    console.log(`${note.context.users[0].name}: ${note.comment.body}`);
    console.log(`Posted: ${new Date(note.comment.date).toLocaleDateString()}`);
  }
});

// Paginate through all notes
let currentNotes = notes;
while (currentNotes.hasMore()) {
  console.log('Loading more notes...');
  currentNotes = await currentNotes.next();
  if (currentNotes) {
    console.log(`Loaded ${currentNotes.items.length} more notes`);
  }
}
```

### publishNote

```typescript
publishNote(text: string): Promise<PublishNoteResponse>
```

Publishes a simple text note to your Substack feed.

**Parameters:**
- `text`: The text content of the note

**Returns:**
- Promise resolving to a `PublishNoteResponse` with the published note details

**Example:**
```typescript
// Publish a simple note
const response = await client.publishNote('Just discovered this amazing TypeScript feature! 🚀');
console.log(`Note published with ID: ${response.id}`);
console.log(`Published at: ${new Date(response.date).toLocaleString()}`);
```

### note

```typescript
note(text?: string): NoteBuilder
```

Creates a `NoteBuilder` instance for building formatted notes with rich text features.

**Parameters:**
- `text` (optional): Initial text for the first paragraph

**Returns:**
- A `NoteBuilder` instance for fluent note composition

**Example:**
```typescript
// Build a formatted note
const response = await client
  .note('This is the first paragraph.')
  .addParagraph('This is a ')
  .addBold('bold')
  .addText(' word and this is ')
  .addItalic('italic')
  .addText('.')
  .publish();

console.log(`Formatted note published: ${response.id}`);
```

## User Profile Methods

### getUserProfile

```typescript
getUserProfile(userId: number): Promise<SubstackUserProfile>
```

Retrieves detailed profile information for a user including their activity feed.

**Parameters:**
- `userId`: The numeric ID of the user

**Returns:**
- Promise resolving to a `SubstackUserProfile` object with detailed user information

**Example:**
```typescript
const profile = await client.getUserProfile(12345);
console.log(`User has ${profile.items.length} feed items`);

// Display user's recent activity
profile.items.forEach(item => {
  const user = item.context.users[0];
  console.log(`${user.name} (${user.handle})`);
  if (user.bio) {
    console.log(`Bio: ${user.bio}`);
  }
});
```

### getPublicProfile

```typescript
getPublicProfile(slug: string): Promise<SubstackPublicProfile>
```

Retrieves the public profile information for a user by their handle/slug.

**Parameters:**
- `slug`: The user's handle/slug (without the @ symbol)

**Returns:**
- Promise resolving to a `SubstackPublicProfile` object

**Example:**
```typescript
const publicProfile = await client.getPublicProfile('john-doe');
console.log(`Name: ${publicProfile.name}`);
console.log(`Handle: @${publicProfile.handle}`);
console.log(`Subscribers: ${publicProfile.subscriberCountString}`);
console.log(`Bio: ${publicProfile.bio}`);

// List user's publications
publicProfile.publicationUsers.forEach(pubUser => {
  console.log(`- ${pubUser.publication.name} (${pubUser.role})`);
});
```

### getFullProfileBySlug

```typescript
getFullProfileBySlug(slug: string): Promise<SubstackFullProfile>
```

Retrieves complete profile information (public + user profile) for a user by their handle.

**Parameters:**
- `slug`: The user's handle/slug

**Returns:**
- Promise resolving to a `SubstackFullProfile` object combining public and user profile data

**Example:**
```typescript
const fullProfile = await client.getFullProfileBySlug('jane-smith');
console.log(`Full profile for ${fullProfile.name}`);
console.log(`Public info: ${fullProfile.subscriberCount} subscribers`);
if (fullProfile.userProfile) {
  console.log(`Activity items: ${fullProfile.userProfile.items.length}`);
}
```

### getFullProfileById

```typescript
getFullProfileById(userId: number): Promise<SubstackFullProfile>
```

Retrieves complete profile information for a user by their numeric ID.

**Parameters:**
- `userId`: The numeric ID of the user

**Returns:**
- Promise resolving to a `SubstackFullProfile` object

**Example:**
```typescript
const fullProfile = await client.getFullProfileById(12345);
console.log(`Profile: ${fullProfile.name} (@${fullProfile.handle})`);
```

## Following Methods

### getFollowingIds

```typescript
getFollowingIds(): Promise<number[]>
```

Retrieves the list of user IDs that the authenticated user follows.

**Returns:**
- Promise resolving to an array of numeric user IDs

**Example:**
```typescript
const followingIds = await client.getFollowingIds();
console.log(`You follow ${followingIds.length} users`);
console.log('User IDs:', followingIds);
```

### getFollowingProfiles

```typescript
getFollowingProfiles(): Promise<SubstackFullProfile[]>
```

Retrieves complete profile information for all users that the authenticated user follows.

**Returns:**
- Promise resolving to an array of `SubstackFullProfile` objects

**Example:**
```typescript
const followingProfiles = await client.getFollowingProfiles();
console.log(`You follow ${followingProfiles.length} users:`);

followingProfiles.forEach(profile => {
  console.log(`- ${profile.name} (@${profile.handle})`);
  console.log(`  Subscribers: ${profile.subscriberCountString}`);
  if (profile.primaryPublication) {
    console.log(`  Publication: ${profile.primaryPublication.name}`);
  }
});
```

## NoteBuilder Class

The `NoteBuilder` class provides a fluent API for creating formatted notes with rich text features like bold and italic text.

### Constructor

```typescript
new NoteBuilder(client: Substack, text?: string)
```

Creates a new note builder instance. Usually accessed through the `client.note()` method.

**Parameters:**
- `client`: The Substack client instance
- `text` (optional): Initial text for the first paragraph

### Methods

#### note

```typescript
note(text: string): NoteBuilder
```

Starts a new paragraph in the note.

**Parameters:**
- `text`: Text content for the new paragraph

**Returns:**
- The NoteBuilder instance for method chaining

#### bold

```typescript
bold(text: string): NoteBuilder
```

Adds bold text to the current paragraph.

**Parameters:**
- `text`: Text to be formatted as bold

**Returns:**
- The NoteBuilder instance for method chaining

#### italic

```typescript
italic(text: string): NoteBuilder
```

Adds italic text to the current paragraph.

**Parameters:**
- `text`: Text to be formatted as italic

**Returns:**
- The NoteBuilder instance for method chaining

#### simple

```typescript
simple(text: string): NoteBuilder
```

Adds plain text to the current paragraph.

**Parameters:**
- `text`: Plain text to add

**Returns:**
- The NoteBuilder instance for method chaining

#### publish

```typescript
publish(): Promise<PublishNoteResponse>
```

Publishes the constructed note to your Substack feed.

**Returns:**
- Promise resolving to a `PublishNoteResponse` with the published note details

**Example Usage:**
```typescript
// Simple note with formatting
const response = await client
  .note('Welcome to my ')
  .bold('awesome')
  .simple(' Substack!')
  .note('This is a ')
  .italic('second paragraph')
  .simple(' with different formatting.')
  .publish();

console.log(`Note published: ${response.id}`);

// Multi-paragraph note with rich formatting
const complexNote = await client
  .note('🚀 Exciting news!')
  .note('I just released a new ')
  .bold('TypeScript library')
  .simple(' for interacting with APIs.')
  .note('Key features:')
  .note('• ')
  .bold('Type safety')
  .simple(' throughout')
  .note('• ')
  .italic('Easy to use')
  .simple(' fluent API')
  .note('Check it out and let me know what you think! 💪')
  .publish();
```

## Types

### Configuration Types

#### SubstackConfig

```typescript
interface SubstackConfig {
  hostname?: string;
  apiVersion?: string;
  apiKey: string;
}
```

Configuration options for the Substack client.

**Properties:**
- `hostname`: The publication's hostname (optional, defaults to 'substack.com')
- `apiVersion`: API version to use (optional, defaults to 'v1')
- `apiKey`: Your Substack API key (required for authentication)

### Post Types

#### SubstackPost

```typescript
interface SubstackPost {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  post_date: string;
  description?: string;
  audience?: string;
  canonical_url: string;
  cover_image?: string;
  podcast_url?: string;
  type: 'newsletter' | 'podcast' | 'thread';
  published: boolean;
  paywalled: boolean;
}
```

Represents a post on Substack with all its metadata.

**Properties:**
- `id`: Unique numeric identifier for the post
- `title`: The post's title
- `subtitle`: Optional subtitle
- `slug`: URL slug used in the post's URL
- `post_date`: ISO date string when the post was published
- `description`: Optional post description/excerpt
- `audience`: Target audience for the post
- `canonical_url`: The full URL to the post
- `cover_image`: Optional cover image URL
- `podcast_url`: Optional podcast audio URL (for podcast posts)
- `type`: The type of post (newsletter, podcast, or thread)
- `published`: Whether the post is published
- `paywalled`: Whether the post is behind a paywall

#### SubstackSearchResult

```typescript
interface SubstackSearchResult {
  total: number;
  results: SubstackPost[];
}
```

Represents search results for posts.

**Properties:**
- `total`: Total number of posts matching the search criteria
- `results`: Array of `SubstackPost` objects for the current page

### Comment Types

#### SubstackComment

```typescript
interface SubstackComment {
  id: number;
  body: string;
  created_at: string;
  parent_post_id: number;
  author: {
    id: number;
    name: string;
    is_admin?: boolean;
  };
}
```

Represents a comment on a Substack post.

**Properties:**
- `id`: Unique numeric identifier for the comment
- `body`: The comment's text content
- `created_at`: ISO date string when the comment was created
- `parent_post_id`: ID of the post this comment belongs to
- `author`: Information about the comment author

### Notes Types

#### SubstackNote

```typescript
interface SubstackNote {
  entity_key: string;
  type: string;
  context: {
    type: string;
    timestamp: string;
    users: Array<{
      id: number;
      name: string;
      handle: string;
      photo_url: string;
      bio?: string;
      // ... additional user properties
    }>;
    // ... additional context properties
  };
  comment?: {
    id: number;
    body: string;
    body_json?: Record<string, unknown>;
    user_id: number;
    type: string;
    date: string;
    // ... additional comment properties
  };
  // ... additional note properties
}
```

Represents a note (short-form post) in the Substack feed. Notes are complex objects that can contain various types of content including text, images, and links.

#### SubstackNotes

```typescript
class SubstackNotes {
  constructor(
    private readonly client: Substack,
    public readonly items: SubstackNote[],
    private readonly originalCursorTimestamp: string,
    private readonly nextCursor: string | null
  );

  async next(): Promise<SubstackNotes | null>;
  hasMore(): boolean;
}
```

A paginated collection of notes with cursor-based pagination support.

**Methods:**
- `next()`: Fetch the next page of notes
- `hasMore()`: Check if there are more notes available

### User Profile Types

#### SubstackUserProfile

```typescript
interface SubstackUserProfile {
  items: Array<{
    entity_key: string;
    type: string;
    context: {
      type: string;
      timestamp: string;
      users: Array<{
        id: number;
        name: string;
        handle: string;
        photo_url: string;
        bio?: string;
        // ... additional user properties
      }>;
      // ... additional context properties
    };
    // ... additional item properties
  }>;
  originalCursorTimestamp: string;
  nextCursor: string;
}
```

Represents a user's profile including their activity feed items.

#### SubstackPublicProfile

```typescript
interface SubstackPublicProfile {
  id: number;
  name: string;
  handle: string;
  photo_url: string;
  bio?: string;
  subscriberCount: string;
  subscriberCountNumber: number;
  publicationUsers: Array<{
    id: number;
    role: string;
    publication: {
      id: number;
      name: string;
      subdomain: string;
      logo_url: string;
      // ... additional publication properties
    };
  }>;
  // ... additional profile properties
}
```

Represents a user's public profile information including their publications and subscriber count.

#### SubstackFullProfile

```typescript
interface SubstackFullProfile extends SubstackPublicProfile {
  userProfile?: SubstackUserProfile;
}
```

Combines public profile information with user profile data for a complete view of a user.

### Pagination Types

#### PaginationParams

```typescript
interface PaginationParams {
  offset?: number;
  limit?: number;
  cursor?: string;
}
```

Parameters for paginated requests.

**Properties:**
- `offset`: Number of items to skip (for offset-based pagination)
- `limit`: Maximum number of items to return
- `cursor`: Cursor string for cursor-based pagination

#### SearchParams

```typescript
interface SearchParams extends PaginationParams {
  query: string;
  published_before?: string;
  published_after?: string;
  type?: 'newsletter' | 'podcast' | 'thread';
}
```

Parameters for searching posts with additional filtering options.

**Properties:**
- `query`: Search query string
- `published_before`: ISO date string to find posts published before this date
- `published_after`: ISO date string to find posts published after this date
- `type`: Filter by post type

### Note Publishing Types

#### PublishNoteRequest

```typescript
interface PublishNoteRequest {
  bodyJson: NoteBodyJson;
  replyMinimumRole: 'everyone';
}
```

Request structure for publishing a note.

#### PublishNoteResponse

```typescript
interface PublishNoteResponse {
  id: number;
  body: string;
  body_json: NoteBodyJson;
  date: string;
  name: string;
  photo_url: string;
  reactions: Record<string, number>;
  // ... additional response properties
}
```

Response structure when a note is successfully published.

#### NoteBodyJson

```typescript
interface NoteBodyJson {
  type: 'doc';
  attrs: {
    schemaVersion: 'v1';
  };
  content: Array<{
    type: 'paragraph';
    content: Array<{
      type: 'text';
      text: string;
      marks?: Array<{
        type: 'bold' | 'italic';
      }>;
    }>;
  }>;
}
```

Structured format for note content supporting rich text formatting.

### Error Types

#### SubstackError

```typescript
class SubstackError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: Response
  );
}
```

Custom error class for API-related errors.

**Properties:**
- `message`: Error message describing what went wrong
- `status`: HTTP status code (if available)
- `response`: Original Response object (if available)

**Example Usage:**
```typescript
try {
  const posts = await client.getPosts();
} catch (error) {
  if (error instanceof SubstackError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
  }
}
```

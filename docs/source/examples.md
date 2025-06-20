# Examples

This section provides practical examples of using the Substack API client in various scenarios.

## Basic Usage

### Initialize the Client

```typescript
import { Substack } from 'substack-api';

// Initialize with API key (required)
const client = new Substack({
  hostname: 'example.substack.com',
  apiKey: 'your-api-key-here'
});

// Using default hostname (substack.com)
const defaultClient = new Substack({
  apiKey: 'your-api-key-here'
});
```

## Publication Examples

## Post Management Examples

### List Recent Posts

```typescript
async function listRecentPosts() {
  try {
    const posts = await client.getPosts({
      limit: 10
    });
    
    posts.forEach(post => {
      console.log(`${post.title} - ${new Date(post.post_date).toLocaleDateString()}`);
      console.log(`Type: ${post.type}, Paywalled: ${post.paywalled ? 'Yes' : 'No'}`);
      
      if (post.subtitle) {
        console.log(`Subtitle: ${post.subtitle}`);
      }
      
      if (post.cover_image) {
        console.log(`Cover: ${post.cover_image}`);
      }
      
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Search Posts by Topic and Date Range

```typescript
async function searchPostsByTopicAndDate() {
  try {
    const results = await client.searchPosts({
      query: 'TypeScript development',
      type: 'newsletter',
      published_after: '2023-01-01',
      published_before: '2023-12-31',
      limit: 20
    });
    
    console.log(`Found ${results.total} posts about TypeScript`);
    results.results.forEach(post => {
      console.log(`${post.title} - ${new Date(post.post_date).toLocaleDateString()}`);
      console.log(`URL: ${post.canonical_url}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Get Post with Comments

```typescript
async function getPostWithComments(slug: string) {
  try {
    // Get the post
    const post = await client.getPost(slug);
    console.log(`Post: ${post.title}`);
    console.log(`Published: ${new Date(post.post_date).toLocaleDateString()}`);
    console.log(`URL: ${post.canonical_url}`);
    
    // Get comments for the post
    const comments = await client.getComments(post.id, {
      limit: 10
    });
    
    console.log(`\nRecent comments (${comments.length}):`);
    comments.forEach(comment => {
      const adminFlag = comment.author.is_admin ? ' [ADMIN]' : '';
      console.log(`${comment.author.name}${adminFlag}:`);
      console.log(`  ${comment.body.substring(0, 100)}...`);
      console.log(`  Posted: ${new Date(comment.created_at).toLocaleDateString()}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Notes Examples

### Get and Display Notes Feed

```typescript
async function displayNotesFeed() {
  try {
    const notes = await client.getNotes({ limit: 10 });
    
    console.log(`Loaded ${notes.items.length} notes`);
    
    notes.items.forEach(note => {
      if (note.comment) {
        const user = note.context.users[0];
        console.log(`${user.name} (@${user.handle}):`);
        console.log(`  ${note.comment.body}`);
        console.log(`  Posted: ${new Date(note.comment.date).toLocaleDateString()}`);
        
        if (note.comment.reactions) {
          const totalReactions = Object.values(note.comment.reactions).reduce((a, b) => a + b, 0);
          console.log(`  Reactions: ${totalReactions}`);
        }
        
        console.log('---');
      }
    });
    
    // Check if there are more notes
    if (notes.hasMore()) {
      console.log('There are more notes available...');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Paginate Through All Notes

```typescript
async function getAllNotes() {
  const allNotes: SubstackNote[] = [];
  
  try {
    let currentBatch = await client.getNotes({ limit: 20 });
    
    while (currentBatch) {
      allNotes.push(...currentBatch.items);
      console.log(`Loaded ${allNotes.length} notes so far...`);
      
      if (!currentBatch.hasMore()) {
        break;
      }
      
      currentBatch = await currentBatch.next();
    }
    
    console.log(`Total notes loaded: ${allNotes.length}`);
    return allNotes;
  } catch (error) {
    console.error('Error:', error.message);
    return allNotes;
  }
}
```

### Publish Simple and Formatted Notes

```typescript
async function publishNotes() {
  try {
    // Publish a simple note
    const simpleNote = await client.publishNote('Just discovered something amazing! 🚀');
    console.log(`Simple note published: ${simpleNote.id}`);
    
    // Publish a formatted note with rich text
    const formattedNote = await client
      .note('🎉 Exciting announcement!')
      .note('I just released a new ')
      .bold('TypeScript library')
      .simple(' for developers.')
      .note('Key features:')
      .note('• ')
      .bold('Type safety')
      .simple(' throughout')
      .note('• ')
      .italic('Easy integration')
      .simple(' with existing projects')
      .note('• ')
      .bold('Comprehensive documentation')
      .note('Check it out and let me know what you think! 💪')
      .publish();
      
    console.log(`Formatted note published: ${formattedNote.id}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## User Profile Examples

### Get User Profiles

```typescript
async function getUserProfiles() {
  try {
    // Get public profile by handle
    const publicProfile = await client.getPublicProfile('john-doe');
    console.log(`Name: ${publicProfile.name}`);
    console.log(`Handle: @${publicProfile.handle}`);
    console.log(`Subscribers: ${publicProfile.subscriberCountString}`);
    console.log(`Bio: ${publicProfile.bio}`);
    
    // List user's publications
    console.log('\nPublications:');
    publicProfile.publicationUsers.forEach(pubUser => {
      console.log(`- ${pubUser.publication.name} (${pubUser.role})`);
    });
    
    // Get full profile with activity feed
    const fullProfile = await client.getFullProfileBySlug('john-doe');
    if (fullProfile.userProfile) {
      console.log(`\nActivity items: ${fullProfile.userProfile.items.length}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Following Management

```typescript
async function manageFollowing() {
  try {
    // Get list of followed user IDs
    const followingIds = await client.getFollowingIds();
    console.log(`You follow ${followingIds.length} users`);
    
    // Get full profiles of followed users
    const followingProfiles = await client.getFollowingProfiles();
    
    console.log('\nYour following list:');
    followingProfiles.forEach(profile => {
      console.log(`${profile.name} (@${profile.handle})`);
      console.log(`  Subscribers: ${profile.subscriberCountString}`);
      
      if (profile.primaryPublication) {
        console.log(`  Publication: ${profile.primaryPublication.name}`);
      }
      
      if (profile.bio) {
        console.log(`  Bio: ${profile.bio.substring(0, 100)}...`);
      }
      
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Advanced Examples

### Paginated Post Search with Analytics

```typescript
async function searchAllPostsWithAnalytics(query: string) {
  const pageSize = 20;
  let offset = 0;
  const allResults: SubstackPost[] = [];
  const analytics = {
    totalPosts: 0,
    newsletters: 0,
    podcasts: 0,
    threads: 0,
    paywalled: 0,
    dateRange: { earliest: '', latest: '' }
  };
  
  try {
    while (true) {
      const results = await client.searchPosts({
        query,
        offset,
        limit: pageSize
      });
      
      allResults.push(...results.results);
      
      // Update analytics
      analytics.totalPosts = results.total;
      results.results.forEach(post => {
        analytics[post.type]++;
        if (post.paywalled) analytics.paywalled++;
        
        if (!analytics.dateRange.earliest || post.post_date < analytics.dateRange.earliest) {
          analytics.dateRange.earliest = post.post_date;
        }
        if (!analytics.dateRange.latest || post.post_date > analytics.dateRange.latest) {
          analytics.dateRange.latest = post.post_date;
        }
      });
      
      if (results.results.length < pageSize) {
        break;  // No more results
      }
      
      offset += pageSize;
    }
    
    console.log('Search Analytics:');
    console.log(`Total posts found: ${analytics.totalPosts}`);
    console.log(`Newsletters: ${analytics.newsletters}`);
    console.log(`Podcasts: ${analytics.podcasts}`);
    console.log(`Threads: ${analytics.threads}`);
    console.log(`Paywalled: ${analytics.paywalled}`);
    console.log(`Date range: ${analytics.dateRange.earliest} to ${analytics.dateRange.latest}`);
    
    return allResults;
  } catch (error) {
    console.error('Error:', error.message);
    return allResults;
  }
}
```

### Comprehensive Error Handling

```typescript
import { SubstackError } from 'substack-api';

async function robustAPICall<T>(operation: () => Promise<T>): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof SubstackError) {
      switch (error.status) {
        case 400:
          console.error('Bad request - check your parameters');
          break;
        case 401:
          console.error('Unauthorized - check your API key');
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 429:
          console.error('Rate limit exceeded. Try again later.');
          break;
        case 500:
          console.error('Server error - try again later');
          break;
        default:
          console.error(`API Error (${error.status}): ${error.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}

// Usage example
async function safeGetPosts() {
  return robustAPICall(() => client.getPosts({ limit: 10 }));
}
```

### TypeScript Integration with Custom Types

```typescript
import type {
  SubstackPublication,
  SubstackPost,
  SubstackComment,
  SubstackConfig,
  SubstackNote,
  SubstackFullProfile,
  PaginationParams,
  SearchParams
} from 'substack-api';

// Custom interface extending base types
interface ExtendedPost extends SubstackPost {
  commentsCount?: number;
  readingTime?: number;
}

// Type-safe configuration
const config: SubstackConfig = {
  hostname: 'example.substack.com',
  apiVersion: 'v1',
  apiKey: process.env.SUBSTACK_API_KEY!
};

// Type-safe search parameters
const searchParams: SearchParams = {
  query: 'typescript',
  type: 'newsletter',
  limit: 10
};

// Type-safe function implementations
async function getPostsWithCommentCounts(): Promise<ExtendedPost[]> {
  const client = new Substack(config);
  const posts = await client.getPosts({ limit: 10 });
  
  const extendedPosts: ExtendedPost[] = await Promise.all(
    posts.map(async (post) => {
      const comments = await client.getComments(post.id, { limit: 1 }); // Just to get count
      return {
        ...post,
        commentsCount: comments.length,
        readingTime: Math.ceil(post.title.length / 200) // Rough estimate
      };
    })
  );
  
  return extendedPosts;
}

// Type-safe utility function
function isPaywalledPost(post: SubstackPost): boolean {
  return post.paywalled === true;
}

// Filter posts by type with type safety
function filterPostsByType(posts: SubstackPost[], type: SubstackPost['type']): SubstackPost[] {
  return posts.filter(post => post.type === type);
}
```

### Real-world Application Example

```typescript
// Content management dashboard example
class SubstackDashboard {
  private client: Substack;
  
  constructor(apiKey: string, hostname?: string) {
    this.client = new Substack({ 
      apiKey, 
      hostname: hostname || 'substack.com' 
    });
  }
  
  async getDashboardData() {
    try {
      // Get recent posts with engagement metrics
      const posts = await this.client.getPosts({ limit: 5 });
      const postsWithComments = await Promise.all(
        posts.map(async (post) => {
          const comments = await this.client.getComments(post.id, { limit: 100 });
          return {
            ...post,
            commentCount: comments.length,
            lastCommentDate: comments[0]?.created_at
          };
        })
      );
      
      // Get recent notes
      const notes = await this.client.getNotes({ limit: 10 });
      
      // Get following stats
      const followingIds = await this.client.getFollowingIds();
      
      return {
        recentPosts: postsWithComments,
        recentNotes: notes.items,
        followingCount: followingIds.length,
        stats: {
          totalPosts: posts.length,
          totalNotes: notes.items.length,
          avgCommentsPerPost: postsWithComments.reduce((acc, p) => acc + p.commentCount, 0) / postsWithComments.length
        }
      };
    } catch (error) {
      console.error('Dashboard error:', error);
      return null;
    }
  }
  
  async publishDailyUpdate(content: string) {
    try {
      const response = await this.client
        .note('📊 Daily Update')
        .note(content)
        .note('Generated automatically by my dashboard 🤖')
        .publish();
        
      console.log(`Daily update published: ${response.id}`);
      return response;
    } catch (error) {
      console.error('Failed to publish daily update:', error);
      return null;
    }
  }
}

// Usage
const dashboard = new SubstackDashboard(process.env.SUBSTACK_API_KEY!, 'mysite.substack.com');
const data = await dashboard.getDashboardData();
if (data) {
  console.log(`Publication: ${data.publication.name}`);
  console.log(`Recent posts: ${data.recentPosts.length}`);
  console.log(`Following: ${data.followingCount} users`);
}
```

These examples demonstrate common usage patterns and advanced techniques when working with the Substack API client. For more detailed information about specific methods and types, refer to the [API Reference](api-reference.md) section.

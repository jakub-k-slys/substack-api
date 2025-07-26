# Entity Model Documentation

The Substack API client provides a modern, object-oriented entity model that makes it easy to navigate relationships between profiles, posts, notes, and comments. This guide covers all entity types and their capabilities.

## Overview

The entity model provides:
- **Fluent Navigation** - Navigate relationships naturally (`profile.posts()`, `post.comments()`)
- **Async Iteration** - Seamless pagination with `for await` loops  
- **Type Safety** - Full TypeScript support with entity classes
- **Interactive Features** - Like, comment, follow, and create content
- **Lazy Loading** - Data loaded on-demand for efficient memory usage

## Getting Started

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  apiKey: 'your-connect-sid-cookie-value',
  hostname: 'example.substack.com'
});

// Test connectivity
const isConnected = await client.testConnectivity();
console.log('Connected:', isConnected);
```

## Profile Entities

Profiles represent Substack users and come in two types: read-only `Profile` and your authenticated `OwnProfile` with write capabilities.

### Profile (Read-Only)

Standard profile for other users with read-only access to their content.

#### Basic Properties

```typescript
interface Profile {
  id: number;                    // Unique user ID
  name: string;                  // Display name
  slug: string;                  // Username/handle
  bio?: string;                  // Profile bio
  followerCount: number;         // Number of followers
  isFollowing: boolean;          // Whether you follow them
  photo?: {                      // Profile photo
    url: string;
    originalUrl: string;
  };
}
```

#### Getting Profiles

```typescript
// Get profile by username/slug
const profile = await client.profileForSlug('example-user');
console.log(`${profile.name} (@${profile.slug})`);
console.log(`Bio: ${profile.bio || 'No bio available'}`);
console.log(`Followers: ${profile.followerCount}`);

// Get profile by numeric ID
const profileById = await client.profileForId(12345);
console.log(`Found: ${profileById.name}`);
```

#### Navigation Methods

##### posts()

Navigate to the profile's posts with automatic pagination:

```typescript
// Get all posts (automatic pagination)
for await (const post of profile.posts()) {
  console.log(`📄 ${post.title}`);
  console.log(`   Published: ${post.publishedAt?.toLocaleDateString()}`);
  console.log(`   Author: ${post.author.name}`);
}

// Limit to recent posts
for await (const post of profile.posts({ limit: 10 })) {
  console.log(`- ${post.title} (${post.publishedAt?.toLocaleDateString()})`);
}
```

##### notes()

Navigate to the profile's notes (short-form content):

```typescript
// Get recent notes
for await (const note of profile.notes({ limit: 20 })) {
  console.log(`📝 ${note.body.substring(0, 100)}...`);
  console.log(`   💖 ${note.reactions?.length || 0} reactions`);
}
```

#### Social Actions

##### follow()

Follow this profile (requires authentication):

```typescript
if (!profile.isFollowing) {
  await profile.follow();
  console.log(`Now following ${profile.name}`);
} else {
  console.log(`Already following ${profile.name}`);
}
```

##### unfollow()

Unfollow this profile:

```typescript
if (profile.isFollowing) {
  await profile.unfollow();
  console.log(`Unfollowed ${profile.name}`);
}
```

### OwnProfile (Full Access)

Your authenticated profile with additional capabilities for content creation and management.

#### Additional Properties

```typescript
interface OwnProfile extends Profile {
  // Inherits all Profile properties plus:
  email?: string;                // Your email address
  isEmailConfirmed: boolean;     // Email confirmation status
  stripeCustomerId?: string;     // Stripe customer ID for payments
}
```

#### Getting Your Profile

```typescript
const myProfile = await client.ownProfile();
console.log(`Welcome ${myProfile.name}!`);
console.log(`Email: ${myProfile.email}`);
console.log(`Followers: ${myProfile.followerCount}`);
```

#### Content Creation

##### newNote()

Create short-form notes using the builder pattern (recommended approach):

```typescript
// Simple note
const note = await myProfile.newNote().paragraph().text('🚀 Just shipped a new feature! Excited to share what we\'ve been working on.').publish();
console.log(`Note published: ${note.id}`);

// Complex note with formatting
const formattedNote = await myProfile
  .newNote()
  .paragraph()
  .text('Great discussion with the community today!')
  .paragraph()
  .text('Key takeaways: ')
  .bold('engagement is everything')
  .paragraph()
  .text('Check out our latest updates at: ')
  .link('our blog', 'https://example.com')
  .publish();

// Note with mentions or hashtags
const socialNote = await myProfile.newNote().paragraph().text('Building the future of newsletters #substack #writing').publish();
```

#### Following Management

Navigate through your social connections:

```typescript
// People you follow
console.log('Following:');
for await (const followee of myProfile.followees({ limit: 50 })) {
  console.log(`- ${followee.name} (@${followee.slug})`);
  
  // Get their recent posts
  let postCount = 0;
  for await (const post of followee.posts({ limit: 2 })) {
    console.log(`  📄 ${post.title}`);
    postCount++;
  }
  
  if (postCount === 0) {
    console.log('  (No recent posts)');
  }
}
```

## Post Entities

Posts represent long-form content like articles and newsletters.

### Properties

```typescript
interface Post {
  id: string;                    // Unique post ID/slug
  title: string;                 // Post title
  body: string;                  // Post content (HTML)
  author: Profile;               // Post author
  publishedAt?: Date;            // Publication date
  updatedAt?: Date;              // Last update date
  isDraft: boolean;              // Draft status
  reactions?: Reaction[];        // Likes, hearts, etc.
  commentCount: number;          // Number of comments
  slug: string;                  // URL slug
  canonicalUrl: string;          // Full URL
}
```

### Getting Posts

```typescript
// Get specific post by ID/slug
const post = await client.postForId('my-awesome-post');
console.log(`Title: ${post.title}`);
console.log(`Author: ${post.author.name}`);
console.log(`Published: ${post.publishedAt?.toLocaleDateString()}`);
console.log(`Comments: ${post.commentCount}`);
console.log(`URL: ${post.canonicalUrl}`);
```

### Navigation

#### comments()

Navigate to post comments with pagination:

```typescript
// Get all comments
for await (const comment of post.comments()) {
  console.log(`💬 ${comment.author.name}: ${comment.body.substring(0, 100)}...`);
  console.log(`   💖 ${comment.reactions?.length || 0} reactions`);
  console.log(`   🕐 ${comment.createdAt.toLocaleDateString()}`);
}

// Limit to recent comments
for await (const comment of post.comments({ limit: 10 })) {
  console.log(`- ${comment.author.name}: ${comment.body.substring(0, 60)}...`);
}
```

### Interactions

#### like()

Like the post (requires authentication):

```typescript
await post.like();
console.log(`Liked: "${post.title}"`);
```

#### addComment()

Add a comment to the post:

```typescript
const comment = await post.addComment('Great insights! Thanks for sharing this perspective.');
console.log(`Comment added: ${comment.id}`);
console.log(`Comment: ${comment.body}`);
```

## Note Entities

Notes are short-form content similar to social media posts.

### Properties

```typescript
interface Note {
  id: string;                    // Unique note ID
  body: string;                  // Note content (plain text)
  author: Profile;               // Note author
  createdAt: Date;               // Creation date
  reactions?: Reaction[];        // Likes, hearts, etc.
  commentCount: number;          // Number of comments
}
```

### Getting Notes

```typescript
// Get specific note by ID
const note = await client.noteForId('note-123');
console.log(`Note by ${note.author.name}:`);
console.log(`${note.body}`);
console.log(`Posted: ${note.createdAt.toLocaleDateString()}`);
console.log(`Reactions: ${note.reactions?.length || 0}`);
```

### Interactions

#### like()

Like the note:

```typescript
await note.like();
console.log('Note liked!');
```

#### addComment()

Comment on the note:

```typescript
const comment = await note.addComment('Completely agree with this!');
console.log(`Comment added: ${comment.body}`);
```

## Comment Entities

Comments represent responses to posts and notes.

### Properties

```typescript
interface Comment {
  id: string;                    // Unique comment ID
  body: string;                  // Comment content
  author: Profile;               // Comment author
  post?: Post;                   // Parent post (if comment on post)
  createdAt: Date;               // Creation date
  reactions?: Reaction[];        // Likes, hearts, etc.
}
```

### Getting Comments

```typescript
// Get specific comment by ID
const comment = await client.commentForId('comment-456');
console.log(`Comment by ${comment.author.name}:`);
console.log(`"${comment.body}"`);
console.log(`Posted: ${comment.createdAt.toLocaleDateString()}`);

// Navigate to parent post
if (comment.post) {
  console.log(`On post: "${comment.post.title}"`);
}
```

### Interactions

#### like()

Like the comment:

```typescript
await comment.like();
console.log('Comment liked!');
```

## Async Iteration Patterns

The entity model uses async iterators for seamless navigation and pagination.

### Basic Patterns

```typescript
// Simple iteration - all items
for await (const post of profile.posts()) {
  console.log(post.title);
}

// Limited iteration
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}

// Break early
for await (const post of profile.posts()) {
  console.log(post.title);
  if (post.title.includes('BREAKING')) {
    console.log('Found breaking news!');
    break;
  }
}
```

### Collecting Results

```typescript
// Collect into array for processing
const recentPosts = [];
for await (const post of profile.posts({ limit: 20 })) {
  recentPosts.push(post);
}

console.log(`Collected ${recentPosts.length} posts`);

// Sort by date (most recent first)
recentPosts.sort((a, b) => 
  (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0)
);

// Display sorted results
recentPosts.forEach((post, index) => {
  console.log(`${index + 1}. ${post.title} (${post.publishedAt?.toLocaleDateString()})`);
});
```

### Nested Navigation

```typescript
// Deep navigation through relationships
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`\n📄 ${post.title}`);
  console.log(`   📅 ${post.publishedAt?.toLocaleDateString()}`);
  console.log(`   💖 ${post.reactions?.length || 0} reactions`);
  
  // Get comments for each post
  let commentCount = 0;
  for await (const comment of post.comments({ limit: 3 })) {
    console.log(`   💬 ${comment.author.name}: ${comment.body.substring(0, 60)}...`);
    commentCount++;
  }
  
  if (commentCount === 0) {
    console.log('   (No comments yet)');
  }
}
```

### Performance Considerations

```typescript
// Efficient: Process as you go
for await (const post of profile.posts()) {
  await processPost(post);  // Process immediately
  
  // Memory usage stays constant
}

// Less efficient: Load all first
const allPosts = [];
for await (const post of profile.posts()) {
  allPosts.push(post);  // Memory grows
}
allPosts.forEach(processPost);  // Process later
```

## Complete Examples

### Content Dashboard

```typescript
async function contentDashboard() {
  const client = new SubstackClient({
    apiKey: process.env.SUBSTACK_API_KEY!
  });

  const myProfile = await client.ownProfile();
  console.log(`📊 Content Dashboard for ${myProfile.name}`);

  // Recent posts performance
  console.log(`\n📄 Recent Posts:`);
  for await (const post of myProfile.posts({ limit: 5 })) {
    console.log(`\n  "${post.title}"`);
    console.log(`     📅 ${post.publishedAt?.toLocaleDateString()}`);
    console.log(`     💖 ${post.reactions?.length || 0} reactions`);
    console.log(`     💬 ${post.commentCount} comments`);
    console.log(`     🔗 ${post.canonicalUrl}`);
  }

  // Recent notes engagement
  console.log(`\n📝 Recent Notes:`);
  for await (const note of myProfile.notes({ limit: 10 })) {
    console.log(`\n  "${note.body.substring(0, 80)}..."`);
    console.log(`     🕐 ${note.createdAt.toLocaleDateString()}`);
    console.log(`     💖 ${note.reactions?.length || 0} reactions`);
  }
}
```

### Community Engagement

```typescript
async function engageWithCommunity() {
  const client = new SubstackClient({
    apiKey: process.env.SUBSTACK_API_KEY!
  });

  const myProfile = await client.ownProfile();

  // Engage with people you follow
  console.log('🤝 Engaging with community...');
  for await (const followee of myProfile.followees({ limit: 10 })) {
    console.log(`\nChecking ${followee.name}...`);
    
    // Like their recent post
    for await (const post of followee.posts({ limit: 1 })) {
      await post.like();
      console.log(`  ✅ Liked: "${post.title}"`);
      
      // Add a supportive comment
      await post.addComment('Great insights! Thanks for sharing.');
      console.log(`  💬 Added supportive comment`);
      break;
    }
  }

  // Create a status update
  const statusNote = await myProfile.createNote({
    body: '🌟 Had a great day engaging with the community! So many brilliant writers on Substack.'
  });
  console.log(`\n📝 Status update posted: ${statusNote.id}`);
}
```

### Content Analysis

```typescript
async function analyzeContent(username: string) {
  const client = new SubstackClient({
    apiKey: process.env.SUBSTACK_API_KEY!
  });

  const profile = await client.profileForSlug(username);
  console.log(`📊 Analyzing content for ${profile.name} (@${profile.slug})`);

  // Collect posts for analysis
  const posts = [];
  for await (const post of profile.posts({ limit: 50 })) {
    posts.push(post);
  }

  console.log(`\n📈 Content Statistics:`);
  console.log(`   Total posts analyzed: ${posts.length}`);
  
  // Calculate average reactions
  const totalReactions = posts.reduce((sum, post) => 
    sum + (post.reactions?.length || 0), 0
  );
  console.log(`   Average reactions per post: ${(totalReactions / posts.length).toFixed(1)}`);
  
  // Find most popular post
  const mostPopular = posts.reduce((max, post) => 
    (post.reactions?.length || 0) > (max.reactions?.length || 0) ? post : max
  );
  console.log(`   Most popular: "${mostPopular.title}" (${mostPopular.reactions?.length || 0} reactions)`);
  
  // Recent posting frequency
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentPosts = posts.filter(post => 
    post.publishedAt && post.publishedAt > thirtyDaysAgo
  );
  console.log(`   Posts in last 30 days: ${recentPosts.length}`);
}
```

## Error Handling

Handle errors gracefully in entity operations:

```typescript
try {
  const profile = await client.profileForSlug('nonexistent-user');
} catch (error) {
  if (error.message.includes('404')) {
    console.error('User not found');
  } else {
    console.error('Unexpected error:', error.message);
  }
}

// Handle errors during iteration
try {
  for await (const post of profile.posts()) {
    await post.like();  // This might fail
  }
} catch (error) {
  if (error.message.includes('429')) {
    console.error('Rate limited - please wait before continuing');
  } else if (error.message.includes('401')) {
    console.error('Authentication failed - check your API key');
  } else {
    console.error('Error during iteration:', error.message);
  }
}
```

## Best Practices

### Memory Management

```typescript
// Good: Stream processing
for await (const post of profile.posts()) {
  await processPost(post);
  // Memory stays constant
}

// Be careful: Large collections
const allPosts = [];
for await (const post of profile.posts()) {
  allPosts.push(post);  // Memory grows
}
// Consider memory usage for large datasets
```

### API Efficiency

```typescript
// Efficient: Use limits appropriately
for await (const post of profile.posts({ limit: 10 })) {
  // Process only what you need
}

// Efficient: Break early when found
for await (const post of profile.posts()) {
  if (post.title.includes('target')) {
    console.log('Found target post!');
    break;  // Stop searching
  }
}
```

### Error Recovery

```typescript
// Robust: Handle individual failures
for await (const post of profile.posts()) {
  try {
    await post.like();
    console.log(`Liked: ${post.title}`);
  } catch (error) {
    console.warn(`Failed to like "${post.title}": ${error.message}`);
    // Continue with next post
  }
}
```

The entity model makes working with Substack data intuitive and efficient. Use async iteration for seamless pagination, navigate relationships naturally, and handle errors gracefully for robust applications.
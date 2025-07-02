# Introduction

The Substack API client is a modern, type-safe TypeScript library that provides a comprehensive interface for interacting with Substack's platform. Whether you're building automation tools, analytics dashboards, content management systems, or social features, this library makes it easy to integrate with Substack.

## Who This Is For

### Content Creators & Publishers
- **Newsletter automation** - Schedule posts, manage drafts, track engagement
- **Audience analytics** - Monitor follower growth, engagement rates, content performance  
- **Content distribution** - Cross-post to multiple publications, manage syndication
- **Community management** - Moderate comments, engage with readers, build relationships

### Developers & Technical Teams
- **API integration** - Clean, typed interface for Substack's APIs
- **Automation workflows** - Build custom publishing pipelines and content workflows
- **Data analysis** - Extract insights from publication data and reader behavior
- **Custom applications** - Build newsletter management tools, reader apps, content discovery platforms

### Data Analysts & Marketers
- **Performance tracking** - Monitor post performance, engagement metrics, growth trends
- **Audience insights** - Understand reader behavior, preferences, and engagement patterns
- **Competitive analysis** - Track industry publications and benchmark performance
- **Growth optimization** - Identify high-performing content patterns and engagement strategies

### Marketing & Growth Teams
- **Lead generation** - Integrate newsletter signups with CRM systems and marketing funnels
- **Email marketing** - Coordinate Substack content with broader email marketing campaigns
- **Social media** - Automate social sharing and cross-platform content promotion
- **Analytics integration** - Connect Substack data with Google Analytics, Mixpanel, and other tools

## Key Features

### 🏗️ Modern Entity Model
Navigate Substack data naturally with object-oriented entities:
```typescript
// Fluent navigation through relationships
for await (const post of profile.posts()) {
  for await (const comment of post.comments()) {
    await comment.like();
  }
}
```

### 🔄 Seamless Pagination  
Automatic pagination handling with async iterators:
```typescript
// No manual pagination - just iterate
for await (const post of profile.posts()) {
  console.log(post.title); // Handles all pages automatically
}
```

### 🛡️ Complete Type Safety
Full TypeScript support with comprehensive type definitions:
```typescript
// Everything is typed - IDE autocomplete and compile-time checks
const profile: Profile = await client.profileForSlug('username');
const post: Post = await profile.posts({ limit: 1 }).next().value;
```

### 🔐 Secure Authentication
Cookie-based authentication using your Substack session:
```typescript
const client = new SubstackClient({
  apiKey: 'your-connect-sid-cookie-value' // Extracted from browser
});
```

### 📝 Content Creation & Management
Full CRUD operations for posts, notes, and comments:
```typescript
const myProfile = await client.ownProfile();

// Create content
await myProfile.createPost({ title: 'New Article', body: '...', isDraft: false });
await myProfile.createNote({ body: 'Quick thought...' });

// Social interactions  
await post.like();
await post.addComment('Great insights!');
await profile.follow();
```

### 💬 Social Features
Complete social interaction capabilities:
- Like posts, notes, and comments
- Follow and unfollow users
- Add comments and engage in discussions
- Track follower relationships and social connections

### 📊 Analytics & Insights
Built-in support for tracking engagement and performance:
```typescript
// Get comprehensive analytics
const reactions = post.reactions?.length || 0;
const comments = post.commentCount;
const followers = profile.followerCount;
```

### 🚀 High Performance
Optimized for efficiency with intelligent caching and request batching:
- In-memory caching for frequently accessed data
- Intelligent pagination to minimize API calls
- Async iteration for memory-efficient processing of large datasets

## Architecture Overview

The library is built around several key concepts:

### SubstackClient
The main entry point that handles authentication and provides access to entities:
```typescript
const client = new SubstackClient({ apiKey: 'cookie-value' });
```

### Entity Classes
Represent Substack objects with navigation and interaction methods:
- **Profile** - User profiles with read access to their content
- **OwnProfile** - Your authenticated profile with content creation capabilities  
- **Post** - Long-form articles and newsletters
- **Note** - Short-form social content
- **Comment** - Comments on posts and notes

### Async Iterators
Provide seamless pagination for collections:
```typescript
// All collections support async iteration
profile.posts()      // AsyncIterable<Post>
post.comments()      // AsyncIterable<Comment>  
profile.notes()      // AsyncIterable<Note>
```

### Type Safety
Comprehensive TypeScript definitions ensure compile-time safety:
```typescript
interface Profile {
  id: number;
  name: string;
  slug: string;
  followerCount: number;
  posts(options?: { limit?: number }): AsyncIterable<Post>;
}
```

## Use Case Examples

### Newsletter Analytics Dashboard
```typescript
const myProfile = await client.ownProfile();

// Track performance metrics
for await (const post of myProfile.posts({ limit: 10 })) {
  console.log(`"${post.title}": ${post.reactions?.length || 0} reactions`);
}
```

### Content Curation Bot
```typescript
// Find and engage with trending content
for await (const followee of myProfile.followees()) {
  for await (const post of followee.posts({ limit: 3 })) {
    if ((post.reactions?.length || 0) > 10) {
      await post.like();
      await post.addComment('Great insights!');
    }
  }
}
```

### Cross-Platform Publishing
```typescript
// Publish to Substack and sync elsewhere
const post = await myProfile.createPost({
  title: 'New Article',
  body: content,
  isDraft: false
});

// Sync to other platforms
await syncToMedium(post);
await shareOnTwitter(post.canonicalUrl);
```

### Community Engagement Tracker
```typescript
// Monitor community activity
for await (const post of myProfile.posts()) {
  for await (const comment of post.comments()) {
    if (needsResponse(comment)) {
      await comment.addComment(generateResponse(comment));
    }
  }
}
```

## Getting Started

1. **Install the library**: `npm install substack-api`
2. **Get your authentication cookie** from your browser's Substack session
3. **Initialize the client** with your credentials  
4. **Start exploring** with the entity model

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  apiKey: process.env.SUBSTACK_API_KEY!
});

// Test connection
const isConnected = await client.testConnectivity();

// Get your profile and start exploring
const myProfile = await client.ownProfile();
console.log(`Welcome ${myProfile.name}!`);
```

## What Makes This Different

### Entity-Oriented Design
Unlike traditional REST clients that return raw JSON, this library provides rich entity objects with built-in navigation and interaction methods.

### Developer Experience First
- Intuitive async iteration patterns
- Comprehensive TypeScript support  
- Intelligent error handling and retry logic
- Extensive documentation with real-world examples

### Production Ready
- Robust error handling for network issues and API changes
- Efficient memory usage for large datasets
- Rate limiting and request optimization
- Comprehensive test coverage

### Community Focused
- Open source with active development
- Responsive to user feedback and feature requests
- Comprehensive documentation and examples
- Regular updates to support new Substack features

The Substack API client makes it easy to build powerful applications on top of Substack's platform. Whether you're automating your newsletter workflow, building analytics tools, or creating new ways for creators to engage with their audience, this library provides the foundation you need.
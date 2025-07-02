# Examples

This section provides practical examples of using the modern SubstackClient entity-based API in various real-world scenarios.

## Basic Setup

### Initialize the Client

```typescript
import { SubstackClient } from 'substack-api';

// Initialize with connect.sid cookie
const client = new SubstackClient({
  apiKey: 'your-connect-sid-cookie-value',
  hostname: 'example.substack.com'  // optional
});

// Test connection
const isConnected = await client.testConnectivity();
if (!isConnected) {
  throw new Error('Failed to connect to Substack API');
}
```

### Environment Setup

```typescript
// .env file
// SUBSTACK_API_KEY=your-connect-sid-cookie-value
// SUBSTACK_HOSTNAME=yoursite.substack.com

import dotenv from 'dotenv';
dotenv.config();

const client = new SubstackClient({
  apiKey: process.env.SUBSTACK_API_KEY!,
  hostname: process.env.SUBSTACK_HOSTNAME
});
```

## Profile Management

### Get Your Own Profile

```typescript
async function getMyProfile() {
  try {
    const myProfile = await client.ownProfile();
    
    console.log(`Welcome ${myProfile.name}!`);
    console.log(`Username: @${myProfile.slug}`);
    console.log(`Email: ${myProfile.email || 'Not available'}`);
    console.log(`Followers: ${myProfile.followerCount}`);
    console.log(`Bio: ${myProfile.bio || 'No bio set'}`);
    
    return myProfile;
  } catch (error) {
    console.error('Failed to get profile:', error.message);
    throw error;
  }
}
```

### Get Other Profiles

```typescript
async function exploreProfiles() {
  try {
    // Get profile by username
    const profile = await client.profileForSlug('interesting-writer');
    console.log(`Found: ${profile.name} (@${profile.slug})`);
    console.log(`Followers: ${profile.followerCount}`);
    console.log(`Following them: ${profile.isFollowing ? 'Yes' : 'No'}`);
    
    // Get profile by ID
    const profileById = await client.profileForId(12345);
    console.log(`Profile by ID: ${profileById.name}`);
    
    return { profile, profileById };
  } catch (error) {
    console.error('Error exploring profiles:', error.message);
  }
}
```

## Content Discovery

### Browse Posts from a Profile

```typescript
async function browseContent(username: string) {
  try {
    const profile = await client.profileForSlug(username);
    console.log(`📚 Content from ${profile.name}:\n`);
    
    // Get recent posts with details
    for await (const post of profile.posts({ limit: 10 })) {
      console.log(`📄 "${post.title}"`);
      console.log(`   📅 Published: ${post.publishedAt?.toLocaleDateString()}`);
      console.log(`   ✍️  Author: ${post.author.name}`);
      console.log(`   💖 Reactions: ${post.reactions?.length || 0}`);
      console.log(`   💬 Comments: ${post.commentCount}`);
      console.log(`   🔗 URL: ${post.canonicalUrl}`);
      
      // Get a preview of comments
      let commentCount = 0;
      for await (const comment of post.comments({ limit: 2 })) {
        if (commentCount === 0) console.log(`   Recent comments:`);
        console.log(`     💬 ${comment.author.name}: ${comment.body.substring(0, 60)}...`);
        commentCount++;
      }
      
      if (commentCount === 0) {
        console.log(`   (No comments yet)`);
      }
      
      console.log(''); // Empty line
    }
  } catch (error) {
    console.error('Error browsing content:', error.message);
  }
}

// Usage
await browseContent('example-writer');
```

### Discover Notes

```typescript
async function exploreNotes(username: string) {
  try {
    const profile = await client.profileForSlug(username);
    console.log(`📝 Notes from ${profile.name}:\n`);
    
    for await (const note of profile.notes({ limit: 15 })) {
      console.log(`"${note.body}"`);
      console.log(`   👤 ${note.author.name}`);
      console.log(`   🕐 ${note.createdAt.toLocaleDateString()}`);
      console.log(`   💖 ${note.reactions?.length || 0} reactions`);
      console.log('');
    }
  } catch (error) {
    console.error('Error exploring notes:', error.message);
  }
}
```

## Content Creation

### Publishing Posts

```typescript
async function publishContent() {
  try {
    const myProfile = await client.ownProfile();
    
    // Create a draft first
    const draft = await myProfile.createPost({
      title: 'My Thoughts on Modern Technology',
      body: `
        <h2>The Future is Here</h2>
        <p>Technology continues to evolve at an unprecedented pace...</p>
        <p>Here are my key observations:</p>
        <ul>
          <li>AI is becoming more accessible</li>
          <li>Remote work is the new normal</li>
          <li>Digital privacy is increasingly important</li>
        </ul>
      `,
      isDraft: true
    });
    
    console.log(`✅ Draft created: "${draft.title}"`);
    console.log(`   ID: ${draft.id}`);
    console.log(`   Status: ${draft.isDraft ? 'Draft' : 'Published'}`);
    
    // Publish immediately
    const published = await myProfile.createPost({
      title: 'Quick Update from the Team',
      body: `
        <p>Hey everyone! 👋</p>
        <p>Just wanted to share a quick update on what we've been working on...</p>
      `,
      isDraft: false
    });
    
    console.log(`🚀 Published: "${published.title}"`);
    console.log(`   URL: ${published.canonicalUrl}`);
    
    return { draft, published };
  } catch (error) {
    console.error('Error publishing content:', error.message);
  }
}
```

### Creating Notes

```typescript
async function shareThoughts() {
  try {
    const myProfile = await client.ownProfile();
    
    // Simple note
    const simpleNote = await myProfile.createNote({
      body: '🚀 Just shipped a new feature! Excited to see what you all think.'
    });
    
    console.log(`📝 Note published: ${simpleNote.id}`);
    
    // Note with more detail
    const detailedNote = await myProfile.createNote({
      body: `💡 Pro tip: When writing newsletters, always start with your reader's biggest challenge. 

What problem are you solving for them today?

#writing #newsletters #substack`
    });
    
    console.log(`📝 Detailed note published: ${detailedNote.id}`);
    
    // Status update
    const statusNote = await myProfile.createNote({
      body: `📊 This week's stats:
• 3 new posts published
• 150+ new subscribers  
• Amazing engagement from the community

Thanks for being awesome! 🙌`
    });
    
    console.log(`📊 Status update published: ${statusNote.id}`);
    
    return { simpleNote, detailedNote, statusNote };
  } catch (error) {
    console.error('Error sharing thoughts:', error.message);
  }
}
```

## Social Engagement

### Like and Comment on Content

```typescript
async function engageWithContent() {
  try {
    // Find interesting profiles to engage with
    const profile = await client.profileForSlug('thought-leader');
    
    console.log(`🤝 Engaging with ${profile.name}'s content...\n`);
    
    // Engage with their recent posts
    for await (const post of profile.posts({ limit: 3 })) {
      console.log(`📄 "${post.title}"`);
      
      // Like the post
      try {
        await post.like();
        console.log(`   ✅ Liked`);
      } catch (error) {
        console.log(`   ⚠️  Already liked or failed to like`);
      }
      
      // Add a thoughtful comment
      try {
        const comment = await post.addComment(
          'Great insights! This really resonates with my experience. Thanks for sharing your perspective.'
        );
        console.log(`   💬 Added comment: ${comment.id}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to comment: ${error.message}`);
      }
      
      console.log('');
    }
    
    // Engage with their notes
    for await (const note of profile.notes({ limit: 5 })) {
      console.log(`📝 Note: "${note.body.substring(0, 50)}..."`);
      
      try {
        await note.like();
        console.log(`   ✅ Liked note`);
      } catch (error) {
        console.log(`   ⚠️  Already liked note or failed`);
      }
      
      // Occasionally comment on interesting notes
      if (note.body.toLowerCase().includes('tip') || note.body.includes('💡')) {
        try {
          const comment = await note.addComment('This is really helpful! 💯');
          console.log(`   💬 Commented on note: ${comment.id}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to comment on note`);
        }
      }
      
      console.log('');
    }
  } catch (error) {
    console.error('Error engaging with content:', error.message);
  }
}
```

### Follow Interesting People

```typescript
async function buildNetwork() {
  try {
    const myProfile = await client.ownProfile();
    
    // List of interesting writers to follow
    const writersToCheck = [
      'tech-writer',
      'business-insights', 
      'creative-storyteller',
      'industry-expert'
    ];
    
    console.log('🌐 Building network...\n');
    
    for (const username of writersToCheck) {
      try {
        const profile = await client.profileForSlug(username);
        
        console.log(`👤 ${profile.name} (@${profile.slug})`);
        console.log(`   Bio: ${profile.bio?.substring(0, 100) || 'No bio'}...`);
        console.log(`   Followers: ${profile.followerCount}`);
        
        if (!profile.isFollowing) {
          await profile.follow();
          console.log(`   ✅ Now following`);
        } else {
          console.log(`   ✅ Already following`);
        }
        
        // Check out their recent content
        for await (const post of profile.posts({ limit: 1 })) {
          console.log(`   📄 Latest: "${post.title}"`);
          break;
        }
        
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error with ${username}: ${error.message}\n`);
      }
    }
    
    // Show current following count
    let followingCount = 0;
    for await (const followee of myProfile.followees({ limit: 1000 })) {
      followingCount++;
    }
    console.log(`📊 Now following ${followingCount} people`);
    
  } catch (error) {
    console.error('Error building network:', error.message);
  }
}
```

## Analytics and Monitoring

### Content Performance Dashboard

```typescript
async function contentDashboard() {
  try {
    const myProfile = await client.ownProfile();
    
    console.log(`📊 Content Dashboard for ${myProfile.name}\n`);
    console.log(`👥 Total Followers: ${myProfile.followerCount}\n`);
    
    // Analyze recent posts
    console.log(`📄 Recent Posts Performance:`);
    
    const posts = [];
    for await (const post of myProfile.posts({ limit: 10 })) {
      posts.push(post);
    }
    
    // Calculate totals
    const totalReactions = posts.reduce((sum, post) => sum + (post.reactions?.length || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + post.commentCount, 0);
    
    console.log(`   Total posts analyzed: ${posts.length}`);
    console.log(`   Total reactions: ${totalReactions}`);
    console.log(`   Total comments: ${totalComments}`);
    console.log(`   Average reactions per post: ${(totalReactions / posts.length).toFixed(1)}`);
    console.log(`   Average comments per post: ${(totalComments / posts.length).toFixed(1)}\n`);
    
    // Top performing posts
    const sortedPosts = posts.sort((a, b) => 
      (b.reactions?.length || 0) - (a.reactions?.length || 0)
    );
    
    console.log(`🏆 Top Performing Posts:`);
    sortedPosts.slice(0, 3).forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      💖 ${post.reactions?.length || 0} reactions`);
      console.log(`      💬 ${post.commentCount} comments`);
      console.log(`      📅 ${post.publishedAt?.toLocaleDateString()}`);
      console.log('');
    });
    
    // Recent notes engagement
    console.log(`📝 Recent Notes Activity:`);
    
    const notes = [];
    for await (const note of myProfile.notes({ limit: 10 })) {
      notes.push(note);
    }
    
    const noteReactions = notes.reduce((sum, note) => sum + (note.reactions?.length || 0), 0);
    console.log(`   Total notes: ${notes.length}`);
    console.log(`   Total note reactions: ${noteReactions}`);
    console.log(`   Average reactions per note: ${(noteReactions / notes.length).toFixed(1)}\n`);
    
    // Most engaging note
    const topNote = notes.reduce((max, note) => 
      (note.reactions?.length || 0) > (max.reactions?.length || 0) ? note : max
    );
    
    console.log(`🌟 Most Engaging Note:`);
    console.log(`   "${topNote.body.substring(0, 100)}..."`);
    console.log(`   💖 ${topNote.reactions?.length || 0} reactions`);
    console.log(`   📅 ${topNote.createdAt.toLocaleDateString()}`);
    
  } catch (error) {
    console.error('Error generating dashboard:', error.message);
  }
}
```

### Community Engagement Tracking

```typescript
async function trackEngagement() {
  try {
    const myProfile = await client.ownProfile();
    
    console.log(`🤝 Community Engagement Report\n`);
    
    // Analyze who you're following
    console.log(`👥 Following Analysis:`);
    
    const followees = [];
    for await (const followee of myProfile.followees({ limit: 100 })) {
      followees.push(followee);
    }
    
    console.log(`   Total following: ${followees.length}\n`);
    
    // Check recent activity from people you follow
    console.log(`📊 Recent Activity from Network:`);
    
    let totalNewPosts = 0;
    let totalNewNotes = 0;
    
    for (const followee of followees.slice(0, 10)) { // Check first 10
      console.log(`\n   👤 ${followee.name} (@${followee.slug}):`);
      
      // Count recent posts (last 7 days)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      let recentPosts = 0;
      for await (const post of followee.posts({ limit: 10 })) {
        if (post.publishedAt && post.publishedAt > oneWeekAgo) {
          recentPosts++;
        }
      }
      
      let recentNotes = 0;
      for await (const note of followee.notes({ limit: 10 })) {
        if (note.createdAt > oneWeekAgo) {
          recentNotes++;
        }
      }
      
      console.log(`      📄 ${recentPosts} posts this week`);
      console.log(`      📝 ${recentNotes} notes this week`);
      
      totalNewPosts += recentPosts;
      totalNewNotes += recentNotes;
    }
    
    console.log(`\n📈 Network Summary:`);
    console.log(`   Total new posts this week: ${totalNewPosts}`);
    console.log(`   Total new notes this week: ${totalNewNotes}`);
    console.log(`   Activity level: ${totalNewPosts + totalNewNotes > 20 ? 'High' : totalNewPosts + totalNewNotes > 10 ? 'Medium' : 'Low'}`);
    
  } catch (error) {
    console.error('Error tracking engagement:', error.message);
  }
}
```

## Advanced Use Cases

### Automated Content Curation

```typescript
async function curateContent() {
  try {
    const myProfile = await client.ownProfile();
    const interestingPosts = [];
    
    console.log('🔍 Curating interesting content from network...\n');
    
    // Get followees
    for await (const followee of myProfile.followees({ limit: 20 })) {
      // Look for posts with specific keywords
      for await (const post of followee.posts({ limit: 5 })) {
        const keywords = ['AI', 'technology', 'innovation', 'future', 'insight'];
        const hasKeyword = keywords.some(keyword => 
          post.title.toLowerCase().includes(keyword.toLowerCase()) ||
          post.body.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (hasKeyword && (post.reactions?.length || 0) >= 5) {
          interestingPosts.push({
            post,
            author: followee,
            relevanceScore: post.reactions?.length || 0
          });
        }
      }
    }
    
    // Sort by relevance
    interestingPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    console.log(`📚 Curated ${interestingPosts.length} interesting posts:\n`);
    
    // Display top 5
    for (const item of interestingPosts.slice(0, 5)) {
      console.log(`📄 "${item.post.title}"`);
      console.log(`   ✍️  ${item.author.name} (@${item.author.slug})`);
      console.log(`   💖 ${item.relevanceScore} reactions`);
      console.log(`   🔗 ${item.post.canonicalUrl}`);
      console.log('');
    }
    
    // Create a curated note
    if (interestingPosts.length > 0) {
      const curatedNote = await myProfile.createNote({
        body: `📚 Weekly curated reads from my network! Found ${interestingPosts.length} interesting posts about technology and innovation. 

The community is sharing amazing insights! 🚀

#curation #technology #community`
      });
      
      console.log(`📝 Curation note published: ${curatedNote.id}`);
    }
    
    return interestingPosts;
  } catch (error) {
    console.error('Error curating content:', error.message);
  }
}
```

### Engagement Automation

```typescript
async function automatedEngagement() {
  try {
    const myProfile = await client.ownProfile();
    
    console.log('🤖 Starting automated engagement...\n');
    
    const keywords = ['great', 'excellent', 'insight', 'helpful', 'amazing'];
    const supportiveComments = [
      'Great insights! Thanks for sharing.',
      'This is really helpful. Appreciate the perspective!',
      'Excellent point! I hadn\'t thought of it that way.',
      'Really valuable content. Thanks for posting this.',
      'Insightful as always! Keep up the great work.'
    ];
    
    let engagementsCount = 0;
    const maxEngagements = 10;
    
    // Engage with recent content from network
    for await (const followee of myProfile.followees({ limit: 50 })) {
      if (engagementsCount >= maxEngagements) break;
      
      // Look at their recent posts
      for await (const post of followee.posts({ limit: 2 })) {
        if (engagementsCount >= maxEngagements) break;
        
        // Check if it's worth engaging (has some activity)
        if ((post.reactions?.length || 0) >= 3 && post.commentCount < 10) {
          try {
            // Like the post
            await post.like();
            
            // Add a supportive comment occasionally
            if (Math.random() < 0.3) { // 30% chance
              const randomComment = supportiveComments[
                Math.floor(Math.random() * supportiveComments.length)
              ];
              await post.addComment(randomComment);
              
              console.log(`💬 Commented on "${post.title}" by ${followee.name}`);
            } else {
              console.log(`💖 Liked "${post.title}" by ${followee.name}`);
            }
            
            engagementsCount++;
            
            // Add delay to be respectful
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.log(`⚠️  Failed to engage with post by ${followee.name}: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`\n✅ Completed ${engagementsCount} automated engagements`);
    
    // Create a summary note
    const summaryNote = await myProfile.createNote({
      body: `🤝 Just spent some time engaging with amazing content from my network! 

${engagementsCount} interactions with fellow creators.

Love this community! 💙 #community #engagement`
    });
    
    console.log(`📝 Summary note published: ${summaryNote.id}`);
    
  } catch (error) {
    console.error('Error in automated engagement:', error.message);
  }
}
```

## Error Handling Examples

### Robust Error Handling

```typescript
async function robustContentAccess() {
  const client = new SubstackClient({
    apiKey: process.env.SUBSTACK_API_KEY!
  });
  
  try {
    // Test connectivity first
    const isConnected = await client.testConnectivity();
    if (!isConnected) {
      throw new Error('Failed to connect to Substack API - check your authentication');
    }
    
    // Get profile with retry logic
    let profile;
    let retries = 3;
    
    while (retries > 0) {
      try {
        profile = await client.profileForSlug('example-user');
        break;
      } catch (error) {
        retries--;
        if (error.message.includes('429')) {
          console.log(`Rate limited, waiting before retry... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else if (error.message.includes('404')) {
          throw new Error('User not found');
        } else if (retries === 0) {
          throw error;
        }
      }
    }
    
    if (!profile) {
      throw new Error('Failed to get profile after retries');
    }
    
    console.log(`Successfully accessed profile: ${profile.name}`);
    
    // Access posts with individual error handling
    let successfulPosts = 0;
    let failedPosts = 0;
    
    for await (const post of profile.posts({ limit: 10 })) {
      try {
        console.log(`📄 "${post.title}"`);
        console.log(`   💖 ${post.reactions?.length || 0} reactions`);
        
        // Try to get comments (might fail for some posts)
        try {
          let commentCount = 0;
          for await (const comment of post.comments({ limit: 3 })) {
            commentCount++;
          }
          console.log(`   💬 ${commentCount} recent comments loaded`);
        } catch (commentError) {
          console.log(`   ⚠️  Comments unavailable: ${commentError.message}`);
        }
        
        successfulPosts++;
      } catch (postError) {
        console.log(`   ❌ Error accessing post: ${postError.message}`);
        failedPosts++;
      }
    }
    
    console.log(`\n📊 Results: ${successfulPosts} successful, ${failedPosts} failed`);
    
  } catch (error) {
    if (error.message.includes('401')) {
      console.error('❌ Authentication failed - check your API key');
    } else if (error.message.includes('403')) {
      console.error('❌ Permission denied - check your account permissions');
    } else if (error.message.includes('429')) {
      console.error('❌ Rate limit exceeded - please wait before trying again');
    } else if (error.message.includes('500')) {
      console.error('❌ Server error - please try again later');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
    
    // Log additional debugging info
    console.error('Error details:', {
      timestamp: new Date().toISOString(),
      userAgent: 'Substack API Client',
      error: error.message
    });
  }
}
```

## Complete Application Examples

### Newsletter Analytics Tool

```typescript
async function newsletterAnalytics() {
  const client = new SubstackClient({
    apiKey: process.env.SUBSTACK_API_KEY!
  });
  
  try {
    const myProfile = await client.ownProfile();
    
    console.log(`📊 Newsletter Analytics for ${myProfile.name}\n`);
    
    // Collect all posts for analysis
    const allPosts = [];
    for await (const post of myProfile.posts()) {
      allPosts.push(post);
    }
    
    // Basic metrics
    console.log(`📈 Overview:`);
    console.log(`   Total posts: ${allPosts.length}`);
    console.log(`   Total followers: ${myProfile.followerCount}`);
    
    // Calculate engagement metrics
    const totalReactions = allPosts.reduce((sum, post) => sum + (post.reactions?.length || 0), 0);
    const totalComments = allPosts.reduce((sum, post) => sum + post.commentCount, 0);
    
    console.log(`   Total reactions: ${totalReactions}`);
    console.log(`   Total comments: ${totalComments}`);
    console.log(`   Avg reactions per post: ${(totalReactions / allPosts.length).toFixed(1)}`);
    console.log(`   Avg comments per post: ${(totalComments / allPosts.length).toFixed(1)}\n`);
    
    // Publishing frequency
    const now = new Date();
    const periods = [
      { name: 'Last 7 days', days: 7 },
      { name: 'Last 30 days', days: 30 },
      { name: 'Last 90 days', days: 90 }
    ];
    
    console.log(`📅 Publishing Frequency:`);
    for (const period of periods) {
      const cutoff = new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000);
      const recentPosts = allPosts.filter(post => 
        post.publishedAt && post.publishedAt > cutoff
      );
      console.log(`   ${period.name}: ${recentPosts.length} posts`);
    }
    
    // Top performing content
    console.log(`\n🏆 Top Performing Posts:`);
    const topPosts = allPosts
      .sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0))
      .slice(0, 5);
    
    topPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      💖 ${post.reactions?.length || 0} reactions, 💬 ${post.commentCount} comments`);
      console.log(`      📅 ${post.publishedAt?.toLocaleDateString()}`);
    });
    
    // Engagement trends (simplified)
    console.log(`\n📊 Recent Engagement Trend:`);
    const recent10 = allPosts
      .filter(post => post.publishedAt)
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
      .slice(0, 10);
    
    const avgRecentEngagement = recent10.reduce((sum, post) => 
      sum + (post.reactions?.length || 0) + post.commentCount, 0) / recent10.length;
    
    console.log(`   Average engagement (last 10 posts): ${avgRecentEngagement.toFixed(1)}`);
    
    // Create analytics summary note
    const analyticsNote = await myProfile.createNote({
      body: `📊 Newsletter Analytics Update:

📈 ${allPosts.length} total posts published
💖 ${totalReactions} total reactions received  
💬 ${totalComments} total comments
👥 ${myProfile.followerCount} followers

Thanks for being an amazing community! 🙌

#analytics #newsletter #community`
    });
    
    console.log(`\n📝 Analytics summary note published: ${analyticsNote.id}`);
    
  } catch (error) {
    console.error('Analytics error:', error.message);
  }
}
```

These examples demonstrate the power and flexibility of the modern SubstackClient entity-based API. The entity model makes it easy to navigate relationships, interact with content, and build sophisticated applications on top of Substack's platform.
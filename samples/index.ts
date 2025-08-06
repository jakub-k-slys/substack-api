#!/usr/bin/env ts-node

/**
 * Substack API Client Example
 * 
 * This sample demonstrates real-world usage of the substack-api library.
 * It showcases authentication, profile management, content fetching, and
 * social features like following users.
 */

import { SubstackClient } from '../src'
import { config } from 'dotenv'
import { createInterface } from 'readline'

// Load environment variables
config()

/**
 * Get API credentials from environment or user input
 */
async function getCredentials(): Promise<{ apiKey: string; hostname: string }> {
  const envApiKey = process.env.SUBSTACK_API_KEY || process.env.E2E_API_KEY
  const envHostname = process.env.SUBSTACK_HOSTNAME || process.env.E2E_HOSTNAME || 'substack.com'

  if (envApiKey) {
    console.log('✅ Using API key from environment variables')
    return { apiKey: envApiKey, hostname: envHostname }
  }

  console.log('🔑 API credentials not found in environment variables')
  console.log('Please provide your Substack API credentials:')
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve)
    })
  }

  try {
    const apiKey = await question('Enter your Substack API key: ')
    const hostname = await question('Enter your Substack hostname (or press Enter for substack.com): ') || 'substack.com'
    
    rl.close()
    return { apiKey: apiKey.trim(), hostname: hostname.trim() }
  } catch (error) {
    rl.close()
    throw error
  }
}

/**
 * Main example function demonstrating Substack API usage
 */
async function runExample(): Promise<void> {
  console.log('🚀 Substack API Client Example\n')

  try {
    // 1. Get credentials and create client
    const { apiKey, hostname } = await getCredentials()
    
    if (!apiKey) {
      console.log('❌ API key is required to run this example')
      process.exit(1)
    }

    const client = new SubstackClient({
      hostname,
      apiKey
    })

    console.log(`🌐 Connected to: ${hostname}`)

    // 2. Test connectivity
    console.log('\n📡 Testing API connectivity...')
    const isConnected = await client.testConnectivity()
    
    if (!isConnected) {
      console.log('❌ Failed to connect to Substack API')
      console.log('Please check your API key and network connection')
      process.exit(1)
    }
    
    console.log('✅ API connectivity verified')

    // 3. Get own profile
    console.log('\n👤 Fetching your profile...')
    const profile = await client.ownProfile()
    
    console.log(`📋 Profile Information:`)
    console.log(`   Name: ${profile.name}`)
    console.log(`   Handle: @${profile.slug}`)
    console.log(`   URL: ${profile.url}`)
    if (profile.bio) {
      console.log(`   Bio: ${profile.bio}`)
    }

    // 4. List recent posts
    console.log('\n📰 Fetching your 3 most recent posts...')
  
    try {
      for await (const post of profile.posts({ limit: 3 })) {
        console.log(`   "${post.title}"`)
        if (post.body) {
          const bodyPreview = post.body.length > 100 ? 
            post.body.substring(0, 97) + '...' : 
            post.body
          console.log(`      Description: ${bodyPreview}`)
        }
        console.log(`      Published: ${post.publishedAt ? post.publishedAt.toLocaleDateString() : 'Unknown'}`)
        console.log(`      Author: ${post.author.name} (@${post.author.handle})`)
        console.log('')
      }
  
    } catch (error) {
      console.log(`   ⚠️  Could not fetch posts: ${(error as Error).message}`)
    }

    // 5. List recent notes
    console.log('\n📝 Fetching your 3 most recent notes...')
    try {
      for await (const note of profile.notes({ limit: 3 })) {
        const preview = note.body.length > 100 ? 
          note.body.substring(0, 97) + '...' : 
          note.body
        
        console.log(`     "${preview}"`)
        console.log(`      Date: ${note.publishedAt ? note.publishedAt.toLocaleDateString() : 'Unknown'}`)
        console.log(`      Author: ${note.author.name} (@${note.author.handle})`)
        console.log('')
      }
    
    } catch (error) {
      console.log(`   ⚠️  Could not fetch notes: ${(error as Error).message}`)
    }

    // 6. List followees
    console.log('\n🤝 Fetching users you follow...')
    try {
      for await (const followee of profile.followees({ limit: 3 })) {
        console.log(`   ${followee.name} (@${followee.slug})`)
        if (followee.bio) {
          const bioPrev = followee.bio.length > 80 ? 
            followee.bio.substring(0, 77) + '...' : 
            followee.bio
          console.log(`      Bio: ${bioPrev}`)
        }
        console.log(`      URL: ${followee.url}`)
        console.log('')
      }
      
    } catch (error) {
      console.log(`   ⚠️  Could not fetch followees: ${(error as Error).message}`)
    }

    // 7. Fetching foreign profile
    console.log('\n👤 Fetching foreign profile...')
    const foreignProfile = await client.profileForId(343074721)

    console.log(`📋 Profile Information:`)
    console.log(`   Name: ${foreignProfile.name}`)
    console.log(`   Handle: @${foreignProfile.slug}`)
    console.log(`   URL: ${foreignProfile.url}`)
    if (foreignProfile.bio) {
      console.log(`   Bio: ${foreignProfile.bio}`)
    }

    console.log('\n📝 Fetching your 3 most recent notes...')
    try {
      for await (const note of foreignProfile.notes({ limit: 3 })) {
        const preview = note.body.length > 100 ? 
          note.body.substring(0, 97) + '...' : 
          note.body
        
        console.log(`"${preview}"`)
        console.log(`      Date: ${note.publishedAt ? note.publishedAt.toLocaleDateString() : 'Unknown'}`)
        console.log(`      Author: ${note.author.name} (@${note.author.handle})`)
        console.log('')
      }
      
    } catch (error) {
      console.log(`   ⚠️  Could not fetch notes: ${(error as Error).message}`)
    }

    console.log('\n📝 Fetching your 3 most recent posts...')
    try {
      for await (const post of foreignProfile.posts({ limit: 3 })) {
        console.log(`   "${post.title}"`)
        if (post.body) {
          const bodyPreview = post.body.length > 100 ? 
            post.body.substring(0, 97) + '...' : 
            post.body
          console.log(`      Description: ${bodyPreview}`)
        }
        console.log(`      Published: ${post.publishedAt ? post.publishedAt.toLocaleDateString() : 'Unknown'}`)
        console.log(`      Author: ${post.author.name} (@${post.author.handle})`)
        console.log('')
      }
  
    } catch (error) {
      console.log(`   ⚠️  Could not fetch posts: ${(error as Error).message}`)
    }

    // 8. Fetching a full post by ID
    console.log('\n📄 Fetching a specific full post by ID...')
    try {
      const postId = 167180194 // Real post ID from sample data
      const fullPost = await client.postForId(postId)
      
      console.log(`📋 Full Post Information:`)
      console.log(`   Title: "${fullPost.title}"`)
      console.log(`   Subtitle: "${fullPost.subtitle}"`)
      console.log(`   Slug: ${fullPost.slug}`)
      console.log(`   Published: ${fullPost.publishedAt.toLocaleDateString()}`)
      console.log(`   Created: ${fullPost.createdAt.toLocaleDateString()}`)
      
      if (fullPost.htmlBody) {
        const htmlPreview = fullPost.htmlBody.length > 200 ? 
          fullPost.htmlBody.substring(0, 197) + '...' : 
          fullPost.htmlBody
        console.log(`   HTML Content: ${htmlPreview}`)
      }
      
      if (fullPost.postTags && fullPost.postTags.length > 0) {
        console.log(`   Tags: [${fullPost.postTags.join(', ')}]`)
      }
      
      if (fullPost.reactions && Object.keys(fullPost.reactions).length > 0) {
        const reactionsStr = Object.entries(fullPost.reactions)
          .map(([emoji, count]) => `${emoji}: ${count}`)
          .join(', ')
        console.log(`   Reactions: {${reactionsStr}}`)
      }
      
      if (fullPost.restacks !== undefined) {
        console.log(`   Restacks: ${fullPost.restacks}`)
      }
      
      if (fullPost.coverImage) {
        console.log(`   Cover Image: ${fullPost.coverImage}`)
      }
      
    } catch (error) {
      console.log(`   ⚠️  Could not fetch full post: ${(error as Error).message}`)
    }

    // 9. Creating notes (COMMENTED OUT - uncomment to test note creation)
    /*
    console.log('\n📝 Note Creation Examples (commented out to prevent accidental publishing)')

    // Example: Create a simple note
    console.log('\n📝 Creating a simple note...')
    try {
      const noteResponse = await profile
        .newNote()
        .paragraph()
        .text('This is a test note created via the ')
        .bold('Substack API')
        .text('! 🚀')
        .paragraph()
        .text('It supports various formatting options like ')
        .italic('italic text')
        .text(', ')
        .code('code snippets')
        .text(', and ')
        .link('external links', 'https://substack.com')
        .text('.')
        .publish()

      console.log(`✅ Note published successfully!`)
      console.log(`   Note ID: ${noteResponse.id}`)
      console.log(`   Published at: ${noteResponse.date}`)
      
    } catch (error) {
      console.log(`   ❌ Failed to create note: ${(error as Error).message}`)
    }

    // Example: Create a note with link attachment
    console.log('\n🔗 Creating a note with link attachment...')
    try {
      const noteWithLinkResponse = await profile
        .newNoteWithLink('https://iam.slys.dev/p/friends-bring-friends')
        .paragraph()
        .text('Check out the ')
        .bold('Substack API documentation')
        .text(' - it has everything you need to get started!')
        .paragraph()
        .text('Key features covered:')
        .bulletList()
        .item()
        .text('Authentication and setup')
        .item()
        .text('Profile and content management')
        .item()
        .text('Social features like following users')
        .item()
        .text('Advanced formatting options')
        .finish()
        .paragraph()
        .text('The link is automatically attached to this note. 📎')
        .publish()

      console.log(`✅ Note with link attachment published successfully!`)
      console.log(`   Note ID: ${noteWithLinkResponse.id}`)
      console.log(`   Published at: ${noteWithLinkResponse.date}`)
      console.log(`   Attachments: ${noteWithLinkResponse.attachments?.length || 0}`)
      
    } catch (error) {
      console.log(`   ❌ Failed to create note with link: ${(error as Error).message}`)
    }

    // Example: Create a complex formatted note
    console.log('\n✨ Creating a complex formatted note...')
    try {
      const complexNoteResponse = await profile
        .newNote()
        .paragraph()
        .text('🎯 ')
        .bold('Weekly Development Update')
        .paragraph()
        .text('This week I focused on:')
        .numberedList()
        .item()
        .bold('API Integration')
        .text(' - Connected to ')
        .link('Substack API', 'https://substack.com/api')
        .item()
        .italic('Code Quality')
        .text(' - Added comprehensive ')
        .code('unit tests')
        .item()
        .underline('Documentation')
        .text(' - Updated README and examples')
        .finish()
        .paragraph()
        .text('Next week\'s priorities:')
        .bulletList()
        .item()
        .text('Performance optimization')
        .item()
        .text('Error handling improvements')
        .item()
        .text('Integration testing')
        .finish()
        .paragraph()
        .text('Feel free to reach out with any questions! 💬')
        .publish()

      console.log(`✅ Complex formatted note published successfully!`)
      console.log(`   Note ID: ${complexNoteResponse.id}`)
      console.log(`   Content length: ${complexNoteResponse.body?.length || 0} characters`)
      
    } catch (error) {
      console.log(`   ❌ Failed to create complex note: ${(error as Error).message}`)
    }

    console.log('   💡 To test note creation, uncomment the examples above')
    console.log('   ⚠️  Warning: Uncommenting will publish real notes to your Substack!')
    */
    console.log('\n✨ Example completed successfully!')
    console.log('💡 This example demonstrates basic Substack API usage.')
    console.log('   For more advanced features, check out the full documentation.')

  } catch (error) {
    console.error('\n❌ Error running example:')
    console.error((error as Error).message)
    
    if ((error as Error).message.includes('401') || (error as Error).message.includes('Unauthorized')) {
      console.error('\n💡 This might be an authentication issue. Please check:')
      console.error('   • Your API key is correct')
      console.error('   • Your hostname is correct')
      console.error('   • Your API key has the necessary permissions')
    }
    
    process.exit(1)
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample().catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}

export { runExample }
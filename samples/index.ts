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

    console.log('\n✨ Example completed successfully!')
    console.log('\n💡 This example demonstrates basic Substack API usage.')
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
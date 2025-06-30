# Samples

This directory contains example applications that demonstrate how to use the Substack API client library.

## Running the Example

### Option 1: Using environment variables

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Substack API credentials:
   ```
   SUBSTACK_API_KEY=your-api-key-here
   SUBSTACK_HOSTNAME=your-publication.substack.com
   ```

3. Run the sample:
   ```bash
   npm run sample
   ```

### Option 2: Interactive mode

If you don't have a `.env` file, the sample will prompt you for credentials:

```bash
npm run sample
```

## What the Example Demonstrates

The `index.ts` example showcases the following features:

1. **🔐 Authentication** - Connecting with API key and publication hostname
2. **📡 Connectivity Testing** - Verifying the API connection works
3. **👤 Profile Management** - Fetching your own profile information
4. **📰 Content Fetching** - Listing recent posts with titles and metadata
5. **📝 Notes Management** - Retrieving and displaying recent notes
6. **🤝 Social Features** - Listing users you follow (followees)

## Example Output

```
🚀 Substack API Client Example

✅ Using API key from environment variables
🌐 Connected to: yourpub.substack.com

📡 Testing API connectivity...
✅ API connectivity verified

👤 Fetching your profile...
📋 Profile Information:
   Name: Your Name
   Handle: @yourhandle
   URL: https://substack.com/@yourhandle

📰 Fetching your 3 most recent posts...
   1. "Your Latest Post Title"
      Description: This is a preview of your post content...
      Published: 12/30/2024
      Author: Your Name (@yourhandle)

📝 Fetching your 3 most recent notes...
   1. "This is a sample note with some content that might be longer than the preview..."
      Date: 12/30/2024
      Author: Your Name (@yourhandle)

🤝 Fetching users you follow...
   1. Example Author (@exampleauthor)
      Bio: This is an example author bio...
      URL: https://substack.com/@exampleauthor

✨ Example completed successfully!
```

## Requirements

- Node.js 14+
- Valid Substack API credentials
- A Substack publication (for some features)

## Troubleshooting

If you encounter authentication errors:

- Verify your API key is correct
- Ensure your hostname matches your publication
- Check that your API key has the necessary permissions

For more information, see the main project documentation.
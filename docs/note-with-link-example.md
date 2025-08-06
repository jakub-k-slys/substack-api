# Note with Link Attachment Example

This example demonstrates how to use the new `newNoteWithLink` feature to create and publish notes with link attachments.

## Basic Usage

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  apiKey: 'your-api-key',
  hostname: 'your-publication.substack.com'
});

const ownProfile = await client.ownProfile();

// Create a note with a link attachment
const response = await ownProfile
  .newNoteWithLink('https://iam.slys.dev/p/understanding-locking-contention')
  .paragraph()
  .text('Check out this interesting article about ')
  .bold('locking contention')
  .text(' in computing systems!')
  .paragraph()
  .text('It covers important concepts that every developer should know.')
  .publish();

console.log('Note published with ID:', response.id);
```

## How it Works

1. **Attachment Creation**: When you call `publish()` on a `NoteWithLinkBuilder`, it first creates an attachment by making a POST request to `/api/v1/comment/attachment` with the link URL.

2. **Note Publishing**: After the attachment is created successfully, it publishes the note with the attachment ID included in the `attachmentIds` array.

## API Calls Made

The above example makes two API calls:

1. **Create Attachment**:
   ```
   POST /api/v1/comment/attachment
   {
     "url": "https://iam.slys.dev/p/understanding-locking-contention",
     "type": "link"
   }
   ```
   
   Response:
   ```json
   {
     "id": "19b5d6f9-46db-47d6-b381-17cb5f443c00",
     "type": "post",
     "publication": { ... },
     "post": { ... }
   }
   ```

2. **Publish Note**:
   ```
   POST /api/v1/comment/feed
   {
     "bodyJson": {
       "type": "doc",
       "attrs": { "schemaVersion": "v1" },
       "content": [...]
     },
     "attachmentIds": ["19b5d6f9-46db-47d6-b381-17cb5f443c00"],
     "tabId": "for-you",
     "surface": "feed",
     "replyMinimumRole": "everyone"
   }
   ```

## Error Handling

If the attachment creation fails, the note will not be published:

```typescript
try {
  const response = await ownProfile
    .newNoteWithLink('https://invalid-url')
    .paragraph()
    .text('This will fail')
    .publish();
} catch (error) {
  console.error('Failed to create attachment or publish note:', error.message);
}
```

## Comparison with Regular Notes

For comparison, here's how you would create a regular note without a link attachment:

```typescript
// Regular note (no attachment)
const regularNote = await ownProfile
  .newNote()
  .paragraph()
  .text('This is a regular note without attachments')
  .publish();

// Note with link attachment  
const noteWithLink = await ownProfile
  .newNoteWithLink('https://example.com')
  .paragraph()
  .text('This note will have a link attachment')
  .publish();
```

The `NoteWithLinkBuilder` supports all the same formatting options as the regular `NoteBuilder` (bold, italic, links, lists, etc.), but automatically handles the attachment creation process.
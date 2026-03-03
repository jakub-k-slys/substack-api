# Note with Link Attachment

Use `newNoteWithLink()` to publish a note with a URL attached. The link is sent as an attachment field alongside the Markdown content.

## Basic Usage

```typescript
import { SubstackClient } from 'substack-api';

const token = btoa(JSON.stringify({
  substack_sid: process.env.SUBSTACK_SID!,
  connect_sid: process.env.CONNECT_SID!
}));

const client = new SubstackClient({
  publicationUrl: 'yourname.substack.com',
  token
});

const me = await client.ownProfile();

const response = await me
  .newNoteWithLink('https://example.com/interesting-article')
  .paragraph()
  .text('Check out this article about ')
  .bold('distributed systems')
  .text(' — highly recommend.')
  .publish();

console.log('Published note ID:', response.id);
```

## How it Works

When you call `publish()` on a `NoteWithLinkBuilder`, the client sends a single POST to `/notes` on the gateway with:

```json
{
  "content": "Check out this article about **distributed systems** — highly recommend.",
  "attachment": "https://example.com/interesting-article"
}
```

The gateway handles the attachment resolution and note publishing.

## Comparison with Regular Notes

```typescript
// Regular note — no attachment
await me.newNote()
  .paragraph()
  .text('Just a thought.')
  .publish();

// Note with link attachment
await me.newNoteWithLink('https://example.com/article')
  .paragraph()
  .text('Worth reading.')
  .publish();
```

`NoteWithLinkBuilder` supports all the same formatting as `NoteBuilder`: bold, italic, links, lists, multiple paragraphs, etc.

## Error Handling

```typescript
try {
  await me
    .newNoteWithLink('https://example.com/article')
    .paragraph()
    .text('New post is live!')
    .publish();
} catch (error) {
  console.error('Failed to publish:', error.message);
}
```

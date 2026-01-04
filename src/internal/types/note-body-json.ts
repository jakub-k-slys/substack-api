export interface NoteBodyJson {
  type: 'doc'
  attrs: {
    schemaVersion: 'v1'
  }
  content: Array<
    | {
        type: 'paragraph'
        content: Array<{
          type: 'text'
          text: string
          marks?: Array<{
            type: 'bold' | 'italic' | 'code' | 'underline' | 'link'
            attrs?: { href: string } // For link marks
          }>
        }>
      }
    | {
        type: 'bulletList' | 'orderedList'
        content: Array<{
          type: 'listItem'
          content: Array<{
            type: 'paragraph'
            content: Array<{
              type: 'text'
              text: string
              marks?: Array<{
                type: 'bold' | 'italic' | 'code' | 'underline' | 'link'
                attrs?: { href: string } // For link marks
              }>
            }>
          }>
        }>
      }
  >
}

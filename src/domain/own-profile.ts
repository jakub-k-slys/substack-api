import { Profile } from '@substackular/domain/profile'
import { Note } from '@substackular/domain/note'
import { NoteBuilder, NoteWithLinkBuilder } from '@substackular/domain/note-builder'
import { parseMarkdownNote } from '@substackular/internal/markdown'
import type { SubstackFullProfile, PublishNoteResponse } from '@substackular/internal'
import type { HttpClient } from '@substackular/internal/http-client'
import type {
  ProfileService,
  PostService,
  NoteService,
  FollowingService,
  CommentService,
  NewNoteService
} from '@substackular/internal/services'

/**
 * OwnProfile extends Profile with write capabilities for the authenticated user
 */
export class OwnProfile extends Profile {
  constructor(
    rawData: SubstackFullProfile,
    publicationClient: HttpClient,
    profileService: ProfileService,
    postService: PostService,
    noteService: NoteService,
    commentService: CommentService,
    private readonly followingService: FollowingService,
    private readonly newNoteService: NewNoteService,
    perPage: number,
    resolvedSlug?: string
  ) {
    super(
      rawData,
      publicationClient,
      profileService,
      postService,
      noteService,
      commentService,
      perPage,
      resolvedSlug
    )
  }

  /**
   * Create a new note using the builder pattern
   */
  newNote(): NoteBuilder {
    return this.newNoteService.newNote()
  }

  /**
   * Create a new note with a link attachment using the builder pattern
   */
  newNoteWithLink(link: string): NoteWithLinkBuilder {
    return this.newNoteService.newNoteWithLink(link)
  }

  /**
   * Publish a note from a Markdown string.
   *
   * Supports **bold**, *italic*, `code`, [text](url) links, # headings
   * (rendered bold), and -/1. lists. Blocks are separated by blank lines.
   * Pass options.attachmentUrl to attach a link preview card.
   */
  async publishNote(
    markdown: string,
    options: { attachmentUrl?: string } = {}
  ): Promise<PublishNoteResponse> {
    const paragraphs = parseMarkdownNote(markdown)
    const seed: NoteBuilder = options.attachmentUrl
      ? this.newNoteService.newNoteWithLink(options.attachmentUrl)
      : this.newNoteService.newNote()
    const builder = paragraphs.reduce<NoteBuilder>((b, p) => b.addParagraph(p), seed)
    return builder.publish()
  }

  /**
   * Delete one of the authenticated user's notes by ID
   */
  async deleteNote(noteId: number | string): Promise<void> {
    await this.noteService.deleteNote(noteId)
  }

  /**
   * Get users that the authenticated user follows
   */
  async *following(options: { limit?: number } = {}): AsyncIterable<Profile> {
    const followingUsers = await this.followingService.getFollowing()

    let count = 0
    for (const user of followingUsers) {
      if (options.limit && count >= options.limit) break

      try {
        const profileResponse = await this.profileService.getProfileBySlug(user.handle)
        yield new Profile(
          profileResponse,
          this.publicationClient,
          this.profileService,
          this.postService,
          this.noteService,
          this.commentService,
          this.perPage,
          user.handle
        )
        count++
      } catch {
        /* empty */
      }
    }
  }

  /**
   * Get notes from the authenticated user's profile
   */
  async *notes(options: { limit?: number } = {}): AsyncIterable<Note> {
    try {
      let cursor: string | undefined = undefined
      let totalYielded = 0

      while (true) {
        // Use NoteService to fetch notes for the authenticated user with cursor-based pagination
        const paginatedNotes = await this.noteService.getNotesForLoggedUser({
          cursor
        })

        if (!paginatedNotes.notes) {
          break // No more notes to fetch
        }

        for (const noteData of paginatedNotes.notes) {
          if (options.limit && totalYielded >= options.limit) {
            return // Stop if we've reached the requested limit
          }
          yield new Note(noteData, this.publicationClient)
          totalYielded++
        }

        // If there's no next cursor, we've reached the end
        if (!paginatedNotes.nextCursor) {
          break
        }

        cursor = paginatedNotes.nextCursor
      }
    } catch {
      // If the endpoint doesn't exist or fails, return empty iterator
      yield* []
    }
  }
}

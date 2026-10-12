// Types partagés du domaine Plume.
// (Anciennement dans src/lib/plume.ts — découpé par responsabilité.)

export interface Chapter {
  id: string
  title: string
  content: string
  word_count?: number
}

export interface AuthorRef {
  id: string
  username: string
  display_name: string
  avatar_emoji: string
  avatar_color: string
  avatar_image: string
}

export interface CoverStyle {
  mode?: string
  preset: string
  font: string
  pattern: string
  layout: string
  emoji: string
  textColor: string
  image: string
}

export interface Book {
  id: string
  owner_id: string
  owner_name: string
  author: string
  title: string
  genre: string
  description: string
  cover: string
  cover_style: Partial<CoverStyle>
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
  views: number
  impressions: number
  likes: number
  comments: number
  chapter_count?: number
  chapters: Chapter[]
  owner: AuthorRef
}

export interface Recommendation {
  book: Book
  reason: string
  score: number
}

export interface User {
  id: string
  username: string
  display_name: string
  name: string
  bio: string
  avatar_emoji: string
  avatar_color: string
  avatar_image: string
  banner_image: string
  banner_color: string
  preferences: string[]
  onboarded: boolean
  profile_visibility: 'public' | 'followers' | 'private'
  created_at: string
  email?: string
  referral_source?: string
}

export interface ProfileStats {
  books: number
  published: number
  drafts: number
  chapters: number
  words: number
  booksRead: number
  wordsRead: number
  views: number
  impressions: number
  likes: number
  commentLikes: number
  likesReceived: number
  comments: number
}

export interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  likes: number
  liked: boolean
  author: AuthorRef
}

export interface AnalyticsBook {
  id: string
  title: string
  genre: string
  is_public: boolean
  published: boolean
  chapters: number
  words: number
  views: number
  impressions: number
  likes: number
  comments: number
}

export interface Analytics {
  summary: ProfileStats
  books: AnalyticsBook[]
  likesTrend: { day: string; likes: number }[]
}

export interface ReadingBook extends Book {
  last_read_at: string
  read_count: number
  chapters_read: number
  finished: boolean
}

export interface Notification {
  id: string
  type: 'like' | 'comment' | 'comment_like' | 'follow' | 'follow_request' | 'follow_accepted'
  read: boolean
  created_at: string
  book_id: string | null
  book_title: string | null
  actor: AuthorRef | null
}

export interface BookInput {
  title: string
  author: string
  genre: string
  description: string
  cover: string
  cover_style?: Partial<CoverStyle>
  tags?: string[]
  is_public?: boolean
}

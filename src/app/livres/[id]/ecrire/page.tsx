'use client'

import { useParams } from 'next/navigation'
import { ChapterEditor } from '@/components/chapter-editor'

export default function NewChapterPage() {
  const { id } = useParams<{ id: string }>()
  return <ChapterEditor bookId={id} chapterId="new" />
}

'use client'

import { useParams } from 'next/navigation'
import { ChapterEditor } from '@/components/chapter-editor'

export default function EditChapterPage() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>()
  return <ChapterEditor bookId={id} chapterId={chapterId} />
}

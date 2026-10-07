import type { Book } from './plume'

function slug(s: string): string {
  return (s || 'livre')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function stripHtml(html: string): string {
  return String(html ?? '')
    .replace(/<\/(p|div|h1|h2|h3|li|blockquote|pre)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function bookToText(book: Book): string {
  const lines: string[] = [book.title, `par ${book.author}`, book.genre, '']
  if (book.description) lines.push(book.description, '')
  lines.push('— — —', '')
  for (const ch of book.chapters ?? []) {
    lines.push(ch.title || 'Sans titre', '', stripHtml(ch.content), '', '')
  }
  return lines.join('\n')
}

function bookToMarkdown(book: Book): string {
  const lines: string[] = [`# ${book.title}`, '', `*par ${book.author} — ${book.genre}*`, '']
  if (book.description) lines.push(`> ${book.description}`, '')
  lines.push('---')
  for (const ch of book.chapters ?? []) {
    lines.push('', `## ${ch.title || 'Sans titre'}`, '', stripHtml(ch.content), '')
  }
  return lines.join('\n')
}

export function exportBook(book: Book, format: 'txt' | 'md') {
  const base = slug(book.title)
  if (format === 'md') download(`${base}.md`, bookToMarkdown(book))
  else download(`${base}.txt`, bookToText(book))
}

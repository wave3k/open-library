export function download(filename, text) {
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

function slug(s) {
  return (s || 'livre')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function bookToText(book) {
  const lines = []
  lines.push(book.title)
  lines.push(`par ${book.author}`)
  lines.push(`${book.genre}`)
  lines.push('')
  if (book.description) {
    lines.push(book.description)
    lines.push('')
  }
  lines.push('— — —')
  lines.push('')
  for (const ch of book.chapters ?? []) {
    lines.push(ch.title || 'Sans titre')
    lines.push('')
    lines.push(ch.content || '')
    lines.push('')
    lines.push('')
  }
  return lines.join('\n')
}

export function bookToMarkdown(book) {
  const lines = []
  lines.push(`# ${book.title}`)
  lines.push('')
  lines.push(`*par ${book.author} — ${book.genre}*`)
  lines.push('')
  if (book.description) {
    lines.push(`> ${book.description}`)
    lines.push('')
  }
  lines.push('---')
  for (const ch of book.chapters ?? []) {
    lines.push('')
    lines.push(`## ${ch.title || 'Sans titre'}`)
    lines.push('')
    lines.push(ch.content || '')
    lines.push('')
  }
  return lines.join('\n')
}

export function exportBook(book, format) {
  const base = slug(book.title)
  if (format === 'md') {
    download(`${base}.md`, bookToMarkdown(book))
  } else {
    download(`${base}.txt`, bookToText(book))
  }
}

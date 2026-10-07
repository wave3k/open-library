const TOKEN_KEY = 'plume-token'
const USER_KEY = 'plume-user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(user, token) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearSession() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    // réponse non-JSON
  }
  if (!res.ok) {
    throw new Error(data?.error || `Erreur ${res.status}, réessaie.`)
  }
  return data
}

export const AuthAPI = {
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  logout: () => request('/api/auth/logout', { method: 'POST' }).catch(() => ({})),
  me: () => request('/api/me'),
}

export const BooksAPI = {
  mine: () => request('/api/books?scope=mine').then((d) => d.books),
  explore: () => request('/api/books?scope=explore').then((d) => d.books),
  create: (payload) => request('/api/books', { method: 'POST', body: payload }).then((d) => d.book),
  update: (id, payload) => request(`/api/books/${id}`, { method: 'PUT', body: payload }).then((d) => d.book),
  remove: (id) => request(`/api/books/${id}`, { method: 'DELETE' }),
  importLocal: (books) => request('/api/books/import', { method: 'POST', body: { books } }),
  addChapter: (bookId, payload) =>
    request(`/api/books/${bookId}/chapters`, { method: 'POST', body: payload }).then((d) => d.book),
  updateChapter: (bookId, chId, payload) =>
    request(`/api/books/${bookId}/chapters/${chId}`, { method: 'PUT', body: payload }).then((d) => d.book),
  removeChapter: (bookId, chId) =>
    request(`/api/books/${bookId}/chapters/${chId}`, { method: 'DELETE' }).then((d) => d.book),
  reorder: (bookId, ids) =>
    request(`/api/books/${bookId}/chapters/reorder`, { method: 'POST', body: { ids } }).then((d) => d.book),
}

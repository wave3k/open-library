import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canViewProfileContent, loadAccessibleBook, canDeleteComment, LIMITS } from '../lib/domain.js'

// Faux client D1 : renvoie les lignes de `queue` dans l'ordre des appels `.first()`.
function fakeDb(queue) {
  const rows = [...queue]
  return {
    prepare() {
      return { bind() { return { first: async () => rows.shift() ?? null } } }
    },
  }
}

test('canViewProfileContent applique la visibilité', () => {
  assert.equal(canViewProfileContent({ isSelf: true, visibility: 'private', isFollowing: false }), true)
  assert.equal(canViewProfileContent({ isSelf: false, visibility: 'public', isFollowing: false }), true)
  assert.equal(canViewProfileContent({ isSelf: false, visibility: 'followers', isFollowing: true }), true)
  assert.equal(canViewProfileContent({ isSelf: false, visibility: 'followers', isFollowing: false }), false)
  assert.equal(canViewProfileContent({ isSelf: false, visibility: 'private', isFollowing: true }), false)
})

test('loadAccessibleBook reflète la règle public / propriétaire', async () => {
  assert.deepEqual(await loadAccessibleBook(fakeDb([{ owner_id: 'u', is_public: 1 }]), 'b', 'other'), { owner_id: 'u', is_public: 1, allowed: true })
  assert.deepEqual(await loadAccessibleBook(fakeDb([{ owner_id: 'u', is_public: 0 }]), 'b', 'u'), { owner_id: 'u', is_public: 0, allowed: true })
  assert.deepEqual(await loadAccessibleBook(fakeDb([{ owner_id: 'u', is_public: 0 }]), 'b', 'other'), { owner_id: 'u', is_public: 0, allowed: false })
  assert.equal(await loadAccessibleBook(fakeDb([null]), 'b', 'u'), null)
})

test('canDeleteComment : auteur du commentaire ou propriétaire du livre', async () => {
  assert.deepEqual(await canDeleteComment(fakeDb([{ user_id: 'u' }]), 'c', 'b', 'u'), { found: true, allowed: true })
  assert.deepEqual(await canDeleteComment(fakeDb([{ user_id: 'x' }, { owner_id: 'u' }]), 'c', 'b', 'u'), { found: true, allowed: true })
  assert.deepEqual(await canDeleteComment(fakeDb([{ user_id: 'x' }, { owner_id: 'y' }]), 'c', 'b', 'u'), { found: true, allowed: false })
  assert.deepEqual(await canDeleteComment(fakeDb([null]), 'c', 'b', 'u'), { found: false, allowed: false })
})

test('LIMITS expose des bornes cohérentes', () => {
  assert.ok(LIMITS.RATE_LOGIN.limit > 0)
  assert.ok(LIMITS.MAX_UPLOAD_BYTES > 0)
})

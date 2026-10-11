import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword, slugUsername, publicProfile } from '../auth.js'

test('hashPassword / verifyPassword : aller-retour correct', async () => {
  const { salt, hash } = await hashPassword('motdepasse123')
  assert.equal(await verifyPassword('motdepasse123', salt, hash), true)
  assert.equal(await verifyPassword('mauvais', salt, hash), false)
})

test('hashPassword utilise un sel aléatoire (deux hash différents)', async () => {
  const a = await hashPassword('meme-mdp')
  const b = await hashPassword('meme-mdp')
  assert.notEqual(a.salt, b.salt)
  assert.notEqual(a.hash, b.hash)
})

test('slugUsername produit un identifiant normalisé', () => {
  assert.match(slugUsername('Émile Durand'), /^[a-z0-9_]+$/)
  assert.match(slugUsername(''), /^[a-z0-9_]+$/)
})

test('publicProfile masque l’e-mail sauf pour soi-même', () => {
  const row = { id: '1', email: 'a@b.c', username: 'x', display_name: 'X', preferences: '["Romance"]' }
  assert.equal(publicProfile(row).email, undefined)
  assert.equal(publicProfile(row, { self: true }).email, 'a@b.c')
  assert.deepEqual(publicProfile(row, { self: true }).preferences, ['Romance'])
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeHtml, wordCountOf } from '../sanitize.js'

test('supprime les balises script et leur contenu', () => {
  assert.equal(sanitizeHtml('<p>ok</p><script>alert(1)</script>'), '<p>ok</p>')
})

test('supprime les balises non autorisées (vecteurs XSS)', () => {
  assert.equal(sanitizeHtml('<img src=x onerror=alert(1)>'), '')
  assert.equal(sanitizeHtml('<a href="javascript:alert(1)">x</a>'), 'x')
  assert.equal(sanitizeHtml('<iframe src="evil"></iframe>'), '')
  assert.equal(sanitizeHtml('<style>body{}</style><p>a</p>'), '<p>a</p>')
})

test('conserve les balises autorisées mais retire tous les attributs', () => {
  assert.equal(sanitizeHtml('<p class="x">a</p><strong id="y">b</strong>'), '<p>a</p><strong>b</strong>')
  assert.equal(sanitizeHtml('<a href="/x">lien</a>'), 'lien')
})

test('retire les commentaires HTML', () => {
  assert.equal(sanitizeHtml('<p>a</p><!-- secret --><p>b</p>'), '<p>a</p><p>b</p>')
})

test('wordCountOf compte les mots hors balises', () => {
  assert.equal(wordCountOf('<p>un deux trois</p>'), 3)
  assert.equal(wordCountOf('<p>a&nbsp;b</p>'), 2)
  assert.equal(wordCountOf(''), 0)
})

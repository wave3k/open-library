import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseArr, parseObj, detectImage } from '../lib/util.js'

test('parseArr tolère les entrées invalides', () => {
  assert.deepEqual(parseArr('[1,2]'), [1, 2])
  assert.deepEqual(parseArr('nope'), [])
  assert.deepEqual(parseArr(null), [])
  assert.deepEqual(parseArr('{"a":1}'), [])
})

test('parseObj tolère les entrées invalides', () => {
  assert.deepEqual(parseObj('{"a":1}'), { a: 1 })
  assert.deepEqual(parseObj('[1]'), {})
  assert.deepEqual(parseObj(null), {})
})

test('detectImage identifie le type par ses magic bytes', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0])
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0, 0, 0, 0, 0, 0, 0, 0])
  assert.equal(detectImage(png), 'png')
  assert.equal(detectImage(jpg), 'jpg')
  assert.equal(detectImage(gif), 'gif')
  assert.equal(detectImage(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])), null)
})

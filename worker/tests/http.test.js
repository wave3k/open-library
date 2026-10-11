import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clientIp } from '../lib/http.js'

test('clientIp ignore le premier maillon falsifiable de X-Forwarded-For', () => {
  const req = new Request('https://x/', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })
  assert.equal(clientIp(req), '5.6.7.8')
})

test('clientIp retombe sur cf-connecting-ip sans X-Forwarded-For', () => {
  const req = new Request('https://x/', { headers: { 'cf-connecting-ip': '9.9.9.9' } })
  assert.equal(clientIp(req), '9.9.9.9')
})

test('clientIp vaut "unknown" en l’absence de tout en-tête', () => {
  assert.equal(clientIp(new Request('https://x/')), 'unknown')
})

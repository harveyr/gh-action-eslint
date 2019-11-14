/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { parseEslintLine, shouldIgnoreLine } from '../src/eslint'

test('eslint parsing', () => {
  const parsed = parseEslintLine(
    '/Users/john.bob/dev/gh-action-eslint/src/main.ts: line 7, col 16, Error - Require statement not part of import statement. (@typescript-eslint/no-var-requires)',
  )
  expect(parsed!.filePath).toEqual(
    '/Users/john.bob/dev/gh-action-eslint/src/main.ts',
  )
  expect(parsed!.line).toEqual(7)
  expect(parsed!.column).toEqual(16)
  expect(parsed!.severity).toEqual('error')
  expect(parsed!.message).toEqual(
    'Require statement not part of import statement. (@typescript-eslint/no-var-requires)',
  )
})

test('line ignoring', () => {
  expect(shouldIgnoreLine('1 problem')).toBe(true)
  expect(shouldIgnoreLine('1 problems')).toBe(true)
  expect(shouldIgnoreLine('4 problems')).toBe(true)
  expect(shouldIgnoreLine('4 problemz')).toBe(false)
  expect(shouldIgnoreLine(' 4 problems')).toBe(false)
})

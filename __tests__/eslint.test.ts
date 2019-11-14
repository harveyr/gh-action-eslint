import {parseEslintLine} from '../src/eslint'

test('dummy', () => {
  const parsed = parseEslintLine("/Users/john.bob/dev/gh-action-eslint/src/main.ts: line 7, col 16, Error - Require statement not part of import statement. (@typescript-eslint/no-var-requires)")
  expect(parsed!.filePath).toEqual('/Users/john.bob/dev/gh-action-eslint/src/main.ts')
  expect(parsed!.line).toEqual(7)
  expect(parsed!.column).toEqual(16)
  expect(parsed!.severity).toEqual('error')
  expect(parsed!.message).toEqual('Require statement not part of import statement. (@typescript-eslint/no-var-requires)')
})

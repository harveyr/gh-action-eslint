import * as checks from '../src/checks'
import { Lint } from '../src/types'

test('get check run conclusion', () => {
  const lint: Lint = {
    filePath: 'asdf',
    line: 1,
    column: 1,
    severity: 'notice',
    message: 'asdf',
  }
  expect(checks.getCheckRunConclusion([])).toEqual('success')
  expect(checks.getCheckRunConclusion([lint])).toEqual('neutral')
  expect(
    checks.getCheckRunConclusion([lint, { ...lint, severity: 'warning' }]),
  ).toEqual('neutral')
  expect(
    checks.getCheckRunConclusion([
      lint,
      { ...lint, severity: 'warning' },
      { ...lint, severity: 'error' },
    ]),
  ).toEqual('failure')
})

import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'
import { Lint } from './types'

const ESLINT_PATH = 'node_modules/.bin/eslint'

const ESLINT_REGEXP = /(\S+): line (\d+), col (\d+), (\w+) - (.+)/

const IGNORE_LINE_REGEXPS = [/^\d+ problems?$/i]

export function shouldIgnoreLine(line: string): boolean {
  const match = IGNORE_LINE_REGEXPS.find(regexp => {
    return regexp.test(line)
  })
  return Boolean(match)
}

export function parseEslintLine(line: string): Lint | null {
  line = line.trim()
  if (!line) {
    return null
  }

  const match = ESLINT_REGEXP.exec(line)

  if (!match || !match.length) {
    if (!shouldIgnoreLine(line)) {
      core.warning(`No match found for ESLint line: ${line}`)
    }
    return null
  }

  return {
    filePath: match[1],
    line: parseInt(match[2], 10),
    column: parseInt(match[3], 10),
    severity: match[4].toLowerCase(),
    message: match[5],
  }
}

export async function getEslintVersion(
  opt: kit.ExecOptions = {},
): Promise<string> {
  opt.failOnStdErr = true
  const { stdout } = await kit.execAndCapture(
    'node',
    [ESLINT_PATH, '--version'],
    opt,
  )
  return stdout
}

export async function runEslint(
  patterns: string[],
  opt: kit.ExecOptions = {},
): Promise<string> {
  opt.failOnStdErr = false
  const args = [ESLINT_PATH, '--format=compact'].concat(patterns)
  const { stdout, stderr } = await kit.execAndCapture('node', args, opt)

  const lines = stderr.split('\n')
  const lints: Lint[] = []
  for (const line of lines) {
    const lint = parseEslintLine(line)
    if (lint) {
      lints.push(lint)
    }
  }

  return stdout + stderr
}

export function parseEslints(output: string): Lint[] {
  const lines = output.split('\n')
  const lints: Lint[] = []
  for (const line of lines) {
    const lint = parseEslintLine(line)
    if (lint) {
      lints.push(lint)
    }
  }
  return lints
}

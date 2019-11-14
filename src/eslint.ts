import * as core from '@actions/core'
import { ExecOptions, captureOutput } from './exec'

const ESLINT_REGEXP = /(\S+): line (\d+), col (\d+), (\w+) - (.+)/

export interface Lint {
  filePath: string
  line: number
  column: number
  severity: string
  message: string
}

export async function getEslintVersion() {
  const { stdout } = await captureOutput('npx', ['eslint', '--version'], {
    failOnStdErr: true,
  })
  return stdout
}

export async function runEslint(
  patterns: string[],
  opt: ExecOptions = {},
): Promise<string> {
  opt.failOnStdErr = false
  const args = [
    'node_modules/.bin/eslint',
    '--format=compact',
    '--quiet',
  ].concat(patterns)
  const { stdout, stderr } = await captureOutput('node', args, opt)

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

export function parseEslints(
  output: string
): Lint[] {
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

export function parseEslintLine(line: string): Lint | null {
  const match = ESLINT_REGEXP.exec(line)

  if (!match || !match.length) {
    core.warning(`No match found for line: ${line}`)
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

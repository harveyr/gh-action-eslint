import * as exec from '@actions/exec'

interface CommandOutput {
  stdout: string
  stderr: string
}

export interface ExecOptions {
  cwd?: string
  failOnStderr?: boolean
}

export async function captureOutput(
  command: string,
  args: string[],
  opt: ExecOptions = {},
): Promise<CommandOutput> {
  let stdout = ''
  let stderr = ''

  const {cwd} = opt

  await exec.exec(command, args, {
    cwd,
    listeners: {
      stdout: (data: Buffer): void => {
        stdout += data.toString()
      },
      stderr: (data: Buffer): void => {
        stderr += data.toString()
      },
    },
  })
  stdout = stdout.trim()
  stderr = stderr.trim()

  if (opt.failOnStderr && stderr.length) {
    throw new Error('Command failed (stderr was not empty)')
  }

  return { stdout, stderr }
}

import * as exec from '@actions/exec'

interface CommandOutput {
  stdout: string
  stderr: string
}

interface ExecOptions {
  failOnStderr?: boolean
}

export async function captureOutput(
  command: string,
  args: string[],
  opts: ExecOptions = {},
): Promise<CommandOutput> {
  let stdout = ''
  let stderr = ''
  await exec.exec(command, args, {
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

  if (opts.failOnStderr && stderr.length) {
    throw new Error('Command failed (stderr was not empty)')
  }

  return { stdout, stderr }
}

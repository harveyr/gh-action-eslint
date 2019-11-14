import * as exec from '@actions/exec'

interface CommandOutput {
  stdout: string
  stderr: string
}

export interface ExecOptions {
  cwd?: string
  failOnStdErr?: boolean
}

export async function captureOutput(
  command: string,
  args: string[],
  opt: ExecOptions = {},
): Promise<CommandOutput> {
  let stdout = ''
  let stderr = ''

  const { cwd, failOnStdErr } = opt
  if (cwd) {
    console.log('Running in subdir: %s', cwd)
  }

  await exec.exec(command, args, {
    cwd,
    failOnStdErr,
    ignoreReturnCode: failOnStdErr === false,
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

  return { stdout, stderr }
}

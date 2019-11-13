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

  const {cwd, failOnStdErr} = opt

  await exec.exec(command, args, {
    cwd,
    failOnStdErr,
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

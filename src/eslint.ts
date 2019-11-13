import {ExecOptions, captureOutput} from './exec'

export async function getVersion() {
  const {stdout} = await captureOutput('npx', ['eslint', '--version'], {failOnStdErr: true})
  return stdout
}


export async function runEslint(patterns: string[], opt: ExecOptions = {}) {
  opt.failOnStdErr = false
  const args = ['eslint', '--format=compact', '--quiet'].concat(patterns)
  const {stdout, stderr} = await captureOutput('npx', args, opt)

  console.log('STDOUT:\n', stdout)
  console.log('STDERR:\n', stderr)
}
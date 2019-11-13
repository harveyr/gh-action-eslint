import {captureOutput} from './exec'

export async function getVersion() {
  const {stdout} = await captureOutput('npx', ['eslint', '--version'], {failOnStderr: true})
  return stdout
}


export async function runEslint(patterns: string[]) {
  const args = ['eslint', '--format=compact', '--quiet'].concat(patterns)
  const {stdout, stderr} = await captureOutput('npx', args)

  console.log('STDOUT:\n', stdout)
  console.log('STDERR:\n', stderr)
}
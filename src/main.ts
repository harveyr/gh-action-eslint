import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'
import { getAnnotationForLint } from './annotations'
import { getEslintVersion, parseEslints, runEslint } from './eslint'
import { Lint } from './types'

// It appears the setup-node step adds a "problem matcher" that will catch lints
// and create annotations automatically!
const POST_ANNOTATIONS = false

async function postCheckRun(text: string, lints: Lint[]): Promise<void> {
  const annotations = lints.map(getAnnotationForLint)

  let warning = false
  let error = false
  for (const lint of lints) {
    const severity = lint.severity.toLowerCase()
    if (severity === 'error') {
      error = true
    } else if (severity === 'warning') {
      warning = true
    }
  }
  let conclusion: kit.CheckRunConclusion = 'success'
  if (error) {
    conclusion = 'failure'
  } else if (warning) {
    conclusion = 'neutral'
  }

  await kit.postCheckRun({
    githubToken: core.getInput('github-token'),
    name: 'ESLint',
    conclusion,
    // eslint-disable-next-line @typescript-eslint/camelcase
    summary: `${annotations.length} lints reported`,
    text,
    annotations: POST_ANNOTATIONS ? annotations : [],
  })
}

async function run(): Promise<void> {
  const cwd = core.getInput('working-directory')
  const patterns = core
    .getInput('patterns')
    .split(' ')
    .map(p => {
      return p.trim()
    })
    .filter(p => {
      return p.length > 0
    })

  // Cause the version to be printed to the logs. We want to make sure we're
  // using the version in the repo under test, not the one from this repo.
  await getEslintVersion({ cwd })

  let lints: Lint[] = []
  let output = ''
  if (patterns.length) {
    output = await runEslint(patterns, { cwd })
    lints = parseEslints(output)
  }
  await postCheckRun(output, lints)
}

run().catch(err => {
  core.setFailed(`${err}`)
})

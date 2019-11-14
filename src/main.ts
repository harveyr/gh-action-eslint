import * as core from '@actions/core'
import { Lint, runEslint, getEslintVersion, parseEslints } from './eslint'

// TODO: Use a TS import once this is fixed: https://github.com/actions/toolkit/issues/199
// import * as github from '@actions/github'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const github = require('@actions/github')

const { GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_WORKSPACE } = process.env

// It appears the setup-node step adds a "problem matcher" that will create
// annotations automatically!
const POST_ANNOTATIONS = false

function getAnnotationLevel(
  severity: string,
): 'notice' | 'warning' | 'failure' {
  if (severity === 'error') {
    return 'failure'
  }
  // not sure what the actual string is yet
  if (severity.indexOf('warn') === 0) {
    return 'warning'
  }
  return 'notice'
}

async function postAnnotations(lints: Lint[]): Promise<void> {
  if (!GITHUB_WORKSPACE) {
    return core.setFailed(
      'GITHUB_WORKSPACE not set. This should happen automatically.',
    )
  }
  if (!GITHUB_REPOSITORY) {
    return core.setFailed('GITHUB_REPOSITORY was not set')
  }
  if (!GITHUB_SHA) {
    return core.setFailed('GITHUB_SHA was not set')
  }

  const annotations = []
  for (const lint of lints) {
    const { filePath, line, message, severity } = lint
    const path = filePath.substring(GITHUB_WORKSPACE.length + 1)
    annotations.push({
      path,
      // eslint-disable-next-line @typescript-eslint/camelcase
      start_line: line,
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_line: line,
      // eslint-disable-next-line @typescript-eslint/camelcase
      annotation_level: getAnnotationLevel(severity),
      message,
    })
  }

  const repoData = github.context.payload.repository
  if (!repoData) {
    return core.setFailed('repository not found')
  }

  const [owner, repo] = GITHUB_REPOSITORY.split('/')
  core.debug(`Found Github owner ${owner}, repo ${repo}`)

  const githubToken = core.getInput('github-token')
  if (!githubToken) {
    return core.setFailed('github-token is required')
  }

  const client = new github.GitHub(githubToken)

  console.log(`Posting ${annotations.length} annotations`)

  await client.checks.create({
    name: 'ESLint',
    conclusion: annotations.length ? 'failure' : 'success',
    // eslint-disable-next-line @typescript-eslint/camelcase
    head_sha: GITHUB_SHA,
    owner,
    repo,
    output: {
      title: 'ESLint',
      summary: `${annotations.length} lints reported`,
      annotations,
    },
  })
}

async function run(): Promise<void> {
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
  await getEslintVersion()

  const output = await runEslint(patterns, {
    cwd: core.getInput('working-directory'),
  })
  const lints = parseEslints(output)
  if (POST_ANNOTATIONS) {
    await postAnnotations(lints)
  }
  if (lints.length) {
    core.setFailed(`ESLint found ${lints.length} issues`)
  }
}

run().catch(err => {
  core.error(err)
  core.setFailed(`${err}`)
})

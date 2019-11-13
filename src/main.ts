import * as core from '@actions/core'
import { runEslint, getVersion as getEslintVersion } from './eslint'

// TODO: Use a TS import once this is fixed: https://github.com/actions/toolkit/issues/199
// import * as github from '@actions/github'

const github = require('@actions/github')

const { GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_WORKSPACE } = process.env


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

async function run() {
  if (!GITHUB_WORKSPACE) {
    core.setFailed(
      'GITHUB_WORKSPACE not set. This should happen automatically.',
    )
    return
  }
  if (!GITHUB_REPOSITORY) {
    return core.setFailed('GITHUB_REPOSITORY was not set')
  }
  if (!GITHUB_SHA) {
    return core.setFailed('GITHUB_SHA was not set')
  }

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

  const lints = await runEslint(patterns, {
    cwd: core.getInput('working-directory'),
  })

  console.log('Got %s lints', lints.length)

  const annotations = []
  for (const lint of lints) {
    const { filePath, line, message, severity } = lint
    const path = filePath.substring(GITHUB_WORKSPACE.length + 1)
    annotations.push({
      path,
      start_line: line,
      end_line: line,
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

  return client.checks.create({
    name: 'ESLint',
    conclusion: annotations.length ? 'failure' : 'success',
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


run().catch(err => {
  core.error(err)
  core.setFailed(`${err}`)
})

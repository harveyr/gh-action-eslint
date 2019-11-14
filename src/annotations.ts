import * as kit from '@harveyr/github-actions-kit'
import { Lint } from './types'

const GITHUB_WORKSPACE = kit.getWorkspace()

function getAnnotationLevel(severity: string): kit.AnnotationLevel {
  if (severity === 'error') {
    return 'failure'
  }
  // not sure what the actual string is yet
  if (severity.indexOf('warn') === 0) {
    return 'warning'
  }
  return 'notice'
}

export function getAnnotationForLint(lint: Lint): kit.CheckRunAnnotation {
  const { filePath, line, message, severity } = lint
  const path = filePath.substring(GITHUB_WORKSPACE.length + 1)
  return {
    path,
    // eslint-disable-next-line @typescript-eslint/camelcase
    startLine: line,
    // eslint-disable-next-line @typescript-eslint/camelcase
    level: getAnnotationLevel(severity),
    message,
  }
}

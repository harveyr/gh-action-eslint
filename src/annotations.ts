import * as kit from '@harveyr/github-actions-kit'
import { Lint } from './types'

const GITHUB_WORKSPACE = kit.getWorkspace()

function getAnnotationLevel(severity: string): kit.AnnotationLevel {
  severity = severity.toLowerCase()
  if (severity === 'error') {
    return 'failure'
  }
  // not sure what the actual string is yet
  if (severity === 'warning') {
    return 'warning'
  }
  return 'notice'
}

export function getAnnotationForLint(lint: Lint): kit.CheckRunAnnotation {
  const { filePath, line, message, severity } = lint
  const path = filePath.substring(GITHUB_WORKSPACE.length + 1)
  return {
    path,
    startLine: line,
    level: getAnnotationLevel(severity),
    message,
  }
}

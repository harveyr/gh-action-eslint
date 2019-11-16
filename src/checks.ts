import * as kit from '@harveyr/github-actions-kit'
import { Lint, Severity } from './types'

function getAnnotationLevel(severity: Severity): kit.AnnotationLevel {
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
  const path = filePath.substring(kit.getWorkspace().length + 1)
  return {
    path,
    startLine: line,
    level: getAnnotationLevel(severity),
    message,
  }
}

export function getCheckRunConclusion(lints: Lint[]): kit.CheckRunConclusion {
  if (!lints.length) {
    return 'success'
  }
  const errorLint = lints.find(lint => {
    return lint.severity === 'error'
  })
  if (errorLint) {
    return 'failure'
  }
  return 'neutral'
}

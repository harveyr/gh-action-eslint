export type Severity = 'error' | 'warning' | 'notice'

export interface Lint {
  filePath: string
  line: number
  column: number
  severity: Severity
  message: string
}

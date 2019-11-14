export interface Lint {
  filePath: string
  line: number
  column: number
  severity: string
  message: string
}

export type ContentIssueLevel = 'error' | 'warning'

export interface ContentIssue {
  level: ContentIssueLevel
  file: string
  line?: number
  message: string
}

export class ContentIssueCollector {
  private issues: ContentIssue[] = []

  error(file: string, message: string, line?: number): void {
    this.issues.push({ level: 'error', file, line, message })
  }

  warning(file: string, message: string, line?: number): void {
    this.issues.push({ level: 'warning', file, line, message })
  }

  get all(): ContentIssue[] {
    return this.issues
  }

  get errors(): ContentIssue[] {
    return this.issues.filter((issue) => issue.level === 'error')
  }

  get warnings(): ContentIssue[] {
    return this.issues.filter((issue) => issue.level === 'warning')
  }

  get hasErrors(): boolean {
    return this.errors.length > 0
  }

  merge(other: ContentIssueCollector): void {
    this.issues.push(...other.issues)
  }
}

export function formatIssue(issue: ContentIssue): string {
  const location = issue.line ? `${issue.file}:${issue.line}` : issue.file
  const tag = issue.level === 'error' ? 'LỖI' : 'CẢNH BÁO'
  return `[${tag}] ${location} — ${issue.message}`
}

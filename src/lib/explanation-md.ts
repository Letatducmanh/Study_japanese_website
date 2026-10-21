/** Parser rất nhỏ cho `explanationMd` (mục 5.3): gạch đầu dòng "- ", lồng "  + ", in đậm "**...**". */

export interface ExplanationBullet {
  text: string
  children: string[]
}

export function parseExplanationMd(md: string): ExplanationBullet[] {
  const bullets: ExplanationBullet[] = []
  for (const line of md.split(/\r?\n/)) {
    if (line.startsWith('- ')) {
      bullets.push({ text: line.slice(2), children: [] })
      continue
    }
    const nested = /^\s{2}\+ (.*)$/.exec(line)
    if (nested) {
      const current = bullets[bullets.length - 1]
      current?.children.push(nested[1])
    }
  }
  return bullets
}

export type InlinePart = string | { bold: string }

/** Tách `**in đậm**` khỏi văn bản thường để render bằng React (không dùng dangerouslySetInnerHTML). */
export function parseInlineBold(text: string): InlinePart[] {
  const parts: InlinePart[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push({ bold: match[1] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

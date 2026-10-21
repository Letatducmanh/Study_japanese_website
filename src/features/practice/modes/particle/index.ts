import {
  isGrammarItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import { ParticleComponent } from './ParticleComponent'
import type { ParticleChoice, ParticleQuestion } from './types'
import type { GrammarExample, GrammarPoint } from '@/domain/types'

/** Trợ từ cuối cụm hay dùng ở N5 (mục 3.3 dạng 10), xếp theo độ dài giảm dần để so khớp đúng. */
const PARTICLES = ['から', 'まで', 'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'や']

/** Trợ từ dễ nhầm hợp lệ (VD へ/に đều chỉ hướng) — không dùng làm đáp án nhiễu cho nhau. */
const AMBIGUOUS_GROUPS: Record<string, string[]> = {
  へ: ['に'],
  に: ['へ'],
}

interface ParticleMatch {
  example: GrammarExample
  chunkIndex: number
  stem: string
  particle: string
  punct: string
}

function splitTrailingPunct(chunk: string): { core: string; punct: string } {
  const match = /^(.*?)([。？！]*)$/u.exec(chunk)
  return { core: match?.[1] ?? chunk, punct: match?.[2] ?? '' }
}

function matchChunkParticle(
  chunk: string,
): { stem: string; particle: string; punct: string } | null {
  const { core, punct } = splitTrailingPunct(chunk)
  for (const particle of PARTICLES) {
    if (core.endsWith(particle) && core.length > particle.length) {
      return { stem: core.slice(0, -particle.length), particle, punct }
    }
  }
  return null
}

function findMatches(point: GrammarPoint): ParticleMatch[] {
  const matches: ParticleMatch[] = []
  for (const example of point.examples) {
    example.chunks.forEach((chunk, chunkIndex) => {
      const found = matchChunkParticle(chunk)
      if (found) matches.push({ example, chunkIndex, ...found })
    })
  }
  return matches
}

export const particleQuestionType: QuestionType<ParticleQuestion> = {
  id: 'particle',
  label: vi.particle.label,
  itemType: 'grammar',
  skill: 'particle',
  isEligible: (item: QuizItem) =>
    isGrammarItem(item) && findMatches(item).length > 0,
  generate: (item, _pool, rng) => {
    const point = item as GrammarPoint
    const matches = findMatches(point)
    const match = matches[Math.floor(rng() * matches.length)]
    const { example, chunkIndex, stem, particle, punct } = match

    const before =
      example.chunks.slice(0, chunkIndex).join(' ') +
      (chunkIndex > 0 ? ' ' : '') +
      stem
    const after =
      punct +
      (chunkIndex < example.chunks.length - 1
        ? ' ' + example.chunks.slice(chunkIndex + 1).join(' ')
        : '')

    const excluded = new Set([particle, ...(AMBIGUOUS_GROUPS[particle] ?? [])])
    const distractors = shuffle(
      PARTICLES.filter((p) => !excluded.has(p)),
      rng,
    ).slice(0, 3)
    const all = shuffle([particle, ...distractors], rng)
    const choices: ParticleChoice[] = all.map((text, i) => ({
      id: String(i),
      text,
    }))
    const correctIndex = all.findIndex((p) => p === particle)

    return {
      before,
      after,
      vi: example.vi,
      choices,
      correctChoiceId: choices[correctIndex].id,
    }
  },
  grade: (question, answer) => {
    const correctChoice = question.choices.find(
      (c) => c.id === question.correctChoiceId,
    )
    const givenChoice = question.choices.find((c) => c.id === answer)
    return {
      correct: answer === question.correctChoiceId,
      expected: correctChoice?.text ?? '',
      given: givenChoice?.text ?? '',
    }
  },
  Component: ParticleComponent,
}

register(particleQuestionType)

import {
  findDistractorCandidates,
  pickDistractors,
} from '@/domain/quiz/distractors'
import {
  isVocabItem,
  register,
  type QuestionType,
  type QuizItem,
} from '@/domain/quiz/registry'
import { shuffle } from '@/lib/rng'
import { vi } from '@/i18n/vi'
import { McqComponent } from './McqComponent'
import type { McqChoice, McqQuestion } from './types'
import type { DistractorField } from '@/domain/quiz/distractors'
import type { Skill, VocabItem } from '@/domain/types'

interface DirectionConfig {
  id: string
  label: string
  skill: Skill
  distractorField: DistractorField
  isEligibleItem: (item: VocabItem) => boolean
  buildPrompt: (item: VocabItem) => {
    text?: string
    reading?: string
    audio?: string
  }
  choiceOf: (item: VocabItem) => { text: string; reading?: string }
}

function createMcqDirection(
  config: DirectionConfig,
): QuestionType<McqQuestion> {
  return {
    id: config.id,
    label: config.label,
    itemType: 'vocab',
    skill: config.skill,
    isEligible: (item: QuizItem, ctx) => {
      if (!isVocabItem(item) || !config.isEligibleItem(item)) return false
      const pool = ctx.pool.filter(isVocabItem)
      return (
        findDistractorCandidates(item, pool, config.distractorField).length >= 1
      )
    },
    generate: (item, pool, rng) => {
      const vocabItem = item as VocabItem
      const vocabPool = pool.filter(isVocabItem)
      const distractors = pickDistractors(
        vocabItem,
        vocabPool,
        { field: config.distractorField, count: 3 },
        rng,
      )
      const all = shuffle([vocabItem, ...distractors], rng)
      const choices: McqChoice[] = all.map((candidate, index) => ({
        id: String(index),
        ...config.choiceOf(candidate),
      }))
      const correctIndex = all.findIndex((c) => c.id === vocabItem.id)
      const prompt = config.buildPrompt(vocabItem)
      return {
        item: vocabItem,
        promptText: prompt.text,
        promptReading: prompt.reading,
        promptAudio: prompt.audio,
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
    Component: McqComponent,
  }
}

export const mcqJpVi = createMcqDirection({
  id: 'mcq-jp-vi',
  label: vi.mcq.directionJpVi,
  skill: 'meaning',
  distractorField: 'meaning',
  isEligibleItem: () => true,
  buildPrompt: (item) => ({
    text: item.kanji ?? item.kana,
    reading: item.kanji ? item.kana : undefined,
  }),
  choiceOf: (item) => ({ text: item.meaning }),
})

export const mcqViJp = createMcqDirection({
  id: 'mcq-vi-jp',
  label: vi.mcq.directionViJp,
  skill: 'recall',
  distractorField: 'kana',
  isEligibleItem: () => true,
  buildPrompt: (item) => ({ text: item.meaning }),
  choiceOf: (item) => ({
    text: item.kanji ?? item.kana,
    reading: item.kanji ? item.kana : undefined,
  }),
})

export const mcqKanjiReading = createMcqDirection({
  id: 'mcq-kanji-reading',
  label: vi.mcq.directionKanjiReading,
  skill: 'reading',
  distractorField: 'kana',
  isEligibleItem: (item) => item.kanji !== null,
  buildPrompt: (item) => ({ text: item.kanji ?? item.kana }),
  choiceOf: (item) => ({ text: item.kana }),
})

export const mcqKanaKanji = createMcqDirection({
  id: 'mcq-kana-kanji',
  label: vi.mcq.directionKanaKanji,
  skill: 'recall',
  distractorField: 'kanji',
  isEligibleItem: (item) => item.kanji !== null,
  buildPrompt: (item) => ({ text: item.kana }),
  choiceOf: (item) => ({ text: item.kanji ?? item.kana }),
})

export const mcqListenVi = createMcqDirection({
  id: 'mcq-listen-vi',
  label: vi.mcq.directionListenVi,
  skill: 'listening',
  distractorField: 'meaning',
  isEligibleItem: () => true,
  buildPrompt: (item) => ({ audio: item.kanji ?? item.kana }),
  choiceOf: (item) => ({ text: item.meaning }),
})

export const mcqViKanji = createMcqDirection({
  id: 'mcq-vi-kanji',
  label: vi.mcq.directionViKanji,
  skill: 'recall',
  distractorField: 'kanji',
  isEligibleItem: (item) => item.kanji !== null,
  buildPrompt: (item) => ({ text: item.meaning }),
  choiceOf: (item) => ({ text: item.kanji ?? item.kana }),
})

for (const direction of [
  mcqJpVi,
  mcqViJp,
  mcqKanjiReading,
  mcqKanaKanji,
  mcqListenVi,
  mcqViKanji,
]) {
  register(direction)
}

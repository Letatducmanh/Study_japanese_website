export interface KanjiReadingChoice {
  id: string
  text: string
}

export interface KanjiReadingQuestion {
  promptText: string
  promptHint: string
  choices: KanjiReadingChoice[]
  correctChoiceId: string
}

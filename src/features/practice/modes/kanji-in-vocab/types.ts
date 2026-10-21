export interface KanjiInVocabChoice {
  id: string
  text: string
}

export interface KanjiInVocabQuestion {
  before: string
  after: string
  hint: string
  choices: KanjiInVocabChoice[]
  correctChoiceId: string
}

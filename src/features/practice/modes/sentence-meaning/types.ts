export interface SentenceMeaningChoice {
  id: string
  text: string
}

export interface SentenceMeaningQuestion {
  jp: string
  choices: SentenceMeaningChoice[]
  correctChoiceId: string
}

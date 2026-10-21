export interface ConjugationMcqChoice {
  id: string
  text: string
}

export interface ConjugationMcqQuestion {
  promptText: string
  promptHint: string
  choices: ConjugationMcqChoice[]
  correctChoiceId: string
}

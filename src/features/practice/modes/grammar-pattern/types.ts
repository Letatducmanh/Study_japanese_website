export interface GrammarPatternChoice {
  id: string
  text: string
}

export interface GrammarPatternQuestion {
  jp: string
  vi: string
  choices: GrammarPatternChoice[]
  correctChoiceId: string
}

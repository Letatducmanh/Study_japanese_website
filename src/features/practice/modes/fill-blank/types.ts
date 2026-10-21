export interface FillBlankChoice {
  id: string
  text: string
}

export interface FillBlankQuestion {
  before: string
  after: string
  vi: string
  choices: FillBlankChoice[]
  correctChoiceId: string
}

export interface ParticleChoice {
  id: string
  text: string
}

export interface ParticleQuestion {
  before: string
  after: string
  vi: string
  choices: ParticleChoice[]
  correctChoiceId: string
}

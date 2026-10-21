export interface KanjiHanVietChoice {
  id: string
  text: string
}

export interface KanjiHanVietQuestion {
  char: string
  choices: KanjiHanVietChoice[]
  correctChoiceId: string
}

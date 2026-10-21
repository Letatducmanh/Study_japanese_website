export interface MatchingPair {
  id: string
  jp: string
  vi: string
}

export interface MatchingQuestion {
  pairs: MatchingPair[]
}

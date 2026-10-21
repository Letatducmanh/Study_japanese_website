import { readFileSync } from 'node:fs'
import { load as loadYaml } from 'js-yaml'
import {
  posOverridesSchema,
  verbGroupOverridesSchema,
} from '../../src/domain/schemas.ts'
import type { Pos, VerbGroup } from '../../src/domain/types.ts'

export interface PosOverride {
  kana: string
  pos: Pos
}

export interface VerbGroupOverride {
  kana: string
  kanji: string
  group: VerbGroup
}

export function loadPosOverrides(filePath: string): PosOverride[] {
  const raw = loadYaml(readFileSync(filePath, 'utf-8')) ?? []
  return posOverridesSchema.parse(raw)
}

export function loadVerbGroupOverrides(filePath: string): VerbGroupOverride[] {
  const raw = loadYaml(readFileSync(filePath, 'utf-8')) ?? []
  return verbGroupOverridesSchema.parse(raw)
}

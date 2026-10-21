import type { VerbGroup } from '../types.ts'

interface GodanRow {
  dict: string
  te: string
  ta: string
  nai: string
}

/** Bảng chia động từ nhóm I (五段) theo hàng い của từng cột âm, dựa trên mục PHỤ LỤC grammar.md. */
const GODAN_ROWS: Record<string, GodanRow> = {
  い: { dict: 'う', te: 'って', ta: 'った', nai: 'わ' },
  ち: { dict: 'つ', te: 'って', ta: 'った', nai: 'た' },
  り: { dict: 'る', te: 'って', ta: 'った', nai: 'ら' },
  み: { dict: 'む', te: 'んで', ta: 'んだ', nai: 'ま' },
  び: { dict: 'ぶ', te: 'んで', ta: 'んだ', nai: 'ば' },
  に: { dict: 'ぬ', te: 'んで', ta: 'んだ', nai: 'な' },
  き: { dict: 'く', te: 'いて', ta: 'いた', nai: 'か' },
  ぎ: { dict: 'ぐ', te: 'いで', ta: 'いだ', nai: 'が' },
  し: { dict: 'す', te: 'して', ta: 'した', nai: 'さ' },
}

/** Ngoại lệ chia theo nguyên văn thể ます (mục 10, Phase 2: 行きます、あります). */
const WHOLE_WORD_EXCEPTIONS: Record<string, Partial<GodanRow>> = {
  いきます: { te: 'いって', ta: 'いった' },
  あります: { nai: 'ない' },
}

/** Bỏ phần tùy chọn `[ ... ]` (vd "すいます [たばこを～]") trước khi chia. */
export function cleanMasuForm(masuForm: string): string {
  return masuForm.replace(/\s*\[[^\]]*\]/gu, '').trim()
}

/** Thể ます-stem: bỏ đuôi ます. Dùng chung cho cả 3 nhóm. */
export function toMasuStem(masuForm: string): string {
  const clean = cleanMasuForm(masuForm)
  return clean.endsWith('ます') ? clean.slice(0, -2) : clean
}

interface ConjugatedForms {
  te: string
  ta: string
  nai: string
  dictionary: string
}

function conjugateGroup1(clean: string): ConjugatedForms {
  const exception = WHOLE_WORD_EXCEPTIONS[clean]
  const stem = toMasuStem(clean)
  const rowKey = stem.slice(-1)
  const row = GODAN_ROWS[rowKey]
  if (!row) {
    throw new Error(
      `Không nhận ra âm cuối thân động từ nhóm I: "${clean}" (thân "${stem}")`,
    )
  }
  const base = stem.slice(0, -1)
  return {
    te: exception?.te ?? base + row.te,
    ta: exception?.ta ?? base + row.ta,
    nai: exception?.nai ?? base + row.nai + 'ない',
    dictionary: base + row.dict,
  }
}

function conjugateGroup2(clean: string): ConjugatedForms {
  const stem = toMasuStem(clean)
  return {
    te: stem + 'て',
    ta: stem + 'た',
    nai: stem + 'ない',
    dictionary: stem + 'る',
  }
}

function conjugateGroup3(clean: string): ConjugatedForms {
  if (clean.endsWith('きます') && !clean.endsWith('します')) {
    const prefix = clean.slice(0, -3) // bỏ "きます", giữ lại phần trước (vd もって trong もってきます)
    return {
      te: prefix + 'きて',
      ta: prefix + 'きた',
      nai: prefix + 'こない',
      dictionary: prefix + 'くる',
    }
  }
  if (clean.endsWith('します')) {
    const stem = clean.slice(0, -3) // bỏ "します", giữ danh từ/tiền tố (vd べんきょう)
    return {
      te: stem + 'して',
      ta: stem + 'した',
      nai: stem + 'しない',
      dictionary: stem + 'する',
    }
  }
  throw new Error(`Động từ nhóm III không khớp mẫu する/来る: "${clean}"`)
}

function conjugate(masuForm: string, group: VerbGroup): ConjugatedForms {
  const clean = cleanMasuForm(masuForm)
  if (group === 1) return conjugateGroup1(clean)
  if (group === 2) return conjugateGroup2(clean)
  return conjugateGroup3(clean)
}

export function toTe(masuForm: string, group: VerbGroup): string {
  return conjugate(masuForm, group).te
}

export function toTa(masuForm: string, group: VerbGroup): string {
  return conjugate(masuForm, group).ta
}

export function toNai(masuForm: string, group: VerbGroup): string {
  return conjugate(masuForm, group).nai
}

export function toDictionary(masuForm: string, group: VerbGroup): string {
  return conjugate(masuForm, group).dictionary
}

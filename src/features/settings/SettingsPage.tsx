import { useRef, useState } from 'react'
import { progressRepository } from '@/data/progress/dexie-repo'
import { vi } from '@/i18n/vi'
import { ThemeToggle } from '@/components/ThemeToggle'

type Status = { type: 'success' | 'error'; message: string } | null

export function SettingsPage() {
  const [status, setStatus] = useState<Status>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const data = await progressRepository.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tien-do-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus({ type: 'success', message: vi.settings.exportSuccess })
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as Parameters<
        typeof progressRepository.importAll
      >[0]
      await progressRepository.importAll(data)
      setStatus({ type: 'success', message: vi.settings.importSuccess })
    } catch {
      setStatus({ type: 'error', message: vi.settings.importError })
    }
  }

  async function handleConfirmClear() {
    await progressRepository.clearAll()
    setConfirmingClear(false)
    setStatus({ type: 'success', message: vi.settings.clearSuccess })
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="text-lg font-bold text-primary-900 dark:text-slate-100">
        {vi.settings.pageTitle}
      </h1>

      <section className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {vi.settings.themeLabel}
        </span>
        <ThemeToggle />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-primary-900 dark:text-slate-100">
          {vi.settings.dataSectionTitle}
        </h2>

        <button
          type="button"
          onClick={handleExport}
          className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-primary-500 dark:border-slate-700 dark:text-slate-200"
        >
          {vi.settings.exportButton}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-primary-500 dark:border-slate-700 dark:text-slate-200"
        >
          {vi.settings.importButton}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void handleImportFile(file)
          }}
        />

        {!confirmingClear ? (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="min-h-11 rounded-full border border-danger px-4 text-sm font-medium text-danger hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            {vi.settings.clearButton}
          </button>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-danger/40 bg-red-50 p-3 dark:bg-red-950/20">
            <p className="text-sm text-slate-700 dark:text-slate-200">
              {vi.settings.clearConfirmTitle}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {vi.settings.clearConfirmBody}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmClear}
                className="min-h-11 flex-1 rounded-full bg-danger px-4 text-sm font-medium text-white"
              >
                {vi.settings.clearConfirmYes}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="min-h-11 flex-1 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                {vi.settings.clearConfirmCancel}
              </button>
            </div>
          </div>
        )}

        {status && (
          <p
            role="status"
            className={`text-sm ${status.type === 'success' ? 'text-success' : 'text-danger'}`}
          >
            {status.message}
          </p>
        )}
      </section>
    </div>
  )
}

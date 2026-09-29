'use client'

import {
  Wysiwyg,
  WysiwygBold,
  WysiwygClearFormatting,
  WysiwygContent,
  WysiwygHeadingMenu,
  WysiwygItalic,
  WysiwygLink,
  WysiwygLinkEditor,
  WysiwygOrderedList,
  WysiwygRedo,
  WysiwygSeparator,
  WysiwygToolbar,
  WysiwygUnderline,
  WysiwygUndo,
  WysiwygUnorderedList,
} from 'react-html-content-editor'
import 'react-html-content-editor/dist/style.css'

/**
 * Visual editor for the HTML shown in the "Saiba mais" window. Only the
 * formatting that `.rich-text` styles on the site is offered, so what the team
 * writes here looks the same once published.
 */
export function RichTextEditor({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (html: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <Wysiwyg value={value} onChange={onChange}>
          <WysiwygToolbar aria-label="Formatação">
            <WysiwygUndo title="Desfazer" />
            <WysiwygRedo title="Refazer" />
            <WysiwygSeparator />
            <WysiwygHeadingMenu title="Estilo do parágrafo" levels={[2, 3, 4]} />
            <WysiwygSeparator />
            <WysiwygBold title="Negrito" />
            <WysiwygItalic title="Itálico" />
            <WysiwygUnderline title="Sublinhado" />
            <WysiwygSeparator />
            <WysiwygUnorderedList title="Lista com marcadores" />
            <WysiwygOrderedList title="Lista numerada" />
            <WysiwygSeparator />
            <WysiwygLink title="Inserir link" />
            <WysiwygClearFormatting title="Limpar formatação" />
          </WysiwygToolbar>
          <WysiwygContent
            placeholder="Modo de uso, composição, cuidados…"
            minHeight="280px"
            aria-label={label}
          />
          <WysiwygLinkEditor />
        </Wysiwyg>
      </div>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

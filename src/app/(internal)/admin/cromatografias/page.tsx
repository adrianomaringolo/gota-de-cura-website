'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { AdminHeading, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { CromatografiaFormDialog } from '@/components/admin/CromatografiaFormDialog'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { CROMATOGRAFIA_LABELS } from '@/lib/constants'
import { useCromatografias } from '@/lib/hooks'
import type { Cromatografia } from '@/lib/types'
import { CromatografiasService } from '@/services/cromatografias'

export default function AdminCromatografiasPage() {
  const { data, loading, reload } = useCromatografias()
  const [editing, setEditing] = useState<Cromatografia | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const remove = async (id: string) => {
    try {
      await CromatografiasService.remove(id)
      toast.success('Cromatografia removida')
      setConfirmDelete(null)
      await reload()
    } catch {
      toast.error('Não foi possível remover')
    }
  }

  return (
    <>
      <AdminHeading
        title="Cromatografias"
        description="Laudos publicados na página pública. O contador mostra quantas vezes cada PDF foi aberto."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            Nova cromatografia
          </Button>
        }
      />

      {loading ? (
        <LoadingRows rows={5} />
      ) : data.length === 0 ? (
        <EmptyState title="Nenhuma cromatografia cadastrada">
          Cadastre o primeiro laudo para que ele apareça no site.
        </EmptyState>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Nome científico</Th>
              <Th>Tipo</Th>
              <Th className="text-right">Aberturas</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <Td className="font-medium">
                  {item.name}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs font-normal text-brand underline decoration-brand/30 underline-offset-2"
                  >
                    Abrir PDF
                  </a>
                </Td>
                <Td className="text-ink-soft italic">{item.scientificName}</Td>
                <Td>
                  <Badge tone={item.type === 'oleo-essencial' ? 'brand' : 'lab'}>
                    {CROMATOGRAFIA_LABELS[item.type] ?? item.type}
                  </Badge>
                </Td>
                <Td className="text-right tabular-nums">{item.viewCount ?? 0}</Td>
                <Td className="text-right">
                  {confirmDelete === item.id ? (
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        className="bg-danger hover:bg-danger/85"
                        onClick={() => remove(item.id)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(item)
                          setDialogOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete(item.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <CromatografiaFormDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={reload}
      />
    </>
  )
}

'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { AdminHeading, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { UserFormDialog } from '@/components/admin/UserFormDialog'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Badge, EmptyState, LoadingRows, Spinner } from '@/components/ui/Feedback'
import { useLoggedUser, useManagedUsers } from '@/lib/hooks'
import { UsersService, type ManagedUser } from '@/services/users'

type PendingAction = { type: 'delete' | 'reset'; user: ManagedUser }

export default function AdminUsersPage() {
  const { data, loading, reload } = useManagedUsers()
  const { user: currentUser } = useLoggedUser()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [working, setWorking] = useState(false)

  const users = useMemo(
    () => [...data].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [data],
  )
  const adminCount = users.filter((entry) => entry.isAdmin).length

  const isSelf = (entry: ManagedUser) => currentUser?.login === entry.login
  const isLastAdmin = (entry: ManagedUser) => entry.isAdmin && adminCount <= 1
  // Removing your own admin role locks you out of this very page; the last
  // admin leaving does the same for everyone.
  const lockAdmin = (entry: ManagedUser) => isSelf(entry) || isLastAdmin(entry)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (entry: ManagedUser) => {
    setEditing(entry)
    setFormOpen(true)
  }

  const runPending = async () => {
    if (!pending) return
    setWorking(true)
    try {
      if (pending.type === 'delete') {
        await UsersService.deleteManagedUser(pending.user.id)
        toast.success('Usuário removido')
      } else {
        await UsersService.resetManagedUserPassword(pending.user.id)
        toast.success('Senha redefinida para a senha padrão')
      }
      setPending(null)
      await reload()
    } catch {
      toast.error('Não foi possível concluir a ação')
    } finally {
      setWorking(false)
    }
  }

  return (
    <>
      <AdminHeading
        title="Usuários do painel"
        description="Quem entra no painel administrativo. Só administradores veem esta página."
        actions={<Button onClick={openCreate}>Novo usuário</Button>}
      />

      {loading ? (
        <LoadingRows rows={6} />
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuário cadastrado" />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Login</Th>
              <Th>E-mail</Th>
              <Th>Acesso</Th>
              <Th>Senha</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((entry) => (
              <tr key={entry.id}>
                <Td>
                  <span className="font-medium">{entry.name || '—'}</span>
                  {isSelf(entry) && (
                    <span className="ml-2 text-xs text-ink-muted">(você)</span>
                  )}
                </Td>
                <Td className="font-mono text-ink-soft">{entry.login}</Td>
                <Td className="text-ink-soft">{entry.email || '—'}</Td>
                <Td>
                  {entry.isAdmin ? (
                    <Badge tone="brand">Administrador</Badge>
                  ) : (
                    <Badge tone="neutral">Equipe</Badge>
                  )}
                </Td>
                <Td>
                  {entry.usesDefaultPassword ? (
                    <Badge tone="warning">Senha padrão</Badge>
                  ) : entry.passwordUpdatedAt ? (
                    <span className="text-xs text-ink-muted">
                      trocada em {format(new Date(entry.passwordUpdatedAt), 'dd/MM/yyyy')}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted">definida</span>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => openEdit(entry)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={entry.usesDefaultPassword}
                      onClick={() => setPending({ type: 'reset', user: entry })}
                    >
                      Redefinir senha
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSelf(entry) || isLastAdmin(entry)}
                      onClick={() => setPending({ type: 'delete', user: entry })}
                    >
                      Excluir
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <UserFormDialog
        open={formOpen}
        editing={editing}
        lockAdmin={editing ? lockAdmin(editing) : false}
        onClose={() => setFormOpen(false)}
        onSaved={reload}
      />

      <Dialog
        open={pending !== null}
        onClose={() => {
          if (!working) setPending(null)
        }}
        size="sm"
        title={pending?.type === 'delete' ? 'Excluir usuário?' : 'Redefinir a senha?'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)} disabled={working}>
              Cancelar
            </Button>
            <Button
              onClick={runPending}
              disabled={working}
              className={
                pending?.type === 'delete' ? 'bg-danger hover:bg-danger/85' : undefined
              }
            >
              {working ? (
                <Spinner className="h-4 w-4" />
              ) : pending?.type === 'delete' ? (
                'Excluir'
              ) : (
                'Redefinir'
              )}
            </Button>
          </>
        }
      >
        {pending?.type === 'delete' ? (
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">
              {pending.user.name || pending.user.login}
            </strong>{' '}
            perde o acesso ao painel imediatamente. O histórico dos pedidos que a pessoa
            já movimentou não muda.
          </p>
        ) : (
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">
              {pending?.user.name || pending?.user.login}
            </strong>{' '}
            volta para a senha padrão da equipe. Se estiver com o painel aberto, a sessão
            é encerrada no próximo acesso e a pessoa precisa entrar com a senha padrão e
            criar uma nova senha antes de continuar.
          </p>
        )}
      </Dialog>
    </>
  )
}

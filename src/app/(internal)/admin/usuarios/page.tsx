'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ActionMenu } from '@/components/admin/ActionMenu'
import { AdminHeading, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { MailListsDialog } from '@/components/admin/MailListsDialog'
import { UserFormDialog } from '@/components/admin/UserFormDialog'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { Dialog } from '@/components/ui/Dialog'
import { Badge, EmptyState, LoadingRows, Spinner } from '@/components/ui/Feedback'
import { useLoggedUser, useManagedUsers } from '@/lib/hooks'
import { UsersService, type ManagedUser } from '@/services/users'

type StatusFilter = 'active' | 'archived' | 'all'

type PendingAction = { type: 'delete' | 'reset' | 'archive'; user: ManagedUser }

export default function AdminUsersPage() {
  const { data, loading, reload } = useManagedUsers()
  const { user: currentUser } = useLoggedUser()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [working, setWorking] = useState(false)
  const [mailListsOpen, setMailListsOpen] = useState(false)
  const [filter, setFilter] = useState<StatusFilter>('active')

  const users = useMemo(
    () => [...data].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [data],
  )
  const adminCount = users.filter((entry) => entry.isAdmin && !entry.archived).length
  const visibleUsers = users.filter(
    (entry) =>
      filter === 'all' || (filter === 'archived' ? entry.archived : !entry.archived),
  )

  const isSelf = (entry: ManagedUser) => currentUser?.login === entry.login
  const isLastAdmin = (entry: ManagedUser) =>
    entry.isAdmin && !entry.archived && adminCount <= 1
  // Removing your own admin role locks you out of this very page; the last
  // admin leaving does the same for everyone.
  const lockAdmin = (entry: ManagedUser) => isSelf(entry) || isLastAdmin(entry)

  const unarchive = async (entry: ManagedUser) => {
    try {
      await UsersService.unarchiveManagedUser(entry.id)
      toast.success('Usuário reativado')
      await reload()
    } catch {
      toast.error('Não foi possível reativar o usuário')
    }
  }

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
      } else if (pending.type === 'archive') {
        await UsersService.archiveManagedUser(pending.user.id)
        toast.success('Usuário arquivado')
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
        actions={
          <>
            <Select
              aria-label="Filtrar usuários"
              value={filter}
              onChange={(event) => setFilter(event.target.value as StatusFilter)}
              className="w-44"
            >
              <option value="active">Ativos</option>
              <option value="archived">Arquivados</option>
              <option value="all">Todos</option>
            </Select>
            <Button variant="outline" onClick={() => setMailListsOpen(true)}>
              Listas de e-mail
            </Button>
            <Button onClick={openCreate}>Novo usuário</Button>
          </>
        }
      />

      {loading ? (
        <LoadingRows rows={6} />
      ) : visibleUsers.length === 0 ? (
        <EmptyState
          title={
            users.length === 0
              ? 'Nenhum usuário cadastrado'
              : filter === 'archived'
                ? 'Nenhum usuário arquivado'
                : 'Nenhum usuário ativo'
          }
        />
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
            {visibleUsers.map((entry) => (
              <tr key={entry.id} className={entry.archived ? 'opacity-60' : undefined}>
                <Td>
                  <span className="font-medium">{entry.name || '—'}</span>
                  {entry.archived && (
                    <Badge tone="neutral" className="ml-2">
                      Arquivado
                    </Badge>
                  )}
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
                  <ActionMenu
                    label={`Ações de ${entry.name || entry.login}`}
                    items={[
                      { label: 'Editar', onSelect: () => openEdit(entry) },
                      {
                        label: 'Redefinir senha',
                        disabled: entry.usesDefaultPassword,
                        onSelect: () => setPending({ type: 'reset', user: entry }),
                      },
                      entry.archived
                        ? { label: 'Reativar', onSelect: () => unarchive(entry) }
                        : {
                            label: 'Arquivar',
                            disabled: isSelf(entry) || isLastAdmin(entry),
                            onSelect: () => setPending({ type: 'archive', user: entry }),
                          },
                      {
                        label: 'Excluir',
                        danger: true,
                        disabled: isSelf(entry) || isLastAdmin(entry),
                        onSelect: () => setPending({ type: 'delete', user: entry }),
                      },
                    ]}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <MailListsDialog open={mailListsOpen} onClose={() => setMailListsOpen(false)} />

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
        title={
          pending?.type === 'delete'
            ? 'Excluir usuário?'
            : pending?.type === 'archive'
              ? 'Arquivar usuário?'
              : 'Redefinir a senha?'
        }
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
              ) : pending?.type === 'archive' ? (
                'Arquivar'
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
        ) : pending?.type === 'archive' ? (
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">
              {pending.user.name || pending.user.login}
            </strong>{' '}
            não consegue mais entrar no painel e, se estiver com ele aberto, é deslogada
            no próximo acesso. O histórico fica como está e você pode reativar o acesso
            quando quiser.
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

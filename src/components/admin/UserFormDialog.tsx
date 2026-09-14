'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Checkbox, Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { UsersService, validateLogin, type ManagedUser } from '@/services/users'

type FormValues = {
  login: string
  name: string
  email: string
  isAdmin: boolean
}

export function UserFormDialog({
  open,
  editing,
  lockAdmin,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: ManagedUser | null
  /** Keep the admin toggle on — editing yourself or the last remaining admin. */
  lockAdmin: boolean
  onClose: () => void
  onSaved: () => Promise<void> | void
}) {
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  useEffect(() => {
    if (!open) return
    setFormError('')
    reset(
      editing
        ? {
            login: editing.login,
            name: editing.name,
            email: editing.email,
            isAdmin: editing.isAdmin,
          }
        : { login: '', name: '', email: '', isAdmin: false },
    )
  }, [open, editing, reset])

  const onSubmit = async (values: FormValues) => {
    setFormError('')
    try {
      const isAdmin = lockAdmin ? true : values.isAdmin
      if (editing) {
        await UsersService.updateManagedUser(
          editing.id,
          { name: values.name, email: values.email, isAdmin },
          editing.roles,
        )
        toast.success('Usuário atualizado')
      } else {
        await UsersService.createManagedUser({ ...values, isAdmin })
        toast.success('Usuário criado')
      }
      await onSaved()
      onClose()
    } catch (cause) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Tente novamente.',
      )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? `Editar ${editing.name || editing.login}` : 'Novo usuário'}
      description={
        editing
          ? undefined
          : 'A senha inicial é a senha padrão da equipe. No primeiro acesso a pessoa define a própria senha.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button form="user-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : editing ? (
              'Salvar'
            ) : (
              'Criar usuário'
            )}
          </Button>
        </>
      }
    >
      <form
        id="user-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Login"
          required
          readOnly={Boolean(editing)}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          placeholder="nome.sobrenome"
          hint={
            editing
              ? 'O login não muda depois de criado.'
              : 'Só letras minúsculas, números, ponto, hífen e sublinhado.'
          }
          error={errors.login?.message}
          {...register('login', {
            required: 'Informe o login.',
            validate: (value) => (editing ? true : (validateLogin(value) ?? true)),
          })}
        />

        <Input
          label="Nome"
          required
          placeholder="Maria Silva"
          hint="Aparece no histórico de status dos pedidos."
          error={errors.name && 'Informe o nome.'}
          {...register('name', { required: true })}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="maria@exemplo.com"
          hint="Usado nos avisos automáticos, como o de pedidos parados."
          error={errors.email && 'E-mail inválido.'}
          {...register('email', {
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'inválido' },
          })}
        />

        <Checkbox
          label="Acesso de administrador"
          hint={
            lockAdmin
              ? 'Não é possível remover: precisa haver ao menos um administrador, e você não pode remover o seu próprio acesso.'
              : 'Libera as seções restritas: gerenciamento, visitas, cupons, cromatografias, relatórios e usuários.'
          }
          disabled={lockAdmin}
          {...register('isAdmin')}
        />

        {formError && (
          <p
            role="alert"
            className="rounded-lg bg-danger-tint px-3 py-2 text-sm font-medium text-danger"
          >
            {formError}
          </p>
        )}
      </form>
    </Dialog>
  )
}

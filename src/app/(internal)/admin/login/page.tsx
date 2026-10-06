'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { Wordmark } from '@/components/site/Wordmark'
import {
  MIN_PASSWORD_LENGTH,
  UsersService,
  validateNewPassword,
  type AuthResult,
  type IdentifiedUser,
} from '@/services/users'

const cardStyles = 'mt-10 rounded-2xl bg-surface p-8 shadow-float'

function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-4 rounded-lg bg-danger-tint px-3 py-2 text-sm font-medium text-danger"
    >
      {message}
    </p>
  )
}

export default function AdminLoginPage() {
  const router = useRouter()
  /** Set once credentials check out but the password on file is still the default. */
  const [pendingUser, setPendingUser] = useState<IdentifiedUser | null>(null)

  const startSession = (user: IdentifiedUser) => {
    UsersService.storeUser(user)
    router.replace('/admin')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-brand-darkest px-4 py-16">
      <div className="w-full max-w-sm">
        <Wordmark tone="light" size="md" className="justify-center" />

        {pendingUser ? (
          <NewPasswordForm user={pendingUser} onDone={startSession} />
        ) : (
          <CredentialsForm
            onAuthenticated={({ user, mustChangePassword }) =>
              mustChangePassword ? setPendingUser(user) : startSession(user)
            }
          />
        )}
      </div>
    </main>
  )
}

type LoginForm = { login: string; password: string }

function CredentialsForm({
  onAuthenticated,
}: {
  onAuthenticated: (result: AuthResult) => void
}) {
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = async ({ login, password }: LoginForm) => {
    setError('')
    try {
      const result = await UsersService.getUserAuth(login, password)
      if (!result) {
        setError('Login ou senha incorretos.')
        return
      }
      onAuthenticated(result)
    } catch (cause) {
      // A denied read or an offline Firestore is indistinguishable from wrong
      // credentials in the UI — log it so it is not indistinguishable in the
      // console too.
      console.error('Falha ao autenticar no painel', cause)
      setError('Não conseguimos entrar agora. Tente novamente em instantes.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cardStyles} noValidate>
      <h1 className="font-display text-xl font-semibold text-ink">
        Painel administrativo
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Acesso restrito à equipe.</p>

      <div className="mt-6 space-y-4">
        <Input
          label="Login"
          autoComplete="username"
          autoFocus
          {...register('login', { required: true })}
        />
        <PasswordInput
          label="Senha"
          autoComplete="current-password"
          {...register('password', { required: true })}
        />
      </div>

      {error && <FormError message={error} />}

      <Button type="submit" className="mt-6 w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Entrar'}
      </Button>
    </form>
  )
}

type NewPasswordFormValues = { password: string; confirmation: string }

/**
 * The gate for accounts still on the seeded password: the session is only
 * stored after the new password lands in Firestore, so closing the tab here
 * leaves the account exactly as it was — and the next login asks again.
 */
function NewPasswordForm({
  user,
  onDone,
}: {
  user: IdentifiedUser
  onDone: (user: IdentifiedUser) => void
}) {
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordFormValues>()

  const onSubmit = async ({ password }: NewPasswordFormValues) => {
    setError('')
    try {
      await UsersService.updatePassword(user.id, password)
      onDone(user)
    } catch (cause) {
      console.error('Falha ao atualizar a senha', cause)
      setError('Não conseguimos salvar a nova senha. Tente novamente em instantes.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cardStyles} noValidate>
      <h1 className="font-display text-xl font-semibold text-ink">Crie uma nova senha</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {user.name.split(' ')[0]}, sua conta ainda usa a senha padrão da equipe. Defina
        uma senha só sua para continuar.
      </p>

      <div className="mt-6 space-y-4">
        <PasswordInput
          label="Nova senha"
          autoComplete="new-password"
          autoFocus
          hint={`Ao menos ${MIN_PASSWORD_LENGTH} caracteres.`}
          error={errors.password?.message}
          {...register('password', {
            required: 'Informe a nova senha.',
            validate: (value) => validateNewPassword(value) ?? true,
          })}
        />
        <PasswordInput
          label="Repita a nova senha"
          autoComplete="new-password"
          error={errors.confirmation?.message}
          {...register('confirmation', {
            required: 'Repita a nova senha.',
            validate: (value, values) =>
              value.trim() === values.password.trim() || 'As senhas não conferem.',
          })}
        />
      </div>

      {error && <FormError message={error} />}

      <Button type="submit" className="mt-6 w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Salvar e entrar'}
      </Button>
    </form>
  )
}

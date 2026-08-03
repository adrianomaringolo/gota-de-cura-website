'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { Wordmark } from '@/components/site/Wordmark'
import { UsersService } from '@/services/users'

type LoginForm = { login: string; password: string }

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = async ({ login, password }: LoginForm) => {
    setError('')
    try {
      const user = await UsersService.getUserAuth(login.trim().toLowerCase(), password)
      if (!user) {
        setError('Login ou senha incorretos.')
        return
      }
      UsersService.storeUser(user)
      router.replace('/admin')
    } catch {
      setError('Não conseguimos entrar agora. Tente novamente em instantes.')
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-brand-darkest px-4 py-16">
      <div className="w-full max-w-sm">
        <Wordmark tone="light" size="md" className="justify-center" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-10 rounded-2xl bg-surface p-8 shadow-float"
          noValidate
        >
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

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-danger-tint px-3 py-2 text-sm font-medium text-danger"
            >
              {error}
            </p>
          )}

          <Button type="submit" className="mt-6 w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  )
}

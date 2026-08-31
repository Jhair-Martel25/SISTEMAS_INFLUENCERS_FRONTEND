'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { homeSegunRol } from '@/config/roles'
import { loginSchema } from '@/features/auth/schemas/login.schema'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/button'

interface FormErrors {
  email?: string
  password?: string
}

/** Devuelve la ruta interna a la que volver tras el login (si el proxy la indicó). */
function getRedirectTarget(): string | null {
  const redirect = new URLSearchParams(window.location.search).get('redirect')
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return null
}

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setApiError('')

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const user = await login({ email, password, recordar: rememberMe })
      router.push(getRedirectTarget() ?? homeSegunRol(user.role))
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Error al iniciar sesión',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {apiError && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{apiError}</p>
        </div>
      )}

      <InputField
        id="email"
        label="Correo electrónico"
        type="email"
        placeholder="nombre@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        className="h-12"
        icon={<Mail className="h-5 w-5" />}
      />

      <InputField
        id="password"
        label="Contraseña"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        className="h-12"
        togglePassword
        icon={<Lock className="h-5 w-5" />}
      />

      <div className="pt-1">
        <label className="flex w-fit cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-5 w-5 rounded-md border-border text-primary accent-primary"
          />
          <span className="text-sm text-muted-foreground">Recordarme</span>
        </label>
      </div>

      <Button type="submit" className="h-12 w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Ingresando...
          </>
        ) : (
          <>
            Ingresar
            <ArrowRight />
          </>
        )}
      </Button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-[10px] font-medium tracking-[0.3em] text-muted-foreground">
            SISTEMA AUTOMATIZADO
          </span>
        </div>
      </div>
    </form>
  )
}

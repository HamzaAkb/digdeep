import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { apiFetch } from '@/lib/api'
import { auth } from '@/lib/auth'

const confirmEmailSearchSchema = z.object({
  token: z.string(),
})

export const Route = createFileRoute('/confirm-email')({
  validateSearch: confirmEmailSearchSchema,
  loader: async ({ search, context }) => {
    try {
      const response = await apiFetch(
        `/auth/confirm-email?token=${search.token}`,
        { method: 'POST' }
      )

      const data = await response.json()

      await context.auth.login({
        email: data.email,
        password: data.temp_password,
      })

      throw redirect({
        to: '/dashboard',
      })
    } catch (error: any) {
      console.error('Email confirmation failed:', error)
      throw redirect({
        to: '/',
        search: {
          error: error.message || 'Invalid or expired confirmation link.',
        },
      })
    }
  },
})
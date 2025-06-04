import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        toast.error('Invalid verification link')
        navigate('/auth')
        return
      }

      try {
        const response = await api.get(`/verify-email/${token}`)
        const data = response.data

        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user_details', JSON.stringify(data.user))

        toast.success('Email verified successfully!')
        navigate('/dashboard')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Email verification failed')
        navigate('/auth')
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams, navigate])

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return null
} 
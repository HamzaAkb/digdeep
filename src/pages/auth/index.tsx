import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function AuthPage() {
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_URL

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [signupData, setSignupData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  })
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingSignup, setLoadingSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoadingLogin(true)
    try {
      const params = new URLSearchParams()
      params.append('grant_type', '')
      params.append('username', loginData.username)
      params.append('password', loginData.password)
      params.append('scope', '')
      params.append('client_id', '')
      params.append('client_secret', '')

      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params.toString(),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || res.statusText)

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user_details', JSON.stringify(data.user_details))
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoadingLogin(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoadingSignup(true)
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: signupData.name,
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || res.statusText)

      setActiveTab('signin')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoadingSignup(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl text-center'>Agentlytics</CardTitle>
          <CardDescription className='text-center'>
            {activeTab === 'signin'
              ? 'Sign in to your account'
              : 'Create a new account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='signin'>Sign In</TabsTrigger>
              <TabsTrigger value='signup'>Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value='signin' className='space-y-4 mt-2'>
              <form onSubmit={handleLogin} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='signin-username'>Username</Label>
                  <Input
                    id='signin-username'
                    type='text'
                    placeholder='yourusername'
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signin-password'>Password</Label>
                  <Input
                    id='signin-password'
                    type='password'
                    placeholder='••••••••'
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {error && <p className='text-sm text-red-600'>{error}</p>}
                <Button
                  className='w-full flex items-center justify-center'
                  type='submit'
                  disabled={loadingLogin}
                >
                  {loadingLogin && (
                    <Loader2 className='animate-spin h-4 w-4 mr-2' />
                  )}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value='signup' className='space-y-4 mt-2'>
              <form onSubmit={handleSignup} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='signup-name'>Full Name</Label>
                  <Input
                    id='signup-name'
                    type='text'
                    placeholder='Your name'
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signup-username'>Username</Label>
                  <Input
                    id='signup-username'
                    type='text'
                    placeholder='yourusername'
                    value={signupData.username}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signup-email'>Email</Label>
                  <Input
                    id='signup-email'
                    type='email'
                    placeholder='name@example.com'
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signup-password'>Password</Label>
                  <Input
                    id='signup-password'
                    type='password'
                    placeholder='••••••••'
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {error && <p className='text-sm text-red-600'>{error}</p>}
                <Button
                  className='w-full flex items-center justify-center'
                  type='submit'
                  disabled={loadingSignup}
                >
                  {loadingSignup && (
                    <Loader2 className='animate-spin h-4 w-4 mr-2' />
                  )}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

import { Routes, Route, Navigate, Outlet } from 'react-router'
import Agents from '@/pages/agents'
import AuthPage from '@/pages/auth'
import Home from './pages/home'
import ConfirmEmail from '@/pages/auth/confirm-email'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

function PrivateRoute() {
  const token = localStorage.getItem('access_token')
  return token ? <Outlet /> : <Navigate to='/auth' replace />
}

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='w-full h-[100vh] mx-6'>
        <div className='flex items-center mt-2'>
          <SidebarTrigger className='size-4' />
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path='/auth' element={<AuthPage />} />
        <Route path='/confirm-email' element={<ConfirmEmail />} />

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/session/:sessionId' element={<Agents />} />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      
      <Toaster />
    </>
  )
}

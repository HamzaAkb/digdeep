import { Routes, Route } from 'react-router'
import Agents from '@/pages/agents'
import Home from '@/pages/home'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className='w-full h-[100vh] mx-6'>
        <div className='flex items-center mt-2'>
          <SidebarTrigger className='size-4' />
        </div>

        <Routes>
          <Route path='/' element={<Home />} />

          <Route path='/session/:sessionId' element={<Agents />} />
        </Routes>
      </main>
    </SidebarProvider>
  )
}

export default App

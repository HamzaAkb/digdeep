import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import Agents from '@/pages/agents'

function App() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className='w-full h-[100vh] mx-6'>
          <div className='flex items-center mt-2'>
            <SidebarTrigger className='size-4' />
            <div className='ml-2 font-semibold'>Landing Agent</div>
          </div>
          <Agents />
        </main>
      </SidebarProvider>
    </>
  )
}

export default App

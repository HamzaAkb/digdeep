import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import Chatbot from './components/chatbot'
import Tools from './components/tools'

function Agents() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className='w-full h-[100vh] mx-6'>
          <div className='flex items-center mt-2'>
            <SidebarTrigger />
            <div className='ml-2 font-bold'>Landing Agent</div>
          </div>
          <div className='flex justify-center mt-8'>
            <ResizablePanelGroup direction='horizontal'>
              <ResizablePanel defaultSize={35}>
                <Chatbot />
              </ResizablePanel>
              <ResizableHandle
                withHandle
                className='border border-white dark:border-black'
              />
              <ResizablePanel className='border rounded-lg hidden md:block'>
                <Tools />
              </ResizablePanel>
            </ResizablePanelGroup>
            {/* <div>
              <SidebarProvider defaultOpen={false}>
                <Sidebar collapsible='icon' side='right'>
                  <SidebarTrigger />
                </Sidebar>
              </SidebarProvider>
            </div> */}
          </div>
        </main>
      </SidebarProvider>
    </>
  )
}

export default Agents

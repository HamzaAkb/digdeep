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

function App() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className='w-full h-[100vh]'>
          <SidebarTrigger />
          <div className='flex justify-center'>
            <ResizablePanelGroup direction='horizontal'>
              <ResizablePanel>
                <div className='flex-1/2 max-w-4xl flex flex-col justify-between h-[90vh]'>
                  <div className='flex-1 overflow-y-auto overflow-x-hidden'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Aliquam eu sagittis nulla. Donec suscipit aliquam blandit.
                    Integer magna dui, efficitur ut mattis nec, vestibulum vitae
                    lacus. Nunc efficitur congue est ut scelerisque. Integer
                    laoreet sit amet turpis ac consequat. Mauris nec dapibus
                    felis. Proin sollicitudin, ante sed posuere molestie, urna
                    dolor pulvinar sapien, eget mattis sapien magna at nisl. Sed
                    non faucibus lectus. Aliquam venenatis, justo tincidunt
                    aliquam iaculis, felis lorem mattis leo, placerat faucibus
                    tortor risus sit amet velit. Quisque ante lectus, finibus
                    non tincidunt vel, scelerisque vel ante. Donec sed odio sem.
                  </div>
                  <div>
                    <input placeholder='Type here' />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel>
                {' '}
                <div className='flex-1/2'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aliquam eu sagittis nulla. Donec suscipit aliquam blandit.
                  Integer magna dui, efficitur ut mattis nec, vestibulum vitae
                  lacus. Nunc efficitur congue est ut scelerisque. Integer
                  laoreet sit amet turpis ac consequat. Mauris nec dapibus
                  felis. Proin sollicitudin, ante sed posuere molestie, urna
                  dolor pulvinar sapien, eget mattis sapien magna at nisl. Sed
                  non faucibus lectus. Aliquam venenatis, justo tincidunt
                  aliquam iaculis, felis lorem mattis leo, placerat faucibus
                  tortor risus sit amet velit. Quisque ante lectus, finibus non
                  tincidunt vel, scelerisque vel ante. Donec sed odio sem.
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
            <div>
              <SidebarProvider>
                <Sidebar collapsible='icon' side='right'>
                  <SidebarTrigger />
                </Sidebar>
              </SidebarProvider>
            </div>
          </div>
        </main>
      </SidebarProvider>
    </>
  )
}

export default App

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
      </div>
    </>
  )
}

export default Agents

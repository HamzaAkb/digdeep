import { ChatProvider } from '@/contexts/chat-context'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import Chatbot from './components/chatbot'
import Tools from './components/tools'
import ClarificationDialog from './components/clarification-dialog'
import { useParams } from 'react-router'

export default function Agents() {
  const { sessionId } = useParams<{ sessionId: string }>()

  return (
    <>
      <ClarificationDialog />

      <div className='flex justify-center mt-8'>
        <ChatProvider>
          <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel defaultSize={35}>
              <Chatbot />
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className='border border-white dark:border-black'
            />

            <ResizablePanel className='border rounded-lg hidden md:block'>
              <Tools key={sessionId} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ChatProvider>
      </div>
    </>
  )
}

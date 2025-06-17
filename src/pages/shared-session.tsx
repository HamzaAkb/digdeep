import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import api from '@/lib/api'
import { ChatProvider } from '@/contexts/chat-context'
import Chatbot from '@/pages/agents/components/chatbot'
import Files from '@/pages/agents/components/files'

const VISITOR_IDS_KEY = 'shared_session_visitor_ids'

interface SharedSessionInfo {
  share_token: string
  label: string
  kind: string
  expires_at: string
}

interface BootstrapResponse {
  visitor_id: string
  first_visit: boolean
  kind: string
  label: string
  expires_at: string
}

export default function SharedSession() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const navigate = useNavigate()
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [sessionInfo, setSessionInfo] = useState<SharedSessionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getVisitorIds = (): Record<string, string> => {
    const stored = localStorage.getItem(VISITOR_IDS_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  const saveVisitorId = (shareToken: string, visitorId: string) => {
    const visitorIds = getVisitorIds()
    visitorIds[shareToken] = visitorId
    localStorage.setItem(VISITOR_IDS_KEY, JSON.stringify(visitorIds))
  }

  useEffect(() => {
    const initializeSession = async () => {
      if (!shareToken) return

      try {
        const sessionResponse = await api.get<SharedSessionInfo>(`/public/${shareToken}`)
        const sessionData = sessionResponse.data

        if (new Date(sessionData.expires_at) < new Date()) {
          toast.error('This shared session has expired')
          navigate('/')
          return
        }

        setSessionInfo(sessionData)

        const visitorIds = getVisitorIds()
        let currentVisitorId = visitorIds[shareToken]

        if (!currentVisitorId) {
          currentVisitorId = uuidv4()
          await api.post<BootstrapResponse>(
            `/public/${shareToken}/bootstrap`,
            {},
            {
              headers: {
                'X-Visitor-Id': currentVisitorId
              }
            }
          )
          saveVisitorId(shareToken, currentVisitorId)
        }

        setVisitorId(currentVisitorId)
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to load shared session'
        setError(errorMessage)
        toast.error(errorMessage)
        if (err.response?.status === 404) {
          navigate('/')
        }
      } finally {
        setLoading(false)
      }
    }

    initializeSession()
  }, [shareToken, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="flex h-14 items-center px-6">
            <span className="text-xl font-semibold">DigDeep</span>
          </div>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          Loading shared session...
        </div>
      </div>
    )
  }

  if (error || !sessionInfo || !visitorId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="flex h-14 items-center px-6">
            <span className="text-xl font-semibold">DigDeep</span>
          </div>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-red-600">
          {error || 'Failed to load session'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b">
        <div className="flex h-14 items-center px-6">
          <span className="text-xl font-semibold">DigDeep</span>
          {sessionInfo.label && (
            <span className="ml-4 text-sm text-muted-foreground">
              {sessionInfo.label}
            </span>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-3.5rem)] p-6">
        <div className="flex h-full gap-6">
          <div className="w-1/4 h-full rounded-lg">
            <ChatProvider
              isSharedSession={true}
              visitorId={visitorId}
            >
              <Chatbot />
            </ChatProvider>
          </div>
          <div className="w-3/4 h-full border rounded-lg">
            <Files
              isSharedSession={true}
              visitorId={visitorId}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
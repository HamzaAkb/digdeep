import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useMatch } from 'react-router'
import { toast } from 'sonner'
import api from '@/lib/api'
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import SessionDialog from '@/pages/agents/components/session-dialog'
import { SessionItemDropdown } from './session-item-dropdown'

type SessionItem = {
  session_id: string
  name: string | null
}

export function SessionList() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const ITEMS_PER_PAGE = 25

  const match = useMatch('/session/:sessionId')
  const activeSessionId = match?.params.sessionId

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/session/${sessionId}`)
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
      toast.success('Session deleted successfully')
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Failed to delete session'
      )
    }
  }

  const handleShareSession = async (sessionId: string, email: string) => {
    try {
      await api.post(`/session/${sessionId}/share`, { email })
      toast.success('Session shared successfully')
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Failed to share session'
      )
    }
  }

  const lastSessionElementRef = useCallback((node: HTMLLIElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  const loadSessions = useCallback(async (pageNum: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<{ data: SessionItem[], total: number }>(
        '/session/user/sessions',
        { params: { page: pageNum, items_per_page: ITEMS_PER_PAGE } }
      )

      setSessions(prev => {
        if (pageNum === 1) return res.data.data
        return [...prev, ...res.data.data]
      })
      
      setHasMore(res.data.data.length === ITEMS_PER_PAGE)
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Failed to load sessions'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions(page)
  }, [page, loadSessions])

  return (
    <SidebarGroup>
      <div className='flex items-center justify-between'>
        <SidebarGroupLabel>Sessions</SidebarGroupLabel>
        <SidebarGroupAction>
          <SessionDialog />
        </SidebarGroupAction>
      </div>

      <SidebarGroupContent>
        <SidebarMenu>
          {error && (
            <SidebarMenuItem>
              <div className='px-2 py-1 text-sm text-red-600'>{error}</div>
            </SidebarMenuItem>
          )}
          {sessions.map((sess, index) => {
            const title = sess.name?.trim() || 'Untitled Session'
            const isActive = sess.session_id === activeSessionId
            const isLastElement = index === sessions.length - 1
            
            return (
              <SidebarMenuItem
                key={sess.session_id}
                ref={isLastElement ? lastSessionElementRef : null}
                className={`group transition-colors duration-200 ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <SidebarMenuButton asChild>
                  <Link
                    to={`/session/${sess.session_id}`}
                    className='flex items-center justify-between w-full px-3 py-2'
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.dropdown-trigger')) {
                        e.preventDefault()
                      }
                    }}
                  >
                    <span className={`truncate ${isActive ? 'font-medium' : ''}`}>
                      {title}
                    </span>
                    <SessionItemDropdown
                      sessionId={sess.session_id}
                      onDelete={handleDeleteSession}
                      onShare={handleShareSession}
                    />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
          {loading && (
            <SidebarMenuItem>
              <div className='px-3 py-2 text-sm text-gray-500'>
                Loading more sessions...
              </div>
            </SidebarMenuItem>
          )}
          {!loading && !error && sessions.length === 0 && (
            <SidebarMenuItem>
              <div className='px-3 py-2 text-sm text-gray-500'>
                No sessions found.
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 
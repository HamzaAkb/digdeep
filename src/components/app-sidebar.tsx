import { useState, useEffect } from 'react'
import { Link, useMatch } from 'react-router'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from './mode-toggle'
import { LogoutButton } from './logout-button'
import SessionDialog from '@/pages/agents/components/session-dialog'
import { SessionItemDropdown } from './session-item-dropdown'

type SessionItem = {
  session_id: string
  name: string | null
}

export function AppSidebar() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    let cancelled = false

    async function loadSessions() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<{ data: SessionItem[] }>(
          '/session/user/sessions',
          { params: { page: 1, items_per_page: 10 } }
        )
        if (!cancelled) {
          setSessions(res.data.data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              err.response?.data?.message ||
              err.message ||
              'Failed to load sessions'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSessions()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center gap-2 ml-1 my-2'>
          <img className='size-6' src='/vite.svg' alt='Logo' />
          <span className='font-semibold text-lg'>Dig Deep</span>
        </div>
      </SidebarHeader>
      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <div className='flex items-center justify-between'>
            <SidebarGroupLabel>Sessions</SidebarGroupLabel>
            <SidebarGroupAction>
              <SessionDialog />
            </SidebarGroupAction>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {loading && (
                <SidebarMenuItem>
                  <div className='px-2 py-1 text-sm text-gray-500'>
                    Loading…
                  </div>
                </SidebarMenuItem>
              )}
              {error && (
                <SidebarMenuItem>
                  <div className='px-2 py-1 text-sm text-red-600'>{error}</div>
                </SidebarMenuItem>
              )}
              {!loading &&
                !error &&
                sessions.map((sess) => {
                  const title = sess.name?.trim() || 'Untitled Session'
                  const isActive = sess.session_id === activeSessionId
                  return (
                    <SidebarMenuItem
                      key={sess.session_id}
                      className={
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-800 font-semibold'
                          : ''
                      }
                    >
                      <SidebarMenuButton asChild>
                        <Link
                          to={`/session/${sess.session_id}`}
                          className='flex items-center space-x-2 px-2 py-1'
                        >
                          <MessageSquare className='h-4 w-4' />
                          <span>{title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <SessionItemDropdown
                        sessionId={sess.session_id}
                        onDelete={handleDeleteSession}
                      />
                    </SidebarMenuItem>
                  )
                })}
              {!loading && !error && sessions.length === 0 && (
                <SidebarMenuItem>
                  <div className='px-2 py-1 text-sm text-gray-500'>
                    No sessions found.
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex w-full gap-2 px-2">
          <div className="w-1/2">
            <ModeToggle />
          </div>
          <div className="w-1/2">
            <LogoutButton />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

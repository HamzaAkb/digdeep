import { useState, useEffect } from 'react'
import { Link, useMatch } from 'react-router'
import { MessageSquare } from 'lucide-react'
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
import SessionDialog from '@/pages/agents/components/session-dialog'

type SessionItem = {
  session_id: string
  name: string | null
}

export function AppSidebar() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = import.meta.env.VITE_API_URL
  const TOKEN = import.meta.env.VITE_TOKEN

  const match = useMatch('/session/:sessionId')
  const activeSessionId = match?.params.sessionId

  useEffect(() => {
    let cancelled = false

    async function loadSessions() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE}/session/user/sessions?page=1&items_per_page=10`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        )
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.detail || res.statusText)
        }
        const json = await res.json()
        if (!cancelled) {
          setSessions(json.data)
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSessions()
    return () => {
      cancelled = true
    }
  }, [API_BASE, TOKEN])

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
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}

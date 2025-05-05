import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { ModeToggle } from './mode-toggle'
import { AlignHorizontalSpaceBetween } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import SessionDialog from '@/pages/agents/components/session-dialog'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center gap-2 ml-1 my-2'>
          <AlignHorizontalSpaceBetween />
          <span className='font-semibold text-lg'>Dig Deep</span>
        </div>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className='flex items-center'>
            <SidebarGroupLabel>Sessions</SidebarGroupLabel>
            <SidebarGroupAction>
              <SessionDialog />
            </SidebarGroupAction>
          </div>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}

import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { ModeToggle } from './mode-toggle'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent />
      <SidebarFooter><ModeToggle /></SidebarFooter>
    </Sidebar>
  )
}

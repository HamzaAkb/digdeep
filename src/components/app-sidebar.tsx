import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from './mode-toggle'
import { LogoutButton } from './logout-button'
import { SessionList } from './session-list'

export function AppSidebar() {
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
        <SessionList />
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

import type { ReactNode } from 'react'

export type ScreenId = 'dashboard' | 'marketplace' | 'harvest' | 'ledger' | 'advisory' | 'report' | 'settings'

export type SidebarItem = {
  id: ScreenId
  title: string
  icon: ReactNode
}

export type SidebarProps = {
  items: SidebarItem[]
}

export type AuthPageShellProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

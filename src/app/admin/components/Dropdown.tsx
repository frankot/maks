'use client'

import { useState, ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface DropdownAction {
  label: string
  icon: ReactNode
  onClick: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  separator?: boolean
  disabled?: boolean
  disabledTooltip?: string
}

interface AdminDropdownProps {
  actions: DropdownAction[]
  disabled?: boolean
}

export function AdminDropdown({ actions, disabled = false }: AdminDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleActionClick = async (action: DropdownAction) => {
    setIsLoading(true)
    try {
      await action.onClick()
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={disabled || isLoading}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => (
            <div key={index}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              {action.disabled && action.disabledTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenuItem
                        disabled
                        className={`cursor-not-allowed opacity-50 ${
                          action.variant === 'destructive' ? 'text-red-600' : ''
                        }`}
                      >
                        {action.icon}
                        {action.label}
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.disabledTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className={`${action.variant === 'destructive' ? 'text-red-600' : ''} ${
                    action.disabled ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              )}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

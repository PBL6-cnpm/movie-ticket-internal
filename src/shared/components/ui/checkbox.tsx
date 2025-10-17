import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer size-4 shrink-0 rounded-[4px] border shadow-xs transition-all outline-none',
                'border-input dark:bg-input/30',
                // Unchecked state
                'hover:border-primary/50 hover:bg-primary/5',
                // Checked state - much more visible
                'data-[state=checked]:bg-[#e86d28] data-[state=checked]:text-white',
                'data-[state=checked]:border-[#e86d28] data-[state=checked]:shadow-lg data-[state=checked]:shadow-[#e86d28]/30',
                'dark:data-[state=checked]:bg-[#e86d28] dark:data-[state=checked]:border-[#e86d28]',
                // Focus state
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                // Invalid state
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                // Disabled state
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-all scale-100 data-[state=unchecked]:scale-0"
            >
                <CheckIcon className="size-3.5 stroke-[3]" strokeWidth={3} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
}

export { Checkbox }

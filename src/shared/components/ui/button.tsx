import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'

//shared
import { buttonVariants } from '@/shared/components/ui/button-variants'

const Button = ({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) => {
    const Comp = asChild ? Slot : 'button'

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size }), 'cursor-pointer', className)}
            {...props}
        />
    )
}

export default Button

import * as React from "react"
import TextareaAutosize from "react-textarea-autosize"
import { cn } from "~/utils/cn"

interface TextareaProps extends React.ComponentProps<typeof TextareaAutosize> {
  className?: string
  minRows?: number
}

const TextareaAutoResize = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, minRows = 3, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          "flex w-full border border-input bg-gray-50 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        minRows={minRows}
        {...props}
      />
    )
  }
)
TextareaAutoResize.displayName = "TextareaAutoResize"

export { TextareaAutoResize }

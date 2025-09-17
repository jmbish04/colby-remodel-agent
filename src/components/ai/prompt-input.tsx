import * as React from "react"
import { Send, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface PromptInputProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const PromptInput = React.forwardRef<HTMLFormElement, PromptInputProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(
          "relative flex items-end gap-2 rounded-lg border bg-background p-3",
          className
        )}
        {...props}
      >
        {children}
      </form>
    )
  }
)
PromptInput.displayName = "PromptInput"

interface PromptInputTextareaProps 
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(({ className, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  
  React.useImperativeHandle(ref, () => textareaRef.current!)

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  React.useEffect(() => {
    adjustHeight()
  }, [adjustHeight, props.value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }
    props.onKeyDown?.(e)
  }

  return (
    <Textarea
      ref={textareaRef}
      className={cn(
        "min-h-[24px] resize-none border-0 p-0 shadow-none focus-visible:ring-0",
        className
      )}
      onInput={adjustHeight}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})
PromptInputTextarea.displayName = "PromptInputTextarea"

interface PromptInputSubmitProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: "loading" | "idle" | "error"
}

const PromptInputSubmit = React.forwardRef<
  HTMLButtonElement,
  PromptInputSubmitProps
>(({ className, status = "idle", children, ...props }, ref) => {
  const isLoading = status === "loading"
  
  return (
    <Button
      ref={ref}
      type="submit"
      size="icon"
      className={cn("shrink-0", className)}
      {...props}
    >
      {children || (
        isLoading ? (
          <Square className="h-4 w-4" />
        ) : (
          <Send className="h-4 w-4" />
        )
      )}
    </Button>
  )
})
PromptInputSubmit.displayName = "PromptInputSubmit"

export { PromptInput, PromptInputTextarea, PromptInputSubmit }

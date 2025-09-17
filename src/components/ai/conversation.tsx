import * as React from "react"
import { ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-4 relative flex-1", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Conversation.displayName = "Conversation"

interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ConversationContent = React.forwardRef<
  HTMLDivElement,
  ConversationContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <ScrollArea className="flex-1">
      <div
        ref={ref}
        className={cn("flex flex-col gap-4 p-4", className)}
        {...props}
      >
        {children}
      </div>
    </ScrollArea>
  )
})
ConversationContent.displayName = "ConversationContent"

interface ConversationScrollButtonProps {
  className?: string
  onClick?: () => void
}

const ConversationScrollButton = React.forwardRef<
  HTMLButtonElement,
  ConversationScrollButtonProps
>(({ className, onClick }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false)

  const handleScroll = React.useCallback(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      setIsVisible(!isAtBottom && scrollTop > 100)
    }
  }, [])

  React.useEffect(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const scrollToBottom = () => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
    onClick?.()
  }

  if (!isVisible) return null

  return (
    <Button
      ref={ref}
      size="icon"
      variant="outline"
      className={cn(
        "absolute bottom-4 right-4 rounded-full shadow-lg",
        className
      )}
      onClick={scrollToBottom}
    >
      <ArrowDown className="h-4 w-4" />
    </Button>
  )
})
ConversationScrollButton.displayName = "ConversationScrollButton"

export { Conversation, ConversationContent, ConversationScrollButton }

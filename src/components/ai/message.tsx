import * as React from "react"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: "user" | "assistant" | "system"
  children: React.ReactNode
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from, children, ...props }, ref) => {
    const isUser = from === "user"
    const isAssistant = from === "assistant"
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 max-w-full",
          isUser && "flex-row-reverse",
          className
        )}
        {...props}
      >
        <div className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
          isUser && "bg-primary text-primary-foreground",
          isAssistant && "bg-muted text-muted-foreground"
        )}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div className={cn(
          "flex flex-col gap-2 flex-1 min-w-0",
          isUser && "items-end"
        )}>
          {children}
        </div>
      </div>
    )
  }
)
Message.displayName = "Message"

interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("prose prose-sm max-w-none break-words", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MessageContent.displayName = "MessageContent"

export { Message, MessageContent }

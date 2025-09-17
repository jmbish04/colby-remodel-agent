import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Response = React.forwardRef<HTMLDivElement, ResponseProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0",
          // Custom prose styles for better message formatting
          "prose-headings:font-semibold prose-headings:text-foreground",
          "prose-p:text-foreground prose-li:text-foreground",
          "prose-strong:text-foreground prose-code:text-foreground",
          "prose-blockquote:border-l-primary prose-blockquote:text-foreground",
          "prose-hr:border-border",
          className
        )}
        {...props}
      >
        {typeof children === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: formatMessageContent(children) }} />
        ) : (
          children
        )}
      </div>
    )
  }
)
Response.displayName = "Response"

// Helper function to format message content with basic markdown support
function formatMessageContent(content: string): string {
  return content
    // Convert line breaks to paragraphs
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => {
      // Basic markdown formatting
      let formatted = paragraph
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Line breaks within paragraphs
        .replace(/\n/g, '<br>')
      
      return `<p>${formatted}</p>`
    })
    .join('')
}

export { Response }
